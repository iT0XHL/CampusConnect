# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CampusConnect is a RESTful API for university academic management (courses, assignments, grades, materials, notifications). Built with Node.js/Express, Prisma ORM, and PostgreSQL.

## Commands

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start            # Production server

# Database
npm run migrate      # Create/apply Prisma migrations interactively
npm run migrate:deploy  # Deploy migrations (production)
npm run seed         # Load seed data (2 test users, courses, enrollments)
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:studio    # Open DB browser UI

# Testing
npm test             # Run all Jest tests
# Run a single test file:
npx jest src/__tests__/auth.test.js
npx jest src/__tests__/cursos.test.js

# Docker
docker-compose up -d              # Start API + PostgreSQL + Nginx
docker-compose exec api npm test  # Run tests inside container
docker-compose logs -f api        # Tail API logs
```

## Environment Setup

Copy `.env.example` to `.env` and set:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for signing tokens
- `JWT_EXPIRES_IN` — Token TTL (default: `7d`)
- `PORT` — Server port (default: `3000`)
- `NODE_ENV` — `development` | `production`
- `LOG_LEVEL` — Winston log level

Test users (after `npm run seed`): `juan.perez@universidad.edu` / `maria.garcia@universidad.edu` — password: `password123`

## Architecture

**Request flow:** Client → Nginx (TLS, rate-limit) → Express middleware stack → Router → Controller → Prisma → PostgreSQL

**Layered structure:**
- `src/server.js` — Entry point; starts HTTP server, graceful shutdown
- `src/app.js` — Express app setup: helmet, cors, json parsing, rate limiter, route mounting
- `src/routes/` — Route definitions; all protected routes use `verifyToken` middleware
- `src/controllers/` — Business logic; one file per resource
- `src/middlewares/` — `auth.middleware.js` (JWT decode → `req.user`), `validate.middleware.js` (express-validator wrapper), `error.middleware.js` (global error handler)
- `src/utils/database.js` — Prisma singleton (prevents connection leaks)
- `src/utils/logger.js` — Winston logger

**Database (Prisma schema):**
- `Usuario` → `Matricula` (enrollment) → `Nota` (grades)
- `Curso` → `Matricula`, `Tarea` (assignments), `Material`
- `Usuario` → `Notificacion`
- Access control: protected endpoints scope queries to `req.user.id`; material filtering validates the user is enrolled in the requested course

**Authentication:** JWT issued at `POST /api/auth/login`; decoded payload `{ id, email, codigo }` stored in `req.user` by `auth.middleware.js`.

**Error handling:** Global handler in `error.middleware.js` maps Prisma error codes (P2002 → 409, P2025 → 404). Stack traces only in `NODE_ENV=development`.

## Testing Approach

Tests mock Prisma (`utils/database.js`) and `bcryptjs` via Jest module mocks. Each test file sets up mock return values before assertions. The test environment uses a 15-second timeout with `--forceExit`.

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) runs tests → npm audit → deploys to Railway on push to `main`. Requires `RAILWAY_TOKEN` and `RAILWAY_URL` secrets.
