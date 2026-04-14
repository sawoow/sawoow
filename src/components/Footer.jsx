const linkStyle = {
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  letterSpacing: 1,
  color: "rgba(255,255,255,0.7)",
  textDecoration: "none",
};

export default function Footer({ onOpenLegal }) {
  return (
    <footer
      style={{
        background: "#3b4a57",
        color: "rgba(255,255,255,0.7)",
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
        }}
      >
        <div>© {new Date().getFullYear()} Luzze Consultancy. All rights reserved.</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <button style={linkStyle} onClick={() => onOpenLegal("privacy")}>
            Privacy
          </button>
          <button style={linkStyle} onClick={() => onOpenLegal("terms")}>
            Terms
          </button>
          <button style={linkStyle} onClick={() => onOpenLegal("refund")}>
            Refund policy
          </button>
          <a
            style={linkStyle}
            href="mailto:sauda.luzze@gmail.com"
          >
            sauda.luzze@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
