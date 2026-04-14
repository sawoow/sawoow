import { useEffect, useState } from "react";
import Calendar from "./Calendar.jsx";
import StripePaymentStep from "./StripePaymentStep.jsx";
import { finalizeBooking } from "../lib/stripe.js";
import { formatSlotRangeFull } from "../lib/time.js";

function logFailedBooking(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem("luzze.failedBookings") || "[]");
    existing.push({
      at: new Date().toISOString(),
      customer: payload.customer,
      service: { title: payload.service.title, price: payload.service.price },
      slot: {
        start: payload.slot.start.toISOString(),
        end: payload.slot.end.toISOString(),
      },
      paymentIntentId: payload.paymentIntentId,
    });
    localStorage.setItem("luzze.failedBookings", JSON.stringify(existing));
  } catch (err) {
    console.warn("Could not persist failed booking", err);
  }
}

export default function BookingModal({ service, slot: initialSlot, initialStep, paymentIntentId, bookingId, customer: initialCustomer, onClose }) {
  const [step, setStep] = useState(initialStep || "calendar");
  const [slot, setSlot] = useState(initialSlot || null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pendingPI, setPendingPI] = useState(paymentIntentId || null);
  const [pendingBookingId, setPendingBookingId] = useState(bookingId || null);
  const [customer, setCustomer] = useState(initialCustomer || null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // If we were opened mid-finalize (resume from 3DS redirect), kick it off immediately.
  useEffect(() => {
    if (initialStep === "finalizing" && pendingPI && pendingBookingId) {
      runFinalize(pendingBookingId, pendingPI);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSlot = (s) => {
    setSlot(s);
    setStep("payment");
  };

  const runFinalize = async (bookingIdArg, paymentIntentIdArg) => {
    setStep("confirming");
    setError(null);
    try {
      const res = await finalizeBooking({
        bookingId: bookingIdArg,
        paymentIntentId: paymentIntentIdArg,
      });
      sessionStorage.removeItem("luzze.pendingBooking");
      if (!res.confirmed) {
        throw new Error(res.error || "finalize_failed");
      }
      setResult({
        customer: customer || {},
        eventId: res.eventId,
        cached: res.cached,
      });
      setStep("done");
    } catch (err) {
      console.error(err);
      logFailedBooking({
        customer: customer || {},
        service,
        slot: slot || { start: new Date(), end: new Date() },
        paymentIntentId: paymentIntentIdArg,
      });
      setError(
        err.message === "slot_conflict_refunded"
          ? "That slot was taken while you were paying — we've refunded the charge. Please book another time."
          : "Your payment went through, but we couldn't finalise the booking automatically. Sauda has been notified; please email sauda.luzze@gmail.com to confirm."
      );
      setStep("error");
    }
  };

  const onPaid = ({ customer: c, bookingId: bId, paymentIntentId: piId }) => {
    setCustomer(c);
    setPendingBookingId(bId);
    setPendingPI(piId);
    runFinalize(bId, piId);
  };

  const buildMailtoFallback = () => {
    const c = customer || {};
    const subject = encodeURIComponent(
      `Luzze booking — ${service.title} — ${c.name || c.email || "customer"}`
    );
    const body = encodeURIComponent(
      [
        "Hi Sauda,",
        "",
        "My online booking hit a snag. Please confirm manually:",
        "",
        `Name: ${c.name || "(not given)"}`,
        `Email: ${c.email || "(not given)"}`,
        `Service: ${service.title} (${service.price})`,
        `When: ${slot ? formatSlotRangeFull(slot.start, slot.end) : "(no slot selected)"}`,
        pendingPI ? `Stripe PaymentIntent: ${pendingPI}` : "",
        pendingBookingId ? `Booking id: ${pendingBookingId}` : "",
      ].filter(Boolean).join("\n")
    );
    return `mailto:sauda.luzze@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div
      onClick={onClose}
      className="luzze-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,40,48,0.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        padding: "32px 12px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="luzze-booking-title"
        className="luzze-modal"
        style={{
          background: "#fff",
          color: "#4A5C6A",
          width: "100%",
          maxWidth: 640,
          margin: "auto",
          borderRadius: 6,
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          padding: "clamp(20px, 4vw, 40px)",
          position: "relative",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: "rgba(74,92,106,0.6)",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div
          style={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#3EA8C8",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          {step === "calendar" && "Step 1 of 3 — Pick a time"}
          {step === "payment" && "Step 2 of 3 — Payment"}
          {step === "confirming" && "Step 3 of 3 — Finalising"}
          {step === "done" && "Booking confirmed"}
          {step === "error" && "Needs attention"}
        </div>
        <h2
          id="luzze-booking-title"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(22px, 4vw, 30px)",
            fontWeight: 400,
            marginTop: 0,
            marginBottom: 24,
            color: "#4A5C6A",
            paddingRight: 24,
          }}
        >
          {service.title}{" "}
          <span style={{ color: "#3EA8C8", fontStyle: "italic" }}>· {service.price}</span>
        </h2>

        {step === "calendar" && <Calendar onSelect={onSlot} />}
        {step === "payment" && slot && (
          <StripePaymentStep
            service={service}
            slot={slot}
            onPaid={onPaid}
            onBack={() => setStep("calendar")}
          />
        )}
        {step === "confirming" && (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(74,92,106,0.75)" }}>
            Finalising your booking…
          </div>
        )}
        {step === "done" && result && slot && (
          <div>
            <div
              style={{
                padding: 20,
                background: "rgba(138,232,194,0.15)",
                border: "1px solid rgba(138,232,194,0.4)",
                color: "#2d6a4f",
                marginBottom: 20,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              You're booked in for <strong>{formatSlotRangeFull(slot.start, slot.end)}</strong>.
              A confirmation email and calendar invite are on their way
              {customer?.email ? ` to ${customer.email}` : ""}.
              {result.cached && " (Already confirmed — no duplicate created.)"}
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                background: "#3EA8C8",
                color: "#fff",
                border: "none",
                padding: "14px 24px",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Done
            </button>
          </div>
        )}
        {step === "error" && (
          <div>
            <div style={{ color: "#c75a5a", marginBottom: 20, lineHeight: 1.6 }}>{error}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => pendingPI && pendingBookingId && runFinalize(pendingBookingId, pendingPI)}
                disabled={!pendingPI}
                style={{
                  background: "#3EA8C8",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  cursor: pendingPI ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontSize: 12,
                  opacity: pendingPI ? 1 : 0.5,
                }}
              >
                Try again
              </button>
              <a
                href={buildMailtoFallback()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "12px 24px",
                  border: "1px solid rgba(74,92,106,0.35)",
                  color: "#4A5C6A",
                  textDecoration: "none",
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Email Sauda
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
