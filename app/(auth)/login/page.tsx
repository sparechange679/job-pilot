'use client';

import Link from "next/link";
import Image from "next/image";
import {useState} from 'react';
import posthog from 'posthog-js';
import {signInWithOAuth} from '@/app/actions/auth';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleLogin = async (provider: 'github' | 'google') => {
        posthog.capture('oauth_sign_in_started', {provider});
        setIsLoading(provider);
        try {
            await signInWithOAuth(provider);
        } catch (err) {
            // Next.js redirect throws an error, we should not catch it as a real error
            if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
                throw err;
            }
            console.error('Unexpected error during login:', err);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-8 shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <Image src="/logo.png" alt="JobPilot" width={100} height={100}/>
                    </Link>
                    <h1 className="text-xl font-semibold text-text-primary mb-2">Welcome to JobPilot</h1>
                    <p className="text-sm text-text-muted text-center">
                        Sign in to start finding and tailoring your next dream job.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin('google')}
                        disabled={!!isLoading}
                        className="w-full bg-surface border border-border text-text-primary px-4 py-3 rounded-lg text-sm font-medium hover:bg-surface-secondary transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    <button
                        onClick={() => handleLogin('github')}
                        disabled={!!isLoading}
                        className="w-full bg-text-darkest text-white px-4 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                        {isLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs text-text-muted text-center">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
