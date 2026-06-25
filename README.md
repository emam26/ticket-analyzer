# Ticket Analyzer

## Overview
Ticket Analyzer is a minimal full-stack app that lets a user submit a support
ticket, runs sentiment analysis using a Hugging Face model, stores the ticket in
PostgreSQL, and shows the ticket history. The same Docker images run locally
and on a cloud VM.

## Architecture
```
React/Vite (Nginx)  ->  /api/*  ->  FastAPI  ->  Hugging Face model
                                            \->  PostgreSQL
```

## Tech Stack
- React + Vite
- FastAPI + Uvicorn
- PostgreSQL 16
- Hugging Face Transformers (DistilBERT SST-2)
- Docker Compose
- Puku CLI
- DockerHub
- Poridhi Cloud VM / AWS

## API Reference

### GET /health
```json
{ "status": "ok" }
```

### POST /tickets
Request:
```json
{
  "title": "Lab VM issue",
  "message": "My lab VM is not opening before the deadline.",
  "category": "lab"
}
```
Response:
```json
{
  "id": 1,
  "title": "Lab VM issue",
  "message": "My lab VM is not opening before the deadline.",
  "category": "lab",
  "sentiment": "NEGATIVE",
  "confidence": 0.999,
  "created_at": "2026-05-20T10:30:00"
}
```

### GET /tickets
Returns all tickets newest first, same shape as the POST response items.

## Local Setup
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health

## Environment Variables
| Service   | Variable             | Default Value                                       |
|-----------|----------------------|-----------------------------------------------------|
| backend   | DATABASE_URL         | postgresql://postgres:postgres@db:5432/ticket_db    |
| backend   | MODEL_NAME           | distilbert-base-uncased-finetuned-sst-2-english     |
| backend   | HF_HOME              | /opt/hf-cache                                       |
| backend   | TRANSFORMERS_OFFLINE | 1                                                   |
| frontend  | VITE_API_BASE_URL    | /api                                                |

## Deployment
1. Push images to DockerHub:
   ```bash
   docker build -t <user>/ticket-analyzer-backend:v1  ./backend
   docker push  <user>/ticket-analyzer-backend:v1
   docker build -t <user>/ticket-analyzer-frontend:v1 ./frontend
   docker push  <user>/ticket-analyzer-frontend:v1
   ```
2. Edit `docker-compose.prod.yml` and replace `<user>` with your DockerHub id.
3. On the VM:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
4. Open `http://VM_PUBLIC_IP:3000` in a browser.

## Links
- GitHub: https://github.com/emam26/ticket-analyzer
- DockerHub Backend: https://hub.docker.com/r/emam26/ticket-analyzer-backend
- DockerHub Frontend: https://hub.docker.com/r/emam26/ticket-analyzer-frontend
- Live URL:

## Troubleshooting
- **Backend cannot connect to DB** — ensure the `db` service has the
  `pg_isready` healthcheck and the backend uses `depends_on: { db: { condition: service_healthy } }`.
- **Frontend fails to call backend on VM** — the frontend must call `/api/*`,
  not `http://localhost:8000`. Nginx proxies `/api/` to `http://backend:8000/`.
- **Model tries to download at runtime** — the backend Dockerfile pre-downloads
  the model into the image and sets `TRANSFORMERS_OFFLINE=1`.
- **Sentiment shows `LABEL_0` / `LABEL_1`** — confirm the model is exactly
  `distilbert-base-uncased-finetuned-sst-2-english`.
- **Tickets disappear after restart** — make sure the named volume
  `postgres_data` is mounted to `/var/lib/postgresql/data` in `db`.