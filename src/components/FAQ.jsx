import { useState } from "react";

const faqs = [
  {
    q: "Who do you work with?",
    a: "Members of the African diaspora — primarily Ugandans and East Africans abroad — who are considering relocating home, investing, or building something in Uganda and want a trusted guide on the ground.",
  },
  {
    q: "Is my information kept confidential?",
    a: "Yes. Nothing you share in a session leaves it without your explicit permission. We never sell or share personal details, and introductions to partners only happen at your request.",
  },
  {
    q: "What exactly do I get at the end of a consultancy session?",
    a: "A discovery call leaves you with a clear view of your next step. The 1:1 advisory journey delivers a personalised relocation or investment plan, a vetted shortlist of partners, and a 90-day action plan.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. Reschedule up to 24 hours before your slot at no cost. Cancellations more than 48 hours in advance are refunded in full; inside 48 hours we offer a credit toward a future session.",
  },
  {
    q: "Do you handle legal, immigration, or tax filings directly?",
    a: "No — we advise and connect you with vetted specialists for those. Think of us as the trusted hub that guides you through the maze, not a law or tax firm.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Major international cards at booking. For larger engagements we can also invoice via bank transfer or Paystack (including mobile money for local clients). Let us know in the discovery call.",
  },
  {
    q: "What if I'm not sure I'm ready to relocate?",
    a: "That's what the discovery call is for. Most people leave it clearer about whether this is the right time — sometimes the answer is 'not yet', and that's a useful answer too.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section
      style={{
        background: "#fff",
        padding: "100px 24px",
        borderTop: "1px solid rgba(74,92,106,0.08)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            letterSpacing: 4,
            color: "#3EA8C8",
            textTransform: "uppercase",
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          Common questions
        </div>
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            color: "#4A5C6A",
            fontWeight: 400,
            fontStyle: "italic",
            marginTop: 0,
            marginBottom: 48,
          }}
        >
          Before we get started
        </h2>
        <div>
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                style={{ borderBottom: "1px solid rgba(74,92,106,0.15)" }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    padding: "20px 0",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 16,
                    color: "#4A5C6A",
                    fontWeight: 500,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: 22,
                      color: "#3EA8C8",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p
                    style={{
                      margin: "0 0 24px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 15,
                      color: "#6b7c8a",
                      lineHeight: 1.8,
                    }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
