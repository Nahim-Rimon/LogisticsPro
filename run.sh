#!/bin/bash

# Ensure we're in the project root directory
cd "$(dirname "$0")"

echo "Starting LogisticsPro Servers..."

# Start Backend
echo "Starting Backend (FastAPI)..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi
# Start uvicorn in the background
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend (Next.js)..."
cd frontend
# Start Next.js dev server in the background
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to handle termination
cleanup() {
    echo ""
    echo "Shutting down LogisticsPro..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Catch SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo ""
echo "========================================="
echo "LogisticsPro is running!"
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:8000"
echo "Press Ctrl+C to stop both servers."
echo "========================================="
echo ""

# Wait for both background processes so the script doesn't exit immediately
wait $BACKEND_PID $FRONTEND_PID
