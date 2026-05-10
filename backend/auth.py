from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import os

security = HTTPBearer()

CLERK_JWT_ISSUER = os.environ.get("CLERK_JWT_ISSUER")
CLERK_PEM_PUBLIC_KEY = os.environ.get("CLERK_PEM_PUBLIC_KEY")
if CLERK_PEM_PUBLIC_KEY:
    CLERK_PEM_PUBLIC_KEY = CLERK_PEM_PUBLIC_KEY.replace('\\n', '\n')


def _extract_org(payload: dict):
    """
    Pull (org_id, org_role, org_slug) from a Clerk JWT.

    Clerk emits two session-token shapes:

      v1 (legacy / custom JWT template):
          { "org_id": "org_...", "org_role": "org:admin", "org_slug": "..." }

      v2 (default since @clerk/nextjs v6+):
          { "o": { "id": "org_...", "rol": "admin", "slg": "..." } }

    The `rol` field in v2 is a short value ("admin", "member", "basic_member"),
    so we normalise it back to the "org:<role>" form the rest of the app uses.
    """
    o = payload.get("o")
    if isinstance(o, dict):
        org_id = o.get("id")
        raw_role = o.get("rol") or o.get("role")
        org_slug = o.get("slg") or o.get("slug")
    else:
        org_id = payload.get("org_id")
        raw_role = payload.get("org_role")
        org_slug = payload.get("org_slug")

    org_role = None
    if raw_role:
        if raw_role.startswith("org:"):
            org_role = raw_role
        elif raw_role in ("admin",):
            org_role = "org:admin"
        elif raw_role in ("member", "basic_member"):
            org_role = "org:member"
        else:
            org_role = f"org:{raw_role}"

    return org_id, org_role, org_slug


async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    """
    Decode the Clerk JWT and return a normalised auth payload:
      - user_id  (Clerk `sub`)
      - org_id   (REQUIRED — 403 if missing)
      - org_role (e.g. "org:admin", "org:member")
      - org_slug
      - raw      (full JWT payload)
    """
    if not CLERK_PEM_PUBLIC_KEY:
        # Dev-only fallback. NEVER ship without CLERK_PEM_PUBLIC_KEY set.
        return {
            "user_id": "dev_user",
            "org_id": "dev_org",
            "org_role": "org:admin",
            "org_slug": "dev",
            "raw": {"sub": "dev_user", "o": {"id": "dev_org", "rol": "admin"}},
        }

    try:
        payload = jwt.decode(
            token.credentials,
            CLERK_PEM_PUBLIC_KEY,
            algorithms=["RS256"],
            issuer=CLERK_JWT_ISSUER,
        )
    except Exception as e:
        print(f"JWT Decode Error Details: {repr(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    org_id, org_role, org_slug = _extract_org(payload)

    if not org_id:
        # Help the operator debug missing-org scenarios — print the claim keys
        # we actually saw so it's obvious whether the JWT template is wrong
        # vs. the user simply having no active org.
        print(f"[auth] JWT had no org_id. Top-level keys: {sorted(payload.keys())}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active organisation. Create or select an organisation before calling the API.",
        )

    return {
        "user_id": user_id,
        "org_id": org_id,
        "org_role": org_role,
        "org_slug": org_slug,
        "raw": payload,
    }


def require_org_admin(user: dict):
    """Raise 403 unless the current user holds the `org:admin` role in the active org."""
    if user.get("org_role") != "org:admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires an organisation admin.",
        )
    return True


# Kept for backward compatibility with older route signatures.
def check_role(user: dict, required_role: str):
    if required_role == "admin":
        return require_org_admin(user)
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Unknown role check: {required_role}",
    )
