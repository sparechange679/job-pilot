import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";

const blockedHosts = new Set(["localhost", "local", "internal", "test", "invalid", "example"]);

export function publicAddress(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [first, second, third] = address.split(".").map(Number);
  return !(
    first === 0 || first === 10 || first === 127 || first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) || (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 168 || second === 0 || (second === 88 && third === 99))) ||
    (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) ||
    (first === 203 && second === 0 && third === 113)
  );
}

export async function safePublicUrl(value: string): Promise<URL | null> {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
      host.length > 253 || host.endsWith(".") || host.includes("..") ||
      !/^[a-z0-9.-]+$/.test(host) || !host.includes(".") ||
      host.split(".").some((part) => !part || part.startsWith("-") || part.endsWith("-")) ||
      host.split(".").some((part) => blockedHosts.has(part)) || isIP(host)) {
      return null;
    }
    const addresses = await lookup(host, { all: true, verbatim: true });
    return addresses.length && addresses.every(({ address }) => publicAddress(address)) ? url : null;
  } catch {
    return null;
  }
}

async function headHop(url: URL): Promise<{ status: number; location: string | undefined }> {
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || !addresses.every(({ address }) => publicAddress(address))) {
    throw new Error("Unsafe redirect destination");
  }
  return new Promise((resolve, reject) => {
    const operation = request(url, {
      method: "HEAD",
      timeout: 4000,
      lookup: (_host, _options, callback) => callback(null, addresses[0].address, 4),
    }, (response) => {
      resolve({ status: response.statusCode ?? 0, location: response.headers.location });
      response.resume();
    });
    operation.on("timeout", () => operation.destroy(new Error("Redirect timed out")));
    operation.on("error", reject);
    operation.end();
  });
}

export async function employerHomepage(value: string | null, company: string): Promise<URL | null> {
  if (!value) return null;
  let url = await safePublicUrl(value);
  if (!url) return null;

  for (let hop = 0; hop < 5; hop++) {
    let response: { status: number; location: string | undefined };
    try {
      response = await headHop(url);
    } catch {
      return null;
    }
    if (response.status === 200 || response.status === 204 || response.status === 405) break;
    if (response.status < 300 || response.status >= 400) return null;
    const location = response.location;
    if (!location) return null;
    url = await safePublicUrl(new URL(location, url).href);
    if (!url) return null;
    if (hop === 4) return null;
  }

  const host = url.hostname.replace(/^(www|jobs|careers|apply)\./, "");
  const name = company.toLowerCase().replace(/\b(inc|llc|ltd|limited|corp|corporation)\b/g, "").replace(/[^a-z0-9]/g, "");
  if (host.includes("adzuna.") || name.length < 3 || !host.split(".")[0].replace(/[^a-z0-9]/g, "").includes(name)) {
    return null;
  }
  return safePublicUrl(`https://${host}/`);
}

export async function companyLinks(homepage: URL, links: { url: string; kind: string }[]): Promise<string[]> {
  const priority = ["about", "blog", "engineering", "product", "team", "careers", "other"];
  const result: string[] = [];
  for (const link of [...links].sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind))) {
    if (result.length === 3) break;
    let candidate: URL;
    try { candidate = new URL(link.url, homepage); } catch { continue; }
    if (candidate.hostname !== homepage.hostname || candidate.pathname === "/") continue;
    if (await safePublicUrl(candidate.href) && !result.includes(candidate.href)) result.push(candidate.href);
  }
  return result;
}