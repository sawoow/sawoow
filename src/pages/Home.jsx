import PlaceholderImage from "../components/PlaceholderImage.jsx";

export default function Home({ onBook }) {
  return (
    <div>
      <section
        style={{
          minHeight: "100vh",
          background: "#4A5C6A",
          display: "flex",
          alignItems: "center",
          paddingTop: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 60,
            width: 1,
            height: 200,
            background: "rgba(62,168,200,0.3)",
          }}
        />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "60px 24px",
            display: "flex",
            gap: 60,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 500px", minWidth: 280 }}>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#3EA8C8",
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              Diaspora Relocation Advisory
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(32px, 5vw, 56px)",
                color: "#fff",
                lineHeight: 1.2,
                fontWeight: 400,
                margin: "0 0 32px",
              }}
            >
              For those ready to return home to Uganda,
              <br />
              <span style={{ fontStyle: "italic", color: "#3EA8C8" }}>
                We make the journey
              </span>
              <br />
              clear, guided, and safe.
            </h1>
            <button
              onClick={() => onBook({ title: "Discovery Call", price: "$50", amount: 50 })}
              style={{
                background: "#3EA8C8",
                color: "#fff",
                border: "none",
                padding: "16px 40px",
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                transition: "all 0.3s",
                borderRadius: 0,
              }}
            >
              Book a Discovery Call
            </button>
          </div>
          <PlaceholderImage
            src="/images/intro.png"
            alt="Luzze Consultancy hero"
            label="Home page"
            monogram="L"
            style={{
              flex: "1 1 400px",
              minWidth: 280,
              height: 500,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          />
        </div>
      </section>

      <section
        style={{ background: "#4A5C6A", padding: "100px 24px", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(62,168,200,0.3), transparent)",
          }}
        />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#fff",
              fontWeight: 400,
              marginBottom: 40,
              fontStyle: "italic",
            }}
          >
            About
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 18,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            We guide members of the African diaspora to confidently reconnect with
            opportunity in East Africa starting with Uganda.
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            Our work bridges the gap between global professionalism and local realities.
            Through personalized consultancy sessions, cultural insights, and a trusted
            network, we help you navigate Uganda's business, real estate, and cultural
            landscape with clarity and peace of mind.
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              marginBottom: 48,
            }}
          >
            Our approach is simple: guided, protected, and transparent.
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}
          >
            {["Guided", "Protected", "Transparent"].map((v, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 40px",
                  border: "1px solid rgba(62,168,200,0.4)",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  color: "#3EA8C8",
                  fontStyle: "italic",
                  letterSpacing: 2,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -8,
                    left: 16,
                    background: "#4A5C6A",
                    padding: "0 8px",
                    fontSize: 10,
                    fontFamily: "'DM Sans', sans-serif",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: 3,
                    fontStyle: "normal",
                    textTransform: "uppercase",
                  }}
                >
                  0{i + 1}
                </div>
                {v}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
