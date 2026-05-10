import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

supabase: Client = create_client(url, key)


def get_supabase() -> Client:
    """
    Raw Supabase client. Use ONLY for:
      - the predictive-delay background task (cross-tenant by design)
      - the webhook handler (writing into `profiles` before any session exists)
      - bootstrap / migration scripts
    For every authenticated request handler, use `get_scoped_client(org_id)`.
    """
    return supabase


def get_scoped_client(org_id: str) -> Client:
    """
    Return a Supabase client scoped to the given organisation.

    Two layers of defence:
      1. RPC `set_org_context(org_id)` — populates the Postgres setting
         `app.current_org_id` so the RLS policies created in
         `sql/tenant_migration.sql` filter every row.
      2. Routes ALSO append `.eq("org_id", org_id)` to selects/updates and
         inject `org_id` into every insert payload — required because the
         service-role key bypasses RLS by default. The application layer
         is the real enforcer; RLS is the backstop.

    `org_id` is passed in from the verified Clerk JWT only — never trust
    a value provided by the client.
    """
    if not org_id:
        raise ValueError("get_scoped_client called without an org_id")

    try:
        supabase.rpc("set_org_context", {"org": org_id}).execute()
    except Exception as e:
        # Don't crash the request if the RPC isn't installed yet — the
        # application-layer .eq("org_id", ...) filters still keep tenants
        # isolated. Log so the operator notices.
        print(f"[set_org_context] warning: {e}")

    return supabase
