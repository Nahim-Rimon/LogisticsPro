"use client";

import { CreateOrganization, useOrganizationList } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: false },
  });
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoaded || redirecting) return;
    const memberships = userMemberships?.data ?? [];
    if (memberships.length === 0) return;

    // User already belongs to at least one org. Activate the first one and
    // hard-navigate to /dashboard so Clerk re-issues the session cookie with
    // the new orgId — a soft router.replace races the proxy middleware, which
    // still sees orgId === null and bounces back to /onboarding.
    setRedirecting(true);
    const first = memberships[0];
    const go = () => {
      window.location.href = "/dashboard";
    };

    if (setActive) {
      setActive({ organization: first.organization.id }).then(go).catch(go);
    } else {
      go();
    }
  }, [isLoaded, userMemberships, setActive, redirecting]);

  if (!isLoaded || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create your organisation</h1>
          <p className="text-text-muted">
            LogisticsPro is multi-tenant — every shipment, warehouse, and carrier
            lives inside an organisation. Set yours up to continue.
          </p>
        </div>

        <CreateOrganization
          afterCreateOrganizationUrl="/dashboard"
          skipInvitationScreen={false}
          appearance={{
            elements: {
              card: "shadow-none border border-border rounded-2xl",
              formButtonPrimary: "bg-accent hover:bg-accent-hover text-sm normal-case",
            },
          }}
        />
      </div>
    </div>
  );
}
