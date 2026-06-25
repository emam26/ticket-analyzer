# Ticket Analyzer — PRD

## Problem
Support teams need a simple way to triage incoming tickets. Manually reading every
ticket is slow, and sentiment is often missed. We want a minimal app that:

1. Accepts a support ticket from the browser.
2. Runs sentiment analysis on the ticket text.
3. Persists the ticket and its sentiment to a database.
4. Shows ticket history, including across page refreshes.

## Non-Goals
- No authentication, RBAC, or user accounts.
- No dashboards, charts, or analytics.
- No background jobs, queues, or workers.
- No model training. We use a pre-trained HF model only.

## Stack
- Frontend: React + Vite, served by Nginx (port 3000).
- Backend: FastAPI (port 8000) with Hugging Face `transformers`.
- Model: `distilbert-base-uncased-finetuned-sst-2-english` (baked into backend image).
- DB: PostgreSQL 16 with a named volume for persistence.
- Packaging: Docker Compose for local dev and VM deploy.
- Workflow: Puku CLI + DockerHub for cloud deployment.

## API
- `GET  /health`  — liveness probe.
- `POST /tickets` — create a ticket, run sentiment, persist, return ticket.
- `GET  /tickets` — list all tickets newest first.

## Acceptance Criteria
- `docker compose up --build` brings the whole stack up.
- Submitting a ticket through the UI returns `POSITIVE` or `NEGATIVE` with a confidence score.
- After a browser refresh, prior tickets are still visible.
- The backend image contains the model weights (no runtime download).
- A PostgreSQL named volume survives container restarts.
- The frontend calls `/api/*` and Nginx proxies to the backend.
- README documents local setup, API, deployment, troubleshooting, and links.