"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge-client";
import { signOut } from "@/app/actions/auth";
import posthog from "posthog-js";

export function Navbar({ initialUser }: { initialUser?: object | null }) {
    const [user, setUser] = useState<object | null>(initialUser || null);

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await insforge.auth.getCurrentUser();
            setUser(data?.user || null);
        };

        // Only fetch if we don't have an initial user or if we want to sync
        if (!initialUser) {
            checkUser();
        }
    }, [initialUser]);

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-surface z-50 px-6 border-b border-border">
            <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="JobPilot"
                        width={100}
                        height={100}
                    />
                </Link>

                <nav className="flex items-center gap-8">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
                        Dashboard
                    </Link>
                    <Link
                        href="/find-jobs"
                        className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
                        Find Jobs
                    </Link>
                    <Link
                        href="/profile"
                        className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
                        Profile
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <button
                            onClick={() => {
                                posthog.capture("user_signed_out");
                                posthog.reset();
                                signOut();
                            }}
                            className="text-sm font-medium text-text-dark hover:text-accent transition-colors cursor-pointer">
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-text-darkest text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                            Start for free
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
