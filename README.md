# Job Application Tracker

A full-stack tool for tracking job applications: Kanban board, funnel analytics, and automatic job posting parsing from a URL.

**Live demo:** _(add after Phase 8)_
**Demo account:** `demo@demo.com` / `demo`

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite, TanStack Query, TanStack Table, dnd-kit, Zod, Tailwind |
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
- [ ] Design the database schema: `User`, `Application`, `Company`, `StatusHistory`, `Note`
- [ ] Draft this README (keep it updated as the project grows, not at the end)
- [x] Configure `.editorconfig`, `.gitignore` files, and a commit convention

### Phase 1 — Backend Skeleton

- [x] Spring Initializr: Web, Security, JPA, Validation, Flyway, PostgreSQL Driver, Lombok
- [x] `docker-compose.yml` with PostgreSQL for local development
- [x] Flyway migration `V1__init.sql`: `users` and `applications` tables
- [x] Entity → Repository → Service → Controller for `Application` (CRUD)
- [x] DTOs with MapStruct mappers — no entities exposed through the API
- [x] Global `@RestControllerAdvice` with a consistent error response format
- [ ] Swagger UI via springdoc-openapi

### Phase 2 — Authentication

- [ ] JWT endpoints: `POST /auth/register`, `/auth/login`, `/auth/refresh`
- [ ] `SecurityFilterChain` with `USER` and `ADMIN` roles
- [ ] Ownership checks — users can only access their own applications
- [ ] Seed script with a demo user and ~20 sample applications

### Phase 3 — Frontend Skeleton

- [ ] Vite + React + TypeScript in strict mode
- [ ] Axios instance with token interceptor and automatic refresh
- [ ] Login and registration pages, protected routes
- [ ] App layout: sidebar, header, light/dark theme

### Phase 4 — List and Form

- [ ] Applications table with TanStack Table: sorting, filtering by status and company
- [ ] Row virtualization for large datasets
- [ ] **Schema-driven form engine**: JSON schema → rendered form
  - [ ] Field type registry: `text`, `textarea`, `select`, `date`, `money`, `tags`
  - [ ] Conditional field visibility (`visibleIf`)
  - [ ] Validation generated from the schema via Zod
- [ ] Create/edit application form built on the engine
- [ ] CSV export

### Phase 5 — Kanban and Drag & Drop

- [ ] Columns: Applied → Screening → Interview → Offer / Rejected
- [ ] Card dragging with dnd-kit
- [ ] Optimistic updates with rollback on failure
- [ ] `StatusHistory` entry written on every status change
- [ ] Full keyboard navigation across cards and columns

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

---

## Architecture Decisions

_(filled in as the project progresses — one short section per non-trivial decision)_

- **Schema-driven form engine instead of hand-written forms** — the reasoning and where the abstraction stops paying off
- **Custom date picker instead of a library** — which accessibility requirements drove it
- **Optimistic updates on the Kanban board** — how conflicts are resolved
- **Testcontainers instead of H2** — why real PostgreSQL behaviour matters

---

## What I Would Do Differently

_(written after completion — the most valuable section for interviews)_

---

## License

MIT
