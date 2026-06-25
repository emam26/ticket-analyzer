import React, { useEffect, useState } from "react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

export default function App() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/tickets`);
      if (!res.ok) throw new Error(`GET /tickets failed: ${res.status}`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function submitTicket(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      message,
      category: category || null
    };

    try {
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`POST /tickets failed: ${res.status}`);

      setTitle("");
      setMessage("");
      setCategory("");
      await fetchTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = tickets.reduce(
    (acc, t) => {
      acc.total += 1;
      if (t.sentiment === "POSITIVE") acc.pos += 1;
      else if (t.sentiment === "NEGATIVE") acc.neg += 1;
      return acc;
    },
    { total: 0, pos: 0, neg: 0 }
  );

  return (
    <div className="app">
      <header className="hero">
        <h1>🎫 Ticket Analyzer</h1>
        <p>Submit a support ticket and instantly see its AI-predicted sentiment.</p>
      </header>

      <section className="card">
        <h2><span className="icon">＋</span> New Ticket</h2>

        {error && <div className="error">Error: {error}</div>}

        <form onSubmit={submitTicket}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Login page broken"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue in your own words..."
              required
            />
          </div>

          <div className="row">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="category">Category (optional)</label>
              <input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. bug, billing, account"
              />
            </div>
            <div className="field" style={{ marginBottom: 0, alignSelf: "end" }}>
              <button className="submit" disabled={loading} type="submit">
                {loading ? "Analyzing..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>
          <span className="icon">📋</span> Ticket History
          {stats.total > 0 && (
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
              {stats.total} total · {stats.pos} positive · {stats.neg} negative
            </span>
          )}
        </h2>

        {tickets.length === 0 ? (
          <div className="empty">
            <p style={{ fontSize: "2rem", margin: 0 }}>📭</p>
            <p>No tickets yet. Submit one above to get started.</p>
          </div>
        ) : (
          <div className="tickets">
            {tickets.map((ticket) => {
              const isPos = ticket.sentiment === "POSITIVE";
              const conf = Math.max(0, Math.min(1, Number(ticket.confidence) || 0));
              return (
                <article key={ticket.id} className="ticket">
                  <div className="ticket-head">
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <span className={`badge ${isPos ? "pos" : "neg"}`}>
                      {isPos ? "✓" : "✕"} {ticket.sentiment}
                    </span>
                  </div>

                  <div className="ticket-meta">
                    {ticket.category && (
                      <span className="badge cat">#{ticket.category}</span>
                    )}
                    <span className="badge cat">#{ticket.id}</span>
                  </div>

                  <p className="ticket-msg">{ticket.message}</p>

                  <div className="ticket-foot">
                    <span>{formatDate(ticket.created_at)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span>Confidence {(conf * 100).toFixed(1)}%</span>
                      <span className="confidence-bar">
                        <span
                          className={`confidence-fill ${isPos ? "pos" : "neg"}`}
                          style={{ width: `${conf * 100}%` }}
                        />
                      </span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}