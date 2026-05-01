# LogisticsPro

LogisticsPro is a full-stack logistics management platform for tracking shipments, managing warehouses and carriers, and using AI-powered operational insights.

## Highlights

- Shipment lifecycle management with tracking events
- Warehouse and carrier management
- Role-protected API endpoints (Clerk JWT + RBAC)
- AI features:
  - Delay risk prediction for active shipments
  - Warehouse demand forecast (stockout + restock recommendation)
  - Multi-shipment route optimization
  - Logistics chat assistant

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Clerk
- **Backend:** FastAPI, Pydantic, Supabase Python SDK, python-jose
- **Database:** Supabase PostgreSQL
- **AI:** Google Gemini (`google-genai`)

## Repository Structure

```text
.
├─ frontend/                 # Next.js application
├─ backend/                  # FastAPI application
├─ sql/
│  ├─ supabase_schema.sql    # Base schema
│  ├─ seed_data.sql          # Optional sample data
│  └─ update_schema.sql      # Schema updates
└─ docs/
```

## Prerequisites

Make sure these are installed before running locally:

- **Node.js** 20+ and npm
- **Python** 3.10+
- A **Supabase** project
- A **Clerk** application
- A **Google Gemini API key**

## Environment Variables

### 1) Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill values:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_or_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Clerk (used for JWT verification)
CLERK_JWT_ISSUER=https://your-clerk-domain
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Gemini
GEMINI_API_KEY=your_gemini_api_key
```

Notes:
- `CLERK_PEM_PUBLIC_KEY` must be the public key used to verify Clerk-issued JWTs.
- If Clerk key is missing, backend currently falls back to a dev user path for local/demo use only.

### 2) Frontend (`frontend/.env.local`)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Local Development Setup

### 1) Database (Supabase)

1. Create a Supabase project.
2. Open SQL Editor in Supabase.
3. Run `sql/supabase_schema.sql`.
4. (Optional) Run `sql/seed_data.sql` to add sample data.
5. (Optional) Run `sql/update_schema.sql` if you need schema updates from this repo.

### 2) Start Backend (FastAPI)

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **macOS/Linux (bash/zsh):**
  ```bash
  source venv/bin/activate
  ```

Install dependencies and run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`  
Health check: `http://localhost:8000/health`

### 3) Start Frontend (Next.js)

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Running the App

1. Start backend on port `8000`.
2. Start frontend on port `3000`.
3. Open `http://localhost:3000`.
4. Sign in using Clerk and access dashboard modules:
   - `/dashboard`
   - `/dashboard/shipments`
   - `/dashboard/warehouses`
   - `/dashboard/carriers`
   - `/dashboard/route-planner`

## API Overview

Main backend routes:

- `GET /warehouses`
- `POST /warehouses`
- `POST /warehouses/{warehouse_id}/forecast` (AI)
- `GET /carriers`
- `POST /carriers`
- `GET /shipments`
- `POST /shipments`
- `GET /shipments/{shipment_id}`
- `POST /shipments/{shipment_id}/events`
- `POST /shipments/optimize-route` (AI)
- `POST /chat` (AI assistant)
- `GET /health`

## Security Notes

- Most API routes require a Bearer token (Clerk JWT).
- Clerk middleware protects dashboard routes in the frontend.
- Role checks are enforced for restricted operations (for example, some create operations are admin-only).
- Never commit real secrets to git (`.env`, API keys, private keys).

## Troubleshooting

- **Frontend cannot reach backend**
  - Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.
  - Ensure backend is running on `http://localhost:8000`.

- **Unauthorized / token verification errors**
  - Recheck `CLERK_JWT_ISSUER` and `CLERK_PEM_PUBLIC_KEY` in `backend/.env`.
  - Confirm Clerk keys in `frontend/.env.local`.

- **Supabase connection error**
  - Recheck `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`.

- **AI endpoints fail**
  - Confirm `GEMINI_API_KEY` is set and valid.
  - If rate-limited, some endpoints return fallback responses.

## Production Notes

- Backend includes `backend/vercel.json` for Vercel Python deployment.
- For production:
  - Restrict CORS origins
  - Enforce strict JWT validation
  - Disable any development fallback auth behavior
  - Use managed secrets for all credentials
