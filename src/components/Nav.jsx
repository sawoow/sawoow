import { useState, useEffect } from "react";

const pages = ["The Journey Starts Here", "Why Luzze", "Services", "Let's Connect"];

export default function Nav({ current, setCurrent }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(74,92,106,0.97)" : "rgba(74,92,106,0.85)",
        backdropFilter: "blur(12px)",
        transition: "all 0.4s ease",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            color: "#fff",
            letterSpacing: 1,
            cursor: "pointer",
          }}
          onClick={() => setCurrent(0)}
        >
          Luzze <span style={{ fontWeight: 300, opacity: 0.7 }}>consultancy</span>
        </div>
        <div style={{ display: "flex", gap: 32 }} className="desktop-nav">
          {pages.map((p, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                color: current === i ? "#3EA8C8" : "rgba(255,255,255,0.75)",
                cursor: "pointer",
                fontSize: 13,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontFamily: "'DM Sans', Helvetica, sans-serif",
                fontWeight: 500,
                borderBottom: current === i ? "2px solid #3EA8C8" : "2px solid transparent",
                paddingBottom: 4,
                transition: "all 0.3s",
              }}
            >
              {p}
            </div>
          ))}
        </div>
        <div
          onClick={() => setOpen(!open)}
          style={{ cursor: "pointer", padding: 8 }}
          className="mobile-menu-btn"
        >
          <div
            style={{
              width: 24,
              height: 2,
              background: "#fff",
              marginBottom: 6,
              transition: "all 0.3s",
              transform: open ? "rotate(45deg) translateY(8px)" : "none",
            }}
          />
          <div
            style={{
              width: 24,
              height: 2,
              background: "#fff",
              marginBottom: 6,
              opacity: open ? 0 : 1,
              transition: "all 0.3s",
            }}
          />
          <div
            style={{
              width: 24,
              height: 2,
              background: "#fff",
              transition: "all 0.3s",
              transform: open ? "rotate(-45deg) translateY(-8px)" : "none",
            }}
          />
        </div>
      </div>
      {open && (
        <div
          style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}
          className="mobile-dropdown"
        >
          {pages.map((p, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrent(i);
                setOpen(false);
              }}
              style={{
                color: current === i ? "#3EA8C8" : "#fff",
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      )}
      <style>{`
        @media(min-width:769px){ .mobile-menu-btn{display:none!important} .mobile-dropdown{display:none!important} }
        @media(max-width:768px){ .desktop-nav{display:none!important} }
      `}</style>
    </nav>
  );
}
