# Backend and Local Dev Setup

This file describes how to run the backend locally using Docker Compose and how the services are wired.

Files added:

- `server/` - Node.js + TypeScript Express backend scaffold
- `docker-compose.yml` - brings up backend, MongoDB and Redis
- `.github/workflows/ci.yml` - CI pipeline to build frontend and backend

Quickstart (Windows PowerShell):

```powershell
copy .\server\.env.example .\server\.env
docker compose up --build
```

Backend will be at http://localhost:4000

API examples:

GET http://localhost:4000/api/products
POST http://localhost:4000/api/products

Next steps: wire frontend to API, add auth, seed data, and add tests.
