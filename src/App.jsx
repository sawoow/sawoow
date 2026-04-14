import { useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import WhyLuzze from "./pages/WhyLuzze.jsx";
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";
import BookingModal from "./components/BookingModal.jsx";
import LegalModal from "./components/LegalModal.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppFab from "./components/WhatsAppFab.jsx";
import { initEmail } from "./lib/email.js";

export default function App() {
  const [current, setCurrent] = useState(0);
  const [booking, setBooking] = useState(null);
  const [legal, setLegal] = useState(null);

  useEffect(() => {
    initEmail();
    const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (plausibleDomain && !document.querySelector("script[data-plausible]")) {
      const s = document.createElement("script");
      s.setAttribute("data-plausible", "");
      s.defer = true;
      s.dataset.domain = plausibleDomain;
      s.src = "https://plausible.io/js/script.js";
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current]);

  const openBooking = (service) => setBooking(service);
  const goToContact = () => setCurrent(3);

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Nav current={current} setCurrent={setCurrent} />
      {current === 0 && <Home onBook={openBooking} />}
      {current === 1 && <WhyLuzze onBook={openBooking} onContact={goToContact} />}
      {current === 2 && <Services onBook={openBooking} onContact={goToContact} />}
      {current === 3 && <Contact />}
      <Footer onOpenLegal={setLegal} />
      <WhatsAppFab />
      {booking && <BookingModal service={booking} onClose={() => setBooking(null)} />}
      {legal && <LegalModal doc={legal} onClose={() => setLegal(null)} />}
    </div>
  );
}
