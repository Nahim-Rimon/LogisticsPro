# Supply Chain Logistics & Shipment Tracking

A full-stack application for managing and tracking shipments, warehouses, and carriers.

## Tech Stack
- **Frontend:** Next.js, Tailwind CSS, shadcn/ui, Clerk Auth
- **Backend:** FastAPI (Python), Supabase (PostgreSQL), Clerk Auth (JWT Verification)
- **Database:** Supabase

## Project Structure
- `/frontend`: Next.js application
- `/backend`: FastAPI application
- `supabase_schema.sql`: Database schema for Supabase

## Getting Started

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill in your Supabase and Clerk credentials.
4. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Clerk and Supabase credentials.
4. Run the development server: `npm run dev`

### Database Setup
1. Create a new project in Supabase.
2. Run the contents of `supabase_schema.sql` in the Supabase SQL Editor.
