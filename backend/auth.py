from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import os

security = HTTPBearer()

CLERK_JWT_ISSUER = os.environ.get("CLERK_JWT_ISSUER")
# In production, you would fetch the PEM public key from Clerk's JWKS endpoint
# or provide it via environment variable.
CLERK_PEM_PUBLIC_KEY = os.environ.get("CLERK_PEM_PUBLIC_KEY")
if CLERK_PEM_PUBLIC_KEY:
    CLERK_PEM_PUBLIC_KEY = CLERK_PEM_PUBLIC_KEY.replace('\\n', '\n')

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    if not CLERK_PEM_PUBLIC_KEY:
        # For development/demo purposes if key is not set, we might skip validation
        # WARNING: NEVER DO THIS IN PRODUCTION
        return {"sub": "dev_user", "role": "admin"}
    
    try:
        payload = jwt.decode(
            token.credentials,
            CLERK_PEM_PUBLIC_KEY,
            algorithms=["RS256"],
            issuer=CLERK_JWT_ISSUER
        )
        return payload
    except Exception as e:
        print(f"JWT Decode Error Details: {repr(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def check_role(user: dict, required_role: str):
    # Clerk roles are often stored in public_metadata or private_metadata
    # This is a simplified check
    roles = user.get("roles", [])
    if required_role not in roles and user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted for this user role"
        )
    return True
