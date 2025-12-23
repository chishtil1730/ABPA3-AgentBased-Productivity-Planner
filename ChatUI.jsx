import React, { useState, useRef, useEffect } from "react";

const WEBHOOK_URL =
  "http://localhost:5678/webhook/cdb5c076-d458-4b9d-8398-f43bd25059b1/chat";

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage }) // <- IMPORTANT
      });

      const data = await res.json();

      // Chat Trigger returns something like: { response: "Hi!" }
      const replyText =
        data.response || data.reply || JSON.stringify(data, null, 2);

      // Add bot response
      setMessages((prev) => [...prev, { sender: "bot", text: replyText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error contacting agent." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf:
                msg.sender === "user" ? "flex-end" : "flex-start",
              background:
                msg.sender === "user" ? "#007bff" : "#e9ecef",
              color: msg.sender === "user" ? "white" : "black"
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.message, opacity: 0.6 }}>
            typing…
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "420px",
    display: "flex",
    flexDirection: "column"
  },
  chatBox: {
    height: "480px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    overflowY: "auto",
    background: "white",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  message: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: "14px",
    lineHeight: "1.4",
    fontSize: "15px"
  },
  inputRow: {
    marginTop: "12px",
    display: "flex",
    gap: "10px"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px"
  },
  button: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#007bff",
    color: "white",
    fontWeight: 600,
    cursor: "pointer"
  }
};
