# Project Mandates: Supply Chain Logistics & Shipment Tracking

This file contains project-specific instructions and mandates for Gemini CLI. These instructions take precedence over general workflows.

## Environment Setup
- **Monorepo Structure:** Keep `/frontend` (Next.js) and `/backend` (FastAPI) separated.
- **Backend:** Use Python 3.10+, `fastapi`, `uvicorn`, `supabase`, `python-jose` (for JWT), and `clerk-sdk-python` (if available, otherwise standard JWT verification).
- **Frontend:** Use Next.js 14+ (App Router), `tailwindcss`, `shadcn/ui`, `clerk` (Next.js SDK), `lucide-react`.

## Coding Standards
- **Naming:** Use `snake_case` for Python and `camelCase` for TypeScript/React.
- **Components:** Use functional components and hooks in React. Follow shadcn/ui patterns.
- **API:** Ensure all FastAPI endpoints are typed with Pydantic models.
- **Security:** Rigorously verify Clerk JWTs in the FastAPI backend for all protected routes. Never expose Supabase service role keys.

## Testing Requirements
- **Backend:** Use `pytest` for API endpoint testing.
- **Frontend:** Use Playwright or Vitest for critical path testing (shipment creation, tracking updates).
- **Integration:** Verify role-based access control (RBAC) thoroughly.
