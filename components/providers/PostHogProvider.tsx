'use client';

import { useEffect, type ReactNode } from 'react';
import posthog from 'posthog-js';
import { insforge } from '@/lib/insforge-client';

export function PostHogIdentity({ children }: { children: ReactNode }) {
  useEffect(() => {
    const identifyAuthenticatedUser = async () => {
      const { data } = await insforge.auth.getCurrentUser();
      const user = data?.user;

      if (!user?.id) {
        posthog.reset();
        return;
      }

      posthog.identify(user.id, {
        email: user.email,
        name: user.profile?.name,
      });
    };

    identifyAuthenticatedUser();
  }, []);

  return children;
}
