from typing import Optional
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Ticket
from .sentiment import load_model, analyze_sentiment

app = FastAPI(title="Ticket Analyzer API")


class TicketCreate(BaseModel):
    title: str
    message: str
    category: Optional[str] = None


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    load_model()


@app.get("/health")
def health():
    return {"status": "ok"}


def _ticket_to_dict(ticket: Ticket) -> dict:
    return {
        "id": ticket.id,
        "title": ticket.title,
        "message": ticket.message,
        "category": ticket.category,
        "sentiment": ticket.sentiment,
        "confidence": ticket.confidence,
        "created_at": ticket.created_at.isoformat()
    }


@app.post("/tickets")
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    combined_text = f"{payload.title}. {payload.message}"
    analysis = analyze_sentiment(combined_text)

    ticket = Ticket(
        title=payload.title,
        message=payload.message,
        category=payload.category,
        sentiment=analysis["sentiment"],
        confidence=analysis["confidence"]
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return _ticket_to_dict(ticket)


@app.get("/tickets")
def list_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    return [_ticket_to_dict(t) for t in tickets]
