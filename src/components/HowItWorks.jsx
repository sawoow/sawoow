const steps = [
  {
    n: "01",
    title: "Book a discovery call",
    body:
      "20 minutes to understand where you are, what you're navigating, and whether we're the right fit. You leave with your next concrete step.",
  },
  {
    n: "02",
    title: "Design your plan",
    body:
      "Across a structured 1:1 journey we map out your relocation or investment — timeline, budget, partners, and the risks most people miss.",
  },
  {
    n: "03",
    title: "Land on the ground",
    body:
      "Warm introductions to vetted legal, real estate, and business partners on the Ugandan side, plus ongoing check-ins as you settle in.",
  },
];

export default function HowItWorks() {
  return (
    <section
      style={{
        background: "#f6f7f8",
        padding: "80px 24px",
        borderBottom: "1px solid rgba(74,92,106,0.08)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
          How it works
        </div>
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "#4A5C6A",
            fontWeight: 400,
            fontStyle: "italic",
            marginTop: 0,
            marginBottom: 48,
          }}
        >
          A simple, guided journey
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 28,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: 28,
                borderLeft: "3px solid #3EA8C8",
                boxShadow: "0 2px 8px rgba(74,92,106,0.05)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36,
                  color: "rgba(62,168,200,0.3)",
                  marginBottom: 8,
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  color: "#4A5C6A",
                  margin: "0 0 10px",
                  fontWeight: 400,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "#6b7c8a",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
