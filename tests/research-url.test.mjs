import assert from "node:assert/strict";
import { test } from "node:test";

import { employerHomepage, publicAddress, safePublicUrl } from "../lib/research-url.ts";

test("rejects private, reserved, mapped and malformed network addresses", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "192.0.2.1", "198.51.100.1", "203.0.113.1", "::1", "::ffff:127.0.0.1", "not-an-address"]) {
    assert.equal(publicAddress(address), false, address);
  }
  assert.equal(publicAddress("8.8.8.8"), true);
});

test("rejects unsafe URLs before DNS resolution", async () => {
  for (const url of ["http://example.org", "https://user:pass@company.com", "https://localhost", "https://service.internal", "https://127.0.0.1", "https://example.com:8443", "https://bad-.com"]) {
    assert.equal(await safePublicUrl(url), null, url);
  }
});

test("does not browse without a verified job link", async () => {
  assert.equal(await employerHomepage(null, "Acme"), null);
  assert.equal(await employerHomepage("http://localhost", "Acme"), null);
});