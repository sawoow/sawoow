import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { createPaymentIntent, newBookingId } from "../lib/stripe.js";
import { formatSlotRangeFull } from "../lib/time.js";

const PUBLISHABLE = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise = null;
function getStripe() {
  if (!PUBLISHABLE) return null;
  if (!stripePromise) stripePromise = loadStripe(PUBLISHABLE);
  return stripePromise;
}

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(74,92,106,0.25)",
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
  color: "rgba(74,92,106,0.75)",
  marginBottom: 6,
  fontWeight: 600,
};

export default function StripePaymentStep({ service, slot, onPaid, onBack }) {
  const [step, setStep] = useState("details"); // details | pay
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [bookingId, setBookingId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const stripe = useMemo(() => getStripe(), []);
  const configured = Boolean(PUBLISHABLE) && Boolean(stripe);

  const startPayment = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!customer.name || !customer.email) {
      setErr("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      setErr("Please enter a valid email.");
      return;
    }
    if (!configured) {
      setErr(
        "Stripe isn't configured on this deployment. Please contact sauda.luzze@gmail.com to complete the booking."
      );
      return;
    }
    setLoading(true);
    try {
      const id = newBookingId();
      const res = await createPaymentIntent({
        bookingId: id,
        service,
        slot,
        customer,
      });
      // stash for resume-after-3DS-redirect
      sessionStorage.setItem(
        "luzze.pendingBooking",
        JSON.stringify({
          bookingId: id,
          paymentIntentId: res.paymentIntentId,
          service,
          customer,
          slot: { start: slot.start.toISOString(), end: slot.end.toISOString() },
        })
      );
      setBookingId(id);
      setClientSecret(res.clientSecret);
      setPaymentIntentId(res.paymentIntentId);
      setStep("pay");
    } catch (fetchErr) {
      console.error(fetchErr);
      setErr(
        fetchErr.message === "slot_unavailable"
          ? "That slot was just taken. Please pick another."
          : "Could not start payment. Please try again, or email sauda.luzze@gmail.com."
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "details" || !clientSecret) {
    return (
      <form onSubmit={startPayment}>
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
          <div
            style={{
              fontSize: 22,
              color: "#4A5C6A",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {service.price}
          </div>
          <div style={{ fontSize: 12, color: "rgba(74,92,106,0.75)", marginTop: 8, lineHeight: 1.5 }}>
            {formatSlotRangeFull(slot.start, slot.end)}
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              style={inputBase}
              value={customer.name}
              onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              autoComplete="name"
            />
          </div>
          <div>
            <label style={labelStyle}>Email (for your receipt and calendar invite)</label>
            <input
              type="email"
              style={inputBase}
              value={customer.email}
              onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
        </div>

        {err && <div style={{ marginTop: 16, color: "#c75a5a", fontSize: 13 }}>{err}</div>}
        {!configured && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(255,200,120,0.12)",
              border: "1px solid rgba(255,200,120,0.35)",
              color: "#7a5a18",
              fontSize: 12,
              borderRadius: 4,
            }}
          >
            Payment gateway not configured in this build (no publishable key).
          </div>
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
            disabled={loading}
            style={{
              flex: 1,
              background: "#3EA8C8",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Preparing…" : `Continue to pay ${service.price}`}
          </button>
        </div>
      </form>
    );
  }

  // step === "pay"
  return (
    <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <PayForm
        onPaid={(pi) => onPaid({ customer, bookingId, paymentIntentId: pi.id })}
        onBack={() => setStep("details")}
        service={service}
        slot={slot}
      />
    </Elements>
  );
}

function PayForm({ onPaid, onBack, service, slot }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErr(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setErr(error.message || "Payment failed.");
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaid(paymentIntent);
      return;
    }
    // Otherwise the browser is mid-redirect; do nothing.
  };

  return (
    <form onSubmit={submit}>
      <div
        style={{
          padding: "14px 16px",
          background: "rgba(74,92,106,0.05)",
          border: "1px solid rgba(74,92,106,0.1)",
          borderRadius: 4,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, color: "rgba(74,92,106,0.75)" }}>
          {service.title} · <strong>{service.price}</strong>
        </div>
        <div style={{ fontSize: 12, color: "rgba(74,92,106,0.7)", marginTop: 4 }}>
          {formatSlotRangeFull(slot.start, slot.end)}
        </div>
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {err && (
        <div style={{ marginTop: 16, color: "#c75a5a", fontSize: 13 }}>{err}</div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
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
          disabled={!stripe || submitting}
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
