import { useState, useEffect } from "react";

const pages = ["Your Journey Starts Here", "Why Luzze?", "Services", "Let's Connect"];

const resetButton = {
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: "inherit",
};

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
      aria-label="Primary"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(74,92,106,0.97)" : "rgba(74,92,106,0.88)",
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
        <button
          onClick={() => setCurrent(0)}
          aria-label="Luzze Consultancy — home"
          style={{
            ...resetButton,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          Luzze <span style={{ fontWeight: 300, opacity: 0.8 }}>consultancy</span>
        </button>
        <div style={{ display: "flex", gap: 32 }} className="desktop-nav">
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-current={current === i ? "page" : undefined}
              style={{
                ...resetButton,
                color: current === i ? "#3EA8C8" : "rgba(255,255,255,0.9)",
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
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={{ ...resetButton, padding: 8 }}
          className="mobile-menu-btn"
        >
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: "#fff",
              marginBottom: 6,
              transition: "all 0.3s",
              transform: open ? "rotate(45deg) translateY(8px)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: "#fff",
              marginBottom: 6,
              opacity: open ? 0 : 1,
              transition: "all 0.3s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: "#fff",
              transition: "all 0.3s",
              transform: open ? "rotate(-45deg) translateY(-8px)" : "none",
            }}
          />
        </button>
      </div>
      {open && (
        <div
          style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}
          className="mobile-dropdown"
        >
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setOpen(false);
              }}
              aria-current={current === i ? "page" : undefined}
              style={{
                ...resetButton,
                textAlign: "left",
                color: current === i ? "#3EA8C8" : "#fff",
                fontSize: 16,
                fontFamily: "'DM Sans', sans-serif",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <style>{`
        @media(min-width:769px){ .mobile-menu-btn{display:none!important} .mobile-dropdown{display:none!important} }
        @media(max-width:768px){ .desktop-nav{display:none!important} }
        nav button:focus-visible { outline: 2px solid #3EA8C8; outline-offset: 2px; }
      `}</style>
    </nav>
  );
}
