Game of Thrones Explorer

Overview
- Frontend: React + TypeScript (Create React App)
- Backend (BFF): Node.js + Express + TypeScript
- Upstream: ThronesAPI v2 (https://thronesapi.com)

The frontend talks only to the BFF. The BFF fetches from ThronesAPI, normalizes responses, and optionally caches results briefly in-memory.

Requirements Implemented
- BFF endpoints:
  - GET /api/v1/characters -> proxies GET /api/v2/Characters (supports filtering, sorting, and optional pagination)
  - GET /api/v1/characters/:id -> proxies GET /api/v2/Characters/{id}
  - GET /api/v1/health -> health check
  - Normalized JSON shape: { ok: boolean, data?: T, error?: { message, code?, status? } }
  - CORS enabled, simple in-memory caching (60s TTL)
- Frontend features:
  - List characters (name, image, title, family)
  - Search by name (client-side)
  - View character details on click (modal)
  - Loading and error states

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

Project Structure
- backend/
  - src/app.ts: Express app configuration (middleware, routes, /health)
  - src/server.ts: App bootstrap (starts HTTP server)
  - src/routes/characters.routes.ts: Characters routes
  - src/controllers/characters.controller.ts: Handlers and response normalization
  - src/services/thronesApi.ts: Upstream ThronesAPI client
  - src/utils/cache.ts, src/utils/error.ts: Helpers (in-memory cache, error mapping)
  - src/middlewares/errorHandler.ts: Global error handler
  - src/config/env.ts: Environment variables loader
  - src/types.ts: Shared types
  - tsconfig.json
  - package.json
- frontend/
  - src/services/api.ts: BFF API client and types
  - src/components/CharactersList.tsx: List with search and click to open details
  - src/components/CharacterDetails.tsx: Modal fetching details
  - src/App.tsx, src/App.css
  - src/index.tsx

Notes
- The BFF normalizes responses and maps upstream errors to a consistent shape for the frontend.
- Simple in-memory caching (60 seconds) reduces repeated upstream calls. Disable or adjust TTL as needed.
- No persistent storage is used.

Testing
- Frontend test updated to assert the app title renders.
- You can run: (in ./frontend) npm test

Optional Enhancements
- Add pagination and sorting in the BFF and frontend
- Add rate-limiting to BFF (e.g., express-rate-limit)
- Add Dockerfiles and docker-compose for both services
- Add more unit tests for BFF utilities and route handlers


Backend: Filtering, Sorting, and Pagination
- Endpoint: GET /api/v1/characters
- Query parameters (all optional):
  - q: Search by name (matches fullName or first/last name, case-insensitive substring).
  - family: Filter by family (case-insensitive exact match).
  - title: Filter by title (case-insensitive substring).
  - sortBy: Field to sort by. One of: id, fullName, firstName, lastName, title, family.
  - sortOrder: asc (default) or desc.
  - page: 1-based page index. Pagination is applied only if page or pageSize is provided; otherwise the full result set is returned.
  - pageSize: Items per page (default 20 when paginating; min 1, max 100).
- Pagination metadata is returned in the JSON response body under a `pagination` field when paginating:
  - pagination.total: Total number of items after filtering.
  - pagination.page: Current page number.
  - pagination.pageSize: Page size used.
  - pagination.totalPages: Total pages given the page size.
- Response body contains the normalized array of Character objects in `data`, and the `pagination` field only appears when pagination is applied.

Examples
- GET /api/v1/characters?q=stark&sortBy=fullName&sortOrder=asc
- GET /api/v1/characters?family=Lannister&title=king&page=1&pageSize=10&sortBy=lastName&sortOrder=desc
