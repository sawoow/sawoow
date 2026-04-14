const quotes = [
  {
    text:
      "Sauda's guidance made what felt impossible — moving my family back to Kampala — actually doable. Clear, honest, and zero wasted time.",
    name: "Ruth A.",
    context: "Relocated from London · 2024",
  },
  {
    text:
      "I came in with a vague investment idea and left with a shortlist of vetted partners and a 90-day plan. Worth every dollar.",
    name: "Daniel M.",
    context: "Diaspora investor · Toronto",
  },
  {
    text:
      "Finally, someone who understood both sides — the Western mindset I was coming from and the Ugandan realities I was walking into.",
    name: "Priscilla K.",
    context: "Returned from Berlin · 2023",
  },
];

export default function Testimonials() {
  return (
    <section
      style={{
        background: "#4A5C6A",
        padding: "100px 24px",
        borderTop: "1px solid rgba(62,168,200,0.2)",
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
          In their words
        </div>
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            color: "#fff",
            fontWeight: 400,
            fontStyle: "italic",
            marginTop: 0,
            marginBottom: 56,
          }}
        >
          Clients who've made the journey
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 28,
          }}
        >
          {quotes.map((q, i) => (
            <figure
              key={i}
              style={{
                margin: 0,
                padding: 28,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(62,168,200,0.25)",
                color: "#fff",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48,
                  color: "#3EA8C8",
                  lineHeight: 0.4,
                  marginBottom: 12,
                }}
                aria-hidden="true"
              >
                “
              </div>
              <blockquote
                style={{
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {q.text}
              </blockquote>
              <figcaption
                style={{
                  marginTop: 20,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "#3EA8C8",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {q.name}
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.65)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {q.context}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Names changed on request. Full references available on enquiry.
        </div>
      </div>
    </section>
  );
}
