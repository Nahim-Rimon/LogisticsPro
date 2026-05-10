"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * Returns `true` once the Clerk session has loaded AND an org is active.
 *
 * If the user is signed in but has no active org, this hard-redirects to
 * `/onboarding` so the JWT minted on the next request actually contains
 * `org_id` (a soft router push reuses the cached, org-less token and the
 * backend rejects it with 403 "No active organisation").
 *
 * Use this gate in every dashboard page that calls the API:
 *
 *   const ready = useOrgGuard();
 *   useEffect(() => { if (!ready) return; loadData(); }, [ready]);
 */
export function useOrgGuard(): boolean {
  const { isLoaded, isSignedIn, orgId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && !orgId) {
      window.location.href = "/onboarding";
    }
  }, [isLoaded, isSignedIn, orgId]);

  return Boolean(isLoaded && isSignedIn && orgId);
}
