import { useState } from "react";
import { sendContact } from "../lib/email.js";

const inputStyle = {
  width: "100%",
  padding: "14px 0",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  color: "#fff",
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: 24,
  outline: "none",
  boxSizing: "border-box",
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ state: "idle", text: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus({ state: "error", text: "Please fill in all fields." });
      return;
    }
    setStatus({ state: "sending", text: "Sending…" });
    try {
      const res = await sendContact({ name, email, message });
      if (res && res.skipped) {
        setStatus({
          state: "success",
          text: "Thanks — your message was logged (email service not yet configured).",
        });
      } else {
        setStatus({ state: "success", text: "Thanks — your message is on its way." });
      }
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus({
        state: "error",
        text: "Something went wrong. Please email sauda.luzze@gmail.com directly.",
      });
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 500, margin: "0 auto", textAlign: "left" }}>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          letterSpacing: 3,
          color: "#3EA8C8",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        Send a message
      </div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        required
      />
      <textarea
        placeholder="Message"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ ...inputStyle, resize: "vertical", marginBottom: 32 }}
        required
      />
      <button
        type="submit"
        disabled={status.state === "sending"}
        style={{
          background: "#3EA8C8",
          color: "#fff",
          border: "none",
          padding: "14px 48px",
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: status.state === "sending" ? "wait" : "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          opacity: status.state === "sending" ? 0.7 : 1,
        }}
      >
        {status.state === "sending" ? "Sending…" : "Send"}
      </button>
      {status.text && (
        <div
          style={{
            marginTop: 20,
            fontSize: 13,
            color:
              status.state === "error"
                ? "#ff9ca0"
                : status.state === "success"
                ? "#8ae8c2"
                : "rgba(255,255,255,0.7)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {status.text}
        </div>
      )}
    </form>
  );
}
