# Job Application Tracker

A full-stack tool for tracking job applications: Kanban board, funnel analytics, and automatic job posting parsing from a URL.

**Live demo:** _(add after Phase 8)_
**Demo account:** `demo@demo.com` / `demo`

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite, Redux Toolkit, TanStack Query, TanStack Table, dnd-kit, Zod, Tailwind |
| Backend | Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Flyway, MapStruct |
| Database | PostgreSQL |
| Testing | Vitest + React Testing Library + MSW, JUnit 5 + Testcontainers, jest-axe |
| Infrastructure | Docker Compose, GitHub Actions, Vercel + Railway + Neon |

---

## Repository Structure

```
job-tracker/
├── backend/           # Spring Boot application
├── frontend/          # React + Vite application
│   └── src/
│       ├── api/       # Axios client and typed endpoint functions
│       ├── store/     # Redux Toolkit slices (client state only)
│       ├── features/  # auth, theme, applications, form-engine — grouped by domain
│       ├── components/# layout and shared UI
│       └── pages/     # route-level screens
├── docker/            # docker-compose.yml, Dockerfiles
├── docs/              # architecture diagram, ADRs
└── README.md
```

---

## Roadmap

The minimum showable version is **Phases 0–5 plus Phase 8**.
Everything after that is built incrementally while the project is already live.

### Phase 0 — Setup

- [x] Create repository and folder structure: `backend`, `frontend`, `docker`
- [x] Design the database schema: `User`, `Application`, `Company`, `StatusHistory`, `Note` — see `docs/schema.md`
- [x] Draft this README (keep it updated as the project grows, not at the end)
- [x] Configure `.editorconfig`, `.gitignore` files, and a commit convention

### Phase 1 — Backend Skeleton

- [x] Spring Initializr: Web, Security, JPA, Validation, Flyway, PostgreSQL Driver, Lombok
- [x] `docker-compose.yml` with PostgreSQL for local development
- [x] Flyway migration `V1__init.sql`: `users` and `applications` tables
- [x] Entity → Repository → Service → Controller for `Application` (CRUD)
- [x] DTOs with MapStruct mappers — no entities exposed through the API
- [x] Global `@RestControllerAdvice` with a consistent error response format, covering Spring MVC's own exceptions (`ErrorContractTest`)
- [x] `applications.company` as a denormalized column (`V3`), split out of the position string
- [x] Swagger UI via springdoc-openapi

### Phase 2 — Authentication

- [x] JWT endpoints: `POST /auth/register`, `/auth/login`, `/auth/refresh`
- [x] `SecurityFilterChain` with `USER` and `ADMIN` roles
- [x] Ownership checks — users can only access their own applications
- [x] Seed script with a demo user and ~20 sample applications

### Phase 3 — Frontend Skeleton

- [x] Vite + React + TypeScript in strict mode
- [x] Redux Toolkit store for client state: `auth`, `theme`, `ui` slices with typed hooks
- [x] Axios instance with token interceptor and automatic refresh
- [x] Login and registration pages, protected routes
- [x] App layout: sidebar, header, light/dark theme

### Phase 4 — List and Form

- [x] Applications table with TanStack Table: sorting, status filter and global search across position, company and tech stack (filter state in `uiSlice`)
- [x] Row virtualization for large datasets
- [x] **Schema-driven form engine**: JSON schema → rendered form
  - [x] Field type registry: `text`, `textarea`, `select`, `date`, `money`, `tags`
  - [x] Conditional field visibility (`visibleIf`), hidden fields excluded from validation
  - [x] Validation generated from the schema via Zod, including async rules
  - [x] Multi-step (`wizard`) mode with per-step validation
- [x] Create/edit/delete application form built on the engine, with optimistic updates and toasts
- [x] CSV export of the current filtered view

### Phase 5 — Kanban and Drag & Drop

- [x] Columns: Saved → Applied → Screening → Interview → Offer / Rejected, with count and total per column
- [x] Card dragging with dnd-kit, `PATCH /api/applications/{id}/status`
- [x] Optimistic updates with rollback on failure
- [x] `status_history` entry written on every status change (`V4`), shown as a card timeline
- [x] Full keyboard navigation across cards and columns, with screen-reader announcements

### Phase 6 — Accessibility

- [ ] Custom date picker: keyboard navigation, `role="grid"`, `aria-live` month announcements, focus trap
- [ ] Date picker used in both the form and the filters
- [ ] Automated checks with `jest-axe`
- [ ] Colour contrast and focus state audit against WCAG 2.1 AA

### Phase 7 — Testing and CI

- [ ] Backend: JUnit 5 + Testcontainers (real PostgreSQL), covering services and the auth flow
- [ ] Frontend: Vitest + RTL for the form engine and Kanban board, MSW for API mocking
- [ ] GitHub Actions pipeline: `lint → test → build → docker build`
- [ ] Build and coverage badges in this README

### Phase 8 — Deployment

- [ ] Frontend → Vercel
- [ ] Backend → Railway or Render
- [ ] Database → Neon
- [ ] CORS configuration, environment variables, `/actuator/health`
- [ ] Screenshots and live demo link added to this README

### Phase 9 — Extensions

- [ ] Job posting parser: paste a URL, Jsoup extracts title, company, and tech stack via `@Async` processing
- [ ] Analytics dashboard: conversion funnel and average time in each status (Recharts)
- [ ] WebSocket live sync across browser tabs
- [ ] Follow-up reminders based on application dates

### Phase 10 — Polish

- [ ] README: problem → screenshots → architecture → stack → trade-offs → how to run
- [ ] Architecture diagram in `docs/`
- [ ] "What I would do differently" section
- [ ] Repository and demo links added to resume and LinkedIn

---

## Running Locally

```bash
# Database
docker compose -f docker/docker-compose.yml up -d

# Backend
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm install && npm run dev
```

Frontend: http://localhost:5173
Swagger: http://localhost:8080/swagger-ui.html

The frontend reads the API base URL from `VITE_API_URL`. `frontend/.env` already points at
`http://localhost:8080`; copy `frontend/.env.example` to `frontend/.env.local` to override it.

Frontend scripts: `npm run dev`, `lint`, `format`, `typecheck`, `test`, `build`.

---

## Architecture Decisions

_(filled in as the project progresses — one short section per non-trivial decision)_

- **Redux Toolkit for client state, TanStack Query for server state** — Redux owns auth, theme, and UI state; anything that lives on the server stays in the query cache instead of being mirrored into a slice
- **Schema-driven form engine instead of hand-written forms** — field types come from a registry and validation is generated from the same schema, so a new field is one registry entry plus one schema line; see `docs/adr/0003-form-engine-and-table.md`
- **Custom date picker instead of a library** — which accessibility requirements drove it
- **Optimistic updates on the Kanban board** — the cache moves first and is restored from the pre-move snapshot if the request fails
- **Board keyboard model** — left/right jump columns, which dnd-kit's default coordinate getter cannot express; see `docs/adr/0004-kanban-board.md`
- **Card order is derived, not stored** — columns sort by how long an application has been waiting, so the board never offers a reorder it cannot persist
- **Testcontainers instead of H2** — why real PostgreSQL behaviour matters

---

## What I Would Do Differently

_(written after completion — the most valuable section for interviews)_

---

## License

MIT
