import React, { useState, useEffect } from "react";

const App = () => {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Error:", err);
      setSuggestions(["(Error generating suggestions)"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Messaging Panel</h2>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {loading && <p>Loading suggestions...</p>}

      <div style={{ marginTop: 20 }}>
        <strong>Suggestions:</strong>
        <ul>
          {suggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Message History:</strong>
        <ul>
          {history.map((msg, idx) => (
            <li key={idx}><b>{msg.role}:</b> {msg.content}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;