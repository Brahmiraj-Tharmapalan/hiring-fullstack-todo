# Hiring Fullstack Todo

A clean full‑stack Todo app with a Next.js client and an Express + Prisma server.

## Stack
- Client: Next.js 16, React 19, TailwindCSS 4
- Server: Express, Prisma, Zod, PostgreSQL

## Features
- Optimistic UI for create / update / toggle / delete
- Client‑side fetch to local API (http://localhost:5000)
- Inline modal errors (e.g., duplicate title)
- Loading skeletons, subtle animations
- Simple local‑dev setup (no proxy required)

## Prerequisites
- Node 18+
- PostgreSQL running and a valid `DATABASE_URL`

## Getting Started

### 1) Server
```
cd server
cp .env.example .env   # or create .env
# .env must include DATABASE_URL, optional PORT (defaults to 5000)

npm install
npm run prisma:generate   # if script exists, otherwise: npx prisma generate
npm run prisma:migrate    # or: npx prisma migrate dev
npm run dev               # starts Express on http://localhost:5000
```

### 2) Client
```
cd client
npm install
npm run dev               # starts Next on http://localhost:3000
```

The client uses direct `fetch` to `http://localhost:5000` for API calls.

## API
- GET    /api/todos
- POST   /api/todos           { title, description? }
- PATCH  /api/todos/:id       { title?, description?, done? }
- PATCH  /api/todos/:id/done  (toggle)
- DELETE /api/todos/:id

## Troubleshooting
- Delete returns 204: frontend handles empty responses.
- Toggling 404: ensure the todo exists on the server; app refetches on 404.
- Duplicate title: server returns 409 with message; shown inline in the modal.
