Game of Thrones Explorer

Overview
- Frontend: React + TypeScript (Create React App)
- Backend (BFF): Node.js + Express + TypeScript
- Upstream: ThronesAPI v2 (https://thronesapi.com)

The frontend talks only to the BFF. The BFF fetches from ThronesAPI, normalizes responses, and optionally caches results briefly in-memory.

Getting Started
Prerequisites
- Node.js 18+
- npm 8+

Environment Variables
Backend
- PORT: Port for the BFF (default: 4000)
- THRONES_API_BASE: Upstream API base (default: https://thronesapi.com)

Frontend
- REACT_APP_BFF_BASE_URL: Base URL of the BFF (default used by code: http://localhost:4000)

Run the Backend
1. Open a terminal at ./backend
2. Install dependencies: npm install
3. Development: npm run dev
   - Server runs at http://localhost:4000 (or PORT)
4. Build: npm run build
5. Production start: npm start

Run the Frontend
1. Open a separate terminal at ./frontend
2. Install dependencies: npm install
3. Start the app: npm start
   - App runs at http://localhost:3000
   - It calls the BFF at REACT_APP_BFF_BASE_URL or http://localhost:4000 by default

Notes
- The BFF normalizes responses and maps upstream errors to a consistent shape for the frontend.
- Simple in-memory caching (60 seconds) reduces repeated upstream calls. Disable or adjust TTL as needed.
- No persistent storage is used.

Testing
- Frontend test updated to assert the app title renders.
- You can run: (in ./frontend) npm test

Docker

Overview
- This repo includes Dockerfiles for both backend and frontend, plus a docker-compose.yml to run them together.

Quick start (compose)
1. Build and start both services:
   docker compose up --build
2. Open the app:
   Frontend: http://localhost:3000
   Backend (health): http://localhost:4000/api/v1/health

Build and run backend only
- Build image:
  docker build -t got-backend ./backend
- Run container:
  docker run --rm -p 4000:4000 -e PORT=4000 -e THRONES_API_BASE=https://thronesapi.com got-backend

Build and run frontend only
- Build image (set the BFF base URL for the browser):
  docker build -t got-frontend --build-arg REACT_APP_BFF_BASE_URL=http://localhost:4000 ./frontend
- Run container:
  docker run --rm -p 3000:80 got-frontend

Notes
- The frontend is built for production and served by Nginx in the container.
- The backend exposes port 4000 and has a /api/v1/health endpoint.
- CORS is enabled on the backend, so the frontend (3000) can call the backend (4000).
- You can override REACT_APP_BFF_BASE_URL at build time if the backend is not on http://localhost:4000.
