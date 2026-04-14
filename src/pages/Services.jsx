import HowItWorks from "../components/HowItWorks.jsx";
import FAQ from "../components/FAQ.jsx";

const services = [
  {
    num: "01",
    title: "Discovery Call",
    price: "$50",
    amount: 50,
    desc: "A 20-minute clarity call to map where you are, where you want to go, and what's standing in the way. You will leave knowing your next right move",
    btn: "Book now",
    bookable: true,
  },
  {
    num: "02",
    title: "1:1 Consultancy sessions",
    price: "$300",
    amount: 300,
    desc: "A 3-step advisory journey to help you design your relocation or investment plan with confidence. Together, we align your vision, strategy, and connect you to trusted partners so you can move smart, not blind",
    btn: "Book now",
    bookable: true,
  },
  {
    num: "03",
    title: "Custom Advisory Requests",
    price: "Contact for quote",
    amount: null,
    desc: "Tailored, hands-on support for any specific need, from logistics to introductions",
    btn: "Request a Quote",
    bookable: false,
  },
];

export default function Services({ onBook, onContact }) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", paddingTop: 100 }}>
    <section style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
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
            Our Offerings
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#4A5C6A",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            Book a consultancy
          </h2>
        </div>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {services.map((s, i) => (
            <div
              key={i}
              className="luzze-services-card"
              style={{
                flex: "1 1 300px",
                minWidth: 280,
                padding: "48px 36px",
                borderRight: i < services.length - 1 ? "1px solid rgba(74,92,106,0.1)" : "none",
                borderBottom: "1px solid rgba(74,92,106,0.1)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48,
                  color: "rgba(62,168,200,0.15)",
                  position: "absolute",
                  top: 16,
                  right: 24,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "#3EA8C8",
                  letterSpacing: 2,
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                {s.price}
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  color: "#4A5C6A",
                  fontWeight: 400,
                  marginBottom: 20,
                  lineHeight: 1.3,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: "#6b7c8a",
                  lineHeight: 1.8,
                  marginBottom: 32,
                  flexGrow: 1,
                }}
              >
                {s.desc}
              </p>
              <button
                onClick={() =>
                  s.bookable
                    ? onBook({ title: s.title, price: s.price, amount: s.amount })
                    : onContact && onContact()
                }
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: "1px solid #4A5C6A",
                  color: "#4A5C6A",
                  padding: "12px 32px",
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  transition: "all 0.3s",
                  marginTop: "auto",
                }}
              >
                {s.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>

    <HowItWorks />
    <FAQ />
    </div>
  );
}
