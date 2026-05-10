"""
Clerk webhook receiver.

Subscribes to:
  - organizationMembership.created  → upsert profiles row
  - organizationMembership.deleted  → delete profiles row
  - organization.created            → no DB action (logged only)

Signature verification uses Svix headers (svix-id, svix-timestamp, svix-signature)
plus CLERK_WEBHOOK_SECRET. Unverified requests are rejected with 400.
"""

import os
import json
from fastapi import APIRouter, Request, HTTPException, status
from database import get_supabase

try:
    from svix.webhooks import Webhook, WebhookVerificationError
except ImportError:  # pragma: no cover
    Webhook = None
    WebhookVerificationError = Exception

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

CLERK_WEBHOOK_SECRET = os.environ.get("CLERK_WEBHOOK_SECRET", "")


@router.post("/clerk")
async def clerk_webhook(request: Request):
    if not CLERK_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_WEBHOOK_SECRET is not configured on the server.",
        )

    if Webhook is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The `svix` package is not installed. Run `pip install svix`.",
        )

    raw_body = await request.body()
    headers = {
        "svix-id": request.headers.get("svix-id", ""),
        "svix-timestamp": request.headers.get("svix-timestamp", ""),
        "svix-signature": request.headers.get("svix-signature", ""),
    }

    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        # `verify` raises on bad signature and returns the parsed payload on success
        payload = wh.verify(raw_body, headers)
    except WebhookVerificationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid webhook signature: {e}",
        )
    except Exception as e:
        # Fallback in case svix returns a non-dict
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook verification failed: {e}",
        )

    if not isinstance(payload, dict):
        try:
            payload = json.loads(raw_body)
        except Exception:
            raise HTTPException(status_code=400, detail="Malformed payload")

    event_type = payload.get("type")
    data = payload.get("data", {}) or {}

    db = get_supabase()

    if event_type == "organizationMembership.created":
        org = data.get("organization", {}) or {}
        user = data.get("public_user_data", {}) or {}
        org_id = org.get("id")
        clerk_user_id = user.get("user_id")
        email = user.get("identifier")
        role = data.get("role", "org:member")

        if not (org_id and clerk_user_id):
            raise HTTPException(status_code=400, detail="Missing org_id or user_id in payload")

        try:
            db.table("profiles").upsert(
                {
                    "clerk_user_id": clerk_user_id,
                    "org_id": org_id,
                    "email": email,
                    "role": role,
                },
                on_conflict="clerk_user_id,org_id",
            ).execute()
        except Exception as e:
            print(f"[webhook] failed to upsert profile: {e}")
            raise HTTPException(status_code=500, detail="Failed to upsert profile")

    elif event_type == "organizationMembership.deleted":
        org = data.get("organization", {}) or {}
        user = data.get("public_user_data", {}) or {}
        org_id = org.get("id")
        clerk_user_id = user.get("user_id")

        if not (org_id and clerk_user_id):
            raise HTTPException(status_code=400, detail="Missing org_id or user_id in payload")

        try:
            db.table("profiles").delete().eq("clerk_user_id", clerk_user_id).eq(
                "org_id", org_id
            ).execute()
        except Exception as e:
            print(f"[webhook] failed to delete profile: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete profile")

    elif event_type == "organization.created":
        # No DB action required; the first member event will create the profile.
        org = data or {}
        print(f"[webhook] organization.created: {org.get('id')} ({org.get('name')})")

    else:
        # Acknowledge unknown events so Clerk doesn't retry forever.
        print(f"[webhook] ignored event type: {event_type}")

    return {"received": True, "type": event_type}
