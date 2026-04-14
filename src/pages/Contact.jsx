import ContactForm from "../components/ContactForm.jsx";

const contactInfo = [
  { icon: "◎", label: "Address", value: "Plot 1207, Namanve-Kiwanga, Mukono" },
  { icon: "✆", label: "Phone", value: "+256 778 962 504" },
  { icon: "✉", label: "Email", value: "sauda.luzze@gmail.com" },
  { icon: "◉", label: "Connect", value: "Facebook · Twitter · LinkedIn · Instagram" },
];

export default function Contact() {
  return (
    <section style={{ background: "#4A5C6A", minHeight: "100vh", paddingTop: 100 }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "#fff",
            fontWeight: 400,
            marginBottom: 16,
            fontStyle: "italic",
          }}
        >
          Have Questions? Let's Connect!
        </h2>
        <div
          style={{
            width: 60,
            height: 1,
            background: "#3EA8C8",
            margin: "0 auto 60px",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 80,
            textAlign: "center",
          }}
        >
          {contactInfo.map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 24, color: "#3EA8C8", marginBottom: 12 }}>{c.icon}</div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  letterSpacing: 3,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>

        <ContactForm />

        <div
          style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          © Luzze Consultancy
        </div>
      </div>
    </section>
  );
}
