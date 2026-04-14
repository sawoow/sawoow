import { useEffect, useState } from "react";
import Calendar from "./Calendar.jsx";
import PaymentForm from "./PaymentForm.jsx";
import { createEvent } from "../lib/gcal.js";
import { sendBookingConfirm } from "../lib/email.js";

export default function BookingModal({ service, onClose }) {
  const [step, setStep] = useState("calendar"); // calendar | payment | confirming | done | error
  const [slot, setSlot] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onSlot = (s) => {
    setSlot(s);
    setStep("payment");
  };

  const onPaid = async (customer) => {
    setStep("confirming");
    setError(null);
    try {
      const title = `Luzze: ${service.title} — ${customer.name}`;
      const [eventRes, emailRes] = await Promise.allSettled([
        createEvent({
          title,
          start: slot.start,
          end: slot.end,
          email: customer.email,
          notes: `${service.title} (${service.price}) booked via luzze website.`,
        }),
        sendBookingConfirm({
          name: customer.name,
          email: customer.email,
          service: service.title,
          price: service.price,
          slotStart: slot.start.toLocaleString(),
          slotEnd: slot.end.toLocaleString(),
        }),
      ]);
      const eventFailed = eventRes.status === "rejected";
      const emailFailed = emailRes.status === "rejected";
      setResult({
        customer,
        eventFailed,
        emailFailed,
        eventSkipped: eventRes.value?.skipped,
        emailSkipped: emailRes.value?.skipped,
      });
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Something went wrong completing your booking.");
      setStep("error");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,40,48,0.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "40px 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          color: "#4A5C6A",
          width: "100%",
          maxWidth: 560,
          borderRadius: 6,
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          padding: 32,
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
          {step === "confirming" && "Step 3 of 3 — Confirming"}
          {step === "done" && "Booking confirmed"}
          {step === "error" && "Something went wrong"}
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 400,
            marginTop: 0,
            marginBottom: 24,
            color: "#4A5C6A",
          }}
        >
          {service.title}{" "}
          <span style={{ color: "#3EA8C8", fontStyle: "italic" }}>· {service.price}</span>
        </h2>

        {step === "calendar" && <Calendar onSelect={onSlot} />}
        {step === "payment" && slot && (
          <PaymentForm
            service={{ ...service, slot }}
            onPaid={onPaid}
            onBack={() => setStep("calendar")}
          />
        )}
        {step === "confirming" && (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(74,92,106,0.7)" }}>
            Creating your booking…
          </div>
        )}
        {step === "done" && result && (
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
              You're booked in for{" "}
              <strong>
                {slot.start.toLocaleString([], {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </strong>
              . {result.emailFailed || result.emailSkipped
                ? "(A confirmation email could not be sent — Sauda will reach out directly.)"
                : `A confirmation email is on its way to ${result.customer.email}.`}
            </div>
            {(result.eventFailed || result.eventSkipped) && (
              <div
                style={{
                  padding: 12,
                  background: "rgba(255,200,120,0.1)",
                  border: "1px solid rgba(255,200,120,0.3)",
                  color: "#7a5a18",
                  fontSize: 12,
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                Heads up: the calendar event could not be written automatically (demo mode or
                endpoint not configured). Sauda will add it manually.
              </div>
            )}
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
            <div style={{ color: "#c75a5a", marginBottom: 20 }}>{error}</div>
            <button
              onClick={() => setStep("payment")}
              style={{
                background: "#3EA8C8",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                cursor: "pointer",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
