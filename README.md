# Sukalp MERN SaaS

Fresh MERN monorepo rebuild of the current SaaS product.

## Stack
- React + Vite SPA (`apps/web`)
- Express API (`apps/api`)
- MongoDB
- JWT auth (access + refresh)
- Docker Compose for local/VPS deployment

## Quick Start
1. Copy `.env.example` to `.env` and update secrets.
2. Install deps: `npm install`
3. Run locally: `npm run dev`

## Docker
- Start all services: `docker compose up --build`
- Web: `http://localhost:5173`
- API: `http://localhost:4000/health`
