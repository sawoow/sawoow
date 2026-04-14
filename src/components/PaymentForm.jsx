import { useState } from "react";

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(74,92,106,0.2)",
  background: "#fff",
  color: "#4A5C6A",
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  borderRadius: 4,
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "rgba(74,92,106,0.7)",
  marginBottom: 6,
  fontWeight: 600,
};

function formatCard(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(v) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function PaymentForm({ service, onPaid, onBack }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const update = (k) => (e) => {
    let v = e.target.value;
    if (k === "card") v = formatCard(v);
    if (k === "expiry") v = formatExpiry(v);
    if (k === "cvc") v = v.replace(/\D/g, "").slice(0, 4);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.name || !form.email) {
      setErr("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("Please enter a valid email.");
      return;
    }
    const cardDigits = form.card.replace(/\s/g, "");
    if (cardDigits.length < 13) {
      setErr("Card number looks incomplete.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      setErr("Expiry must be MM/YY.");
      return;
    }
    if (form.cvc.length < 3) {
      setErr("CVC looks incomplete.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onPaid({ name: form.name, email: form.email });
    }, 1200);
  };

  return (
    <form onSubmit={submit}>
      <div
        style={{
          background: "rgba(62,168,200,0.1)",
          border: "1px solid rgba(62,168,200,0.3)",
          color: "#3EA8C8",
          padding: "10px 14px",
          fontSize: 12,
          letterSpacing: 1.5,
          marginBottom: 20,
          fontFamily: "'DM Sans', sans-serif",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Demo payment — no real charge
      </div>

      <div
        style={{
          padding: "14px 16px",
          background: "rgba(74,92,106,0.05)",
          border: "1px solid rgba(74,92,106,0.1)",
          borderRadius: 4,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 13, color: "rgba(74,92,106,0.7)", marginBottom: 4 }}>
          {service.title}
        </div>
        <div style={{ fontSize: 22, color: "#4A5C6A", fontFamily: "'Playfair Display', serif" }}>
          {service.price}
        </div>
        <div style={{ fontSize: 12, color: "rgba(74,92,106,0.6)", marginTop: 8 }}>
          {service.slot.start.toLocaleString([], {
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={labelStyle}>Full name</label>
          <input
            style={inputBase}
            value={form.name}
            onChange={update("name")}
            autoComplete="cc-name"
          />
        </div>
        <div>
          <label style={labelStyle}>Email (for confirmation)</label>
          <input
            style={inputBase}
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
          />
        </div>
        <div>
          <label style={labelStyle}>Card number</label>
          <input
            style={inputBase}
            value={form.card}
            onChange={update("card")}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            autoComplete="cc-number"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Expiry</label>
            <input
              style={inputBase}
              value={form.expiry}
              onChange={update("expiry")}
              placeholder="MM/YY"
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
          <div>
            <label style={labelStyle}>CVC</label>
            <input
              style={inputBase}
              value={form.cvc}
              onChange={update("cvc")}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 16, color: "#c75a5a", fontSize: 13 }}>{err}</div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            flex: "0 0 auto",
            background: "transparent",
            border: "1px solid rgba(74,92,106,0.3)",
            color: "#4A5C6A",
            padding: "12px 24px",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            background: "#3EA8C8",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: submitting ? "wait" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Processing…" : `Pay ${service.price}`}
        </button>
      </div>
    </form>
  );
}
