import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-surface border-t border-border py-12 px-6">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="JobPilot" width={100} height={100}/>
                </Link>

                <div className="flex items-center gap-8">
                    <Link href="/dashboard"
                          className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/privacy"
                          className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms"
                          className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
                        Terms & Condition
                    </Link>
                </div>
            </div>
        </footer>
    );
}
