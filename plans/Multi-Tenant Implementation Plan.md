# LogisticsPro — Multi-Tenant Implementation Plan

> **Stack:** Next.js · Clerk Auth · FastAPI · Supabase PostgreSQL  
> **Goal:** Isolate all data per organisation so no tenant can see another's data.

---

## How the Tenant Model Works

Every organisation created in Clerk becomes a tenant. Every row in Supabase carries the `org_id` from Clerk. Supabase Row Level Security (RLS) silently filters every query so one org never touches another's data.

| Actor | Clerk Role | Create Org? | Invite Members? | Data Access |
|---|---|---|---|---|
| First sign-up user | `org:admin` | Yes — during onboarding | Yes | Own org only |
| Invited user | `org:member` | No | No | Own org only |
| Solo user (no invites) | `org:admin` | Yes — during onboarding | Yes (later) | Own org only |

### Request Flow

```
Next.js (Clerk session)
    │
    │  Bearer JWT  ← contains org_id, org_role
    ▼
FastAPI Backend
    │  decode JWT → extract org_id
    │  call set_org_context(org_id) on Supabase
    ▼
Supabase PostgreSQL
    │  RLS: org_id = current_setting('app.current_org_id')
    ▼
Only THIS org's rows returned
```

---

## Phase 1 — Clerk Dashboard Configuration

> No code changes. Do this first before touching the repo.

### 1.1 Enable Organisations

1. Clerk Dashboard → **Configure → Organizations**
2. Toggle **Enable Organizations** → ON
3. Set **Default organization role** → `org:member`

---

### 1.2 Define Roles

Go to **Organizations → Roles** and create two roles:

| Role Key | Display Name | Permissions |
|---|---|---|
| `org:admin` | Admin | `org:sys_memberships:manage`, `org:sys_memberships:read`, `org:sys_profile:manage` |
| `org:member` | Member | `org:sys_memberships:read` |

---

### 1.3 Update the JWT Template ⚠️ Critical

Clerk must embed `org_id` and `org_role` in every JWT so FastAPI can read them without an extra API call.

1. Clerk Dashboard → **JWT Templates → Default**
2. Add these claims:

```json
{
  "org_id":   "{{org.id}}",
  "org_role": "{{org.role}}",
  "org_slug": "{{org.slug}}"
}
```

> **If this step is skipped**, every protected FastAPI route will return `403` because `org_id` will be missing from the token.

---

### 1.4 Register the Webhook

1. Clerk Dashboard → **Webhooks → Add Endpoint**
2. URL: `https://your-api-domain.com/webhooks/clerk`
3. Subscribe to:
   - `organizationMembership.created`
   - `organizationMembership.deleted`
   - `organization.created`
4. Copy the **Webhook Signing Secret** — needed in `backend/.env`

---

## Phase 2 — Supabase Database Changes

> Create a new file `sql/tenant_migration.sql` and run it in the Supabase SQL Editor.

### 2.1 Add `org_id` to Existing Tables

Every table holding business data needs an `org_id TEXT NOT NULL` column.

```sql
ALTER TABLE shipments  ADD COLUMN org_id TEXT NOT NULL DEFAULT '';
ALTER TABLE warehouses ADD COLUMN org_id TEXT NOT NULL DEFAULT '';
ALTER TABLE carriers   ADD COLUMN org_id TEXT NOT NULL DEFAULT '';
```

> After migration, remove the `DEFAULT ''` once you have populated existing rows with real org IDs.

---

### 2.2 Create the `profiles` Table

Maps Clerk users to organisations inside Supabase. This is populated by the webhook (Phase 3.5).

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  org_id        TEXT NOT NULL,
  email         TEXT,
  role          TEXT NOT NULL DEFAULT 'member',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (clerk_user_id, org_id)
);
```

---

### 2.3 Create the Org Context Helper Function

FastAPI calls this before every query to scope the DB session to the current org.

```sql
CREATE OR REPLACE FUNCTION set_org_context(org TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_org_id', org, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> The `true` parameter makes the setting **LOCAL to the current transaction**. It resets automatically — no manual cleanup needed.

---

### 2.4 Enable RLS and Create Isolation Policies

```sql
-- Enable RLS on all tenant-aware tables
ALTER TABLE shipments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;

-- Isolation policy — same pattern for every table
CREATE POLICY tenant_shipments ON shipments
  FOR ALL USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_warehouses ON warehouses
  FOR ALL USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_carriers ON carriers
  FOR ALL USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_profiles ON profiles
  FOR ALL USING (org_id = current_setting('app.current_org_id', true));
```

> These policies use the **service role key** from FastAPI. Never use the anon key for tenant-scoped queries.

---

## Phase 3 — FastAPI Backend Changes

> All changes are inside `backend/`. The existing structure stays — you are extending it, not replacing it.

### 3.1 Add Environment Variables

Add to `backend/.env` and `backend/.env.example`:

```
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

---

### 3.2 Update the JWT Decoder

**File:** `backend/auth/clerk.py` (wherever `verify_token` / `get_current_user` lives)

**Current behaviour:** decodes JWT, returns `user_id` (`sub` claim).

**Required change:** also return `org_id` and `org_role` from the token payload.

| JWT Claim | Variable | Used For |
|---|---|---|
| `sub` | `user_id` | Identify the user |
| `org_id` | `org_id` | Scope all DB queries |
| `org_role` | `org_role` | Admin-only route guards |

If `org_id` is absent from the token, raise `HTTP 403` with message `"No active organisation"`.

---

### 3.3 Add a Scoped Supabase Client Helper

**File:** `backend/db/supabase.py`

Add a helper function `get_scoped_client(org_id)` that:

1. Creates the Supabase client with the **service role key**
2. Calls `supabase.rpc('set_org_context', {'org': org_id}).execute()`
3. Returns the client ready for queries

Every route calls this helper instead of the raw Supabase client. RLS then applies automatically — no `.eq('org_id', ...)` needed on individual queries.

---

### 3.4 Update All Existing Routes

Two changes per route:

| Change | Applies To | What To Do |
|---|---|---|
| Use scoped client | All routes that touch the DB | Replace raw client with `get_scoped_client(org_id)` |
| Inject `org_id` on INSERT | All `POST` routes | Add `"org_id": auth["org_id"]` to the insert payload |
| Admin guard | Admin-only routes (e.g. create warehouse, create carrier) | Check `auth["org_role"] == "org:admin"` before proceeding |

**Files to update:**
- `backend/routes/shipments.py`
- `backend/routes/warehouses.py`
- `backend/routes/carriers.py`

---

### 3.5 Create the Webhook Route

**Create:** `backend/routes/webhooks.py`  
**Register in:** `backend/main.py` → `app.include_router(webhooks_router)`

Endpoint: `POST /webhooks/clerk`

**Security first:** verify the `svix-signature` header using `CLERK_WEBHOOK_SECRET` before processing any payload. Reject with `HTTP 400` if invalid.

| Clerk Event | Action in Supabase |
|---|---|
| `organizationMembership.created` | `UPSERT` into `profiles` — `clerk_user_id`, `org_id`, `email`, `role` |
| `organizationMembership.deleted` | `DELETE` from `profiles` where `clerk_user_id` AND `org_id` match |
| `organization.created` | No DB action needed |

> Never process webhook payloads without verifying the signature. An unverified webhook could inject arbitrary `org_id` values into `profiles`.

---

### 3.6 Update AI Routes

The AI routes also query Supabase and must be org-scoped:

- `POST /shipments/optimize-route` — scope shipment lookups to `org_id`
- `POST /warehouses/{id}/forecast` — scope warehouse data to `org_id`
- `POST /chat` — any DB context fetched for the AI assistant must be org-scoped

Apply the same `get_scoped_client(org_id)` pattern as the standard routes.

---

## Phase 4 — Next.js Frontend Changes

### 4.1 Create the Onboarding Page

**Create:** `frontend/app/onboarding/page.tsx`

Logic:
1. Check if user already belongs to an org (`userMemberships.data.length > 0`)
2. If yes → redirect to `/dashboard`
3. If no → render Clerk's `<CreateOrganization>` component
4. After org is created → redirect to `/dashboard`

Use Clerk's built-in `CreateOrganization` component — it handles the entire org creation flow including optional member invites during setup.

---

### 4.2 Update `middleware.ts`

**File:** `frontend/middleware.ts`

**Current behaviour:** Clerk redirects unauthenticated users to `/sign-in`.

**Required addition:** after the auth check, if `auth().orgId === null`, redirect to `/onboarding`.

Paths to **exclude** from the org check to avoid redirect loops:
- `/sign-in`, `/sign-up`
- `/onboarding`
- `/api/webhooks/*`

---

### 4.3 Add Invite Members UI

**Create:** `frontend/components/InviteMembers.tsx`  
**Mount in:** `frontend/app/dashboard/settings/page.tsx`

Behaviour:
- Only render if `membership.role === 'org:admin'`
- Input field for email address
- On submit: `organization.inviteMember({ emailAddress, role: 'org:member' })`
- Invited users **always** receive `org:member` — never `org:admin`

---

### 4.4 Verify Token Flow

**File:** `frontend/lib/api.ts`

No breaking change needed — Clerk automatically includes `org_id` in the JWT when the user has an active org. Confirm that:

- `getToken()` is properly awaited
- The `Authorization: Bearer <token>` header is set on every API call

> If using SWR or React Query, invalidate all queries when the active org changes by subscribing to `useOrganization()`.

---

### 4.5 Org Switcher (Optional)

If users can belong to multiple orgs, add Clerk's `<OrganizationSwitcher>` to the sidebar or header. It is a drop-in component — no custom logic needed.

---

## Phase 5 — Files Summary

| File | Action | Phase |
|---|---|---|
| `sql/tenant_migration.sql` | **CREATE** | 2 |
| `backend/.env` | **EDIT** — add `CLERK_WEBHOOK_SECRET` | 3 |
| `backend/.env.example` | **EDIT** — add placeholder | 3 |
| `backend/auth/clerk.py` | **EDIT** — return `org_id` and `org_role` from JWT | 3 |
| `backend/db/supabase.py` | **EDIT** — add `get_scoped_client(org_id)` helper | 3 |
| `backend/routes/shipments.py` | **EDIT** — scoped client + inject `org_id` on insert | 3 |
| `backend/routes/warehouses.py` | **EDIT** — scoped client + inject `org_id` on insert | 3 |
| `backend/routes/carriers.py` | **EDIT** — scoped client + inject `org_id` on insert | 3 |
| `backend/routes/webhooks.py` | **CREATE** — handle Clerk membership events | 3 |
| `backend/main.py` | **EDIT** — register webhooks router | 3 |
| `frontend/app/onboarding/page.tsx` | **CREATE** — org creation flow | 4 |
| `frontend/middleware.ts` | **EDIT** — redirect org-less users to `/onboarding` | 4 |
| `frontend/components/InviteMembers.tsx` | **CREATE** — admin-only invite UI | 4 |
| `frontend/app/dashboard/settings/page.tsx` | **EDIT** — mount `InviteMembers` | 4 |

---

## Phase 6 — Testing Checklist

Run through every test manually after completing all phases.

### Isolation Tests

| Test | Expected Result |
|---|---|
| Sign up as User A, create Org1, create a shipment | Shipment stored with `org_id = Org1` |
| Sign up as User B, create Org2, create a shipment | Shipment stored with `org_id = Org2` |
| Logged in as User A → `GET /shipments` | Only Org1 shipments returned |
| Logged in as User B → `GET /shipments` | Only Org2 shipments returned |
| Org1 Admin invites User C → User C logs in | User C sees only Org1 data |
| User C (`org:member`) → `POST /warehouses` | `403 Forbidden` |
| Webhook: remove User C from Org1 in Clerk | Profile row deleted from Supabase `profiles` |
| Direct Supabase query without `set_org_context` | Returns 0 rows — RLS blocks it |

### Edge Cases

- User closes browser mid-onboarding → redirect to `/onboarding` on next login
- User is removed from their only org → `/dashboard` redirects to `/onboarding`
- Clerk webhook is delayed → `profiles` row may not exist yet — handle gracefully in routes

---

## Security Rules — Never Break These

| Rule | Why |
|---|---|
| Always use `SUPABASE_SERVICE_KEY` in FastAPI — never the anon key for tenant queries | Anon key can bypass RLS in some Supabase configurations |
| Always call `set_org_context` before every query | Without it, RLS returns 0 rows or may expose all rows |
| Always inject `org_id` on the server side during INSERT — never trust the client to send it | A malicious client could send a different `org_id` and pollute another org's data |
| Verify Clerk webhook signatures — reject all unsigned requests | Without verification, anyone can POST to your webhook and inject fake memberships |
| Invited users always get `org:member` — never `org:admin` | Prevents invited users from hijacking org settings or inviting others |
| Never expose `SUPABASE_SERVICE_KEY` or `CLERK_SECRET_KEY` to the frontend | Server-only secrets — if leaked, the entire database is compromised |

---

## Recommended Implementation Order

Follow this order strictly. Each phase depends on the previous one.

1. **Phase 1** — Clerk Dashboard: enable orgs, define roles, update JWT template, register webhook
2. **Phase 2** — Run `sql/tenant_migration.sql` in Supabase
3. **Phase 3.1–3.3** — Update FastAPI JWT decoder and add scoped Supabase client helper
4. **Phase 3.4** — Update all existing routes
5. **Phase 3.5** — Add webhook route, test with Clerk CLI (`clerk webhooks listen`)
6. **Phase 3.6** — Update AI routes
7. **Phase 4.1–4.2** — Onboarding page and middleware redirect
8. **Phase 4.3–4.4** — Invite UI and token flow verification
9. **Phase 6** — Run the full isolation test checklist

> Do not start Phase 4 until Phase 3 is complete and tested. The frontend flow only works correctly once the backend is enforcing `org_id` scoping.
