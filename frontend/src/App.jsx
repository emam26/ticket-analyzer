import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Ticket Analyzer</h1>
      <p>Submit a support ticket and analyze its sentiment.</p>

      {error && (
        <p style={{ color: "crimson" }}>Error: {error}</p>
      )}

      <form onSubmit={submitTicket}>
        <div>
          <label>Title</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Message</label>
          <br />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="5"
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Category</label>
          <br />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
        </div>

        <button disabled={loading} type="submit">
          {loading ? "Analyzing..." : "Submit Ticket"}
        </button>
      </form>

      <hr />

      <h2>Ticket History</h2>

      {tickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <h3>{ticket.title}</h3>
            <p>{ticket.message}</p>
            <p>
              <strong>Category:</strong> {ticket.category || "N/A"}
            </p>
            <p>
              <strong>Sentiment:</strong> {ticket.sentiment}{" "}
              ({Number(ticket.confidence).toFixed(3)})
            </p>
            <small>{ticket.created_at}</small>
          </div>
        ))
      )}
    </div>
  );
}