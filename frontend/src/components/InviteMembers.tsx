"use client";

import { useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, Trash2 } from "lucide-react";

export default function InviteMembers() {
  const { organization, membership, isLoaded: isOrgLoaded } = useOrganization();
  const {
    isLoaded: isMembershipsLoaded,
    memberships,
  } = useOrganization({ memberships: { infinite: false, pageSize: 50 } });
  const { isLoaded: isOrgListLoaded } = useOrganizationList();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOrgLoaded || !isMembershipsLoaded || !isOrgListLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading organisation...
        </CardContent>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-8 text-text-muted text-sm">
          You are not in an organisation. Create one from the onboarding page to invite teammates.
        </CardContent>
      </Card>
    );
  }

  const isAdmin = membership?.role === "org:admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      // Invited users ALWAYS get org:member — never org:admin.
      // `redirectUrl` is where the invitee lands after clicking the email link.
      // We send them to /sign-up; Clerk's <SignUp> auto-detects the
      // `__clerk_ticket` query param and walks them through accepting the
      // invite, then forwards to fallbackRedirectUrl="/dashboard".
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/sign-up`
          : undefined;
      await organization.inviteMember({
        emailAddress: email,
        role: "org:member",
        redirectUrl,
      });
      setSuccess(`Invitation sent to ${email}.`);
      setEmail("");
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to send invitation.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!isAdmin) return;
    if (!confirm("Remove this member from the organisation?")) return;
    try {
      await organization.removeMember(membershipId);
      memberships?.revalidate?.();
    } catch (err: any) {
      alert(err?.errors?.[0]?.message || err?.message || "Failed to remove member.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <CardTitle>Team & Members</CardTitle>
        </div>
        <CardDescription>
          {isAdmin
            ? "Invite teammates to your organisation. Invited users join as members."
            : "Only organisation admins can invite or remove members."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdmin && (
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Invite by email</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={submitting || !email}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </form>
        )}

        <div className="space-y-3">
          <p className="text-sm font-semibold">
            Current members ({memberships?.data?.length ?? 0})
          </p>
          <ul className="space-y-2">
            {memberships?.data?.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {m.publicUserData?.identifier ??
                      `${m.publicUserData?.firstName ?? ""} ${m.publicUserData?.lastName ?? ""}`.trim() ??
                      "Unknown user"}
                  </span>
                  <span className="text-xs text-text-muted">
                    {m.role === "org:admin" ? "Admin" : "Member"}
                  </span>
                </div>
                {isAdmin && m.role !== "org:admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(m.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </li>
            )) ?? null}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
