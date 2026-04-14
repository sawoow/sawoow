import PlaceholderImage from "../components/PlaceholderImage.jsx";

const paragraphs = [
  "After living in six countries across Africa and Europe, I know firsthand how exciting, yet overwhelming, it can be to relocate. When I moved back to Uganda, I saw how many in the diaspora struggled to navigate systems, build trusted connections, and feel truly at home again.",
  "That's why I founded Luzze Consultancy, to make the return easier, more intentional, and more informed for others.",
  "With a deep local network and a clear understanding of Uganda's business and social landscape, I wanted to offer what I couldn't find myself: personalised support that's both practical and culturally grounded.",
  "I bring a diaspora-informed perspective, rooted in empathy and lived experience. I know what it's like to leave stability behind and build a new chapter from scratch, and what it takes to make that journey smoother, safer, and more fulfilling.",
];

export default function WhyLuzze() {
  return (
    <section style={{ background: "#4A5C6A", minHeight: "100vh", paddingTop: 100 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 24px",
          display: "flex",
          gap: 60,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <PlaceholderImage
          src="/images/founder.jpeg"
          alt="Luzze founder"
          orientation="none"
          style={{
            flex: "1 1 400px",
            minWidth: 280,
            height: 600,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            Founder Photo
          </div>
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 60,
              height: 60,
              border: "1px solid rgba(62,168,200,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3EA8C8",
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontStyle: "italic",
            }}
          >
            S
          </div>
        </PlaceholderImage>
        <div style={{ flex: "1 1 500px", minWidth: 280 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 4,
              color: "#3EA8C8",
              textTransform: "uppercase",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            The Story
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#fff",
              fontWeight: 400,
              marginBottom: 40,
              lineHeight: 1.2,
            }}
          >
            Why I started this
          </h2>
          {paragraphs.map((t, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
                lineHeight: 1.9,
                marginBottom: 24,
                paddingLeft: i > 0 ? 20 : 0,
                borderLeft: i > 0 ? "2px solid rgba(62,168,200,0.2)" : "none",
              }}
            >
              {t}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
