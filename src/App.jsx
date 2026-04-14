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

function resumeStripeRedirect() {
  const params = new URLSearchParams(window.location.search);
  const piId = params.get("payment_intent");
  const status = params.get("redirect_status");
  if (!piId) return null;

  const pending = JSON.parse(sessionStorage.getItem("luzze.pendingBooking") || "null");
  // Clean the URL either way so refreshes don't re-trigger.
  window.history.replaceState({}, "", window.location.pathname);

  if (!pending || pending.paymentIntentId !== piId) return null;
  if (status !== "succeeded") return null;

  return {
    service: pending.service,
    customer: pending.customer,
    slot: {
      start: new Date(pending.slot.start),
      end: new Date(pending.slot.end),
    },
    bookingId: pending.bookingId,
    paymentIntentId: pending.paymentIntentId,
  };
}

export default function App() {
  const [current, setCurrent] = useState(0);
  const [booking, setBooking] = useState(null);
  const [legal, setLegal] = useState(null);
  const [resumedBooking, setResumedBooking] = useState(null);

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
    const resumed = resumeStripeRedirect();
    if (resumed) setResumedBooking(resumed);
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
      {resumedBooking && (
        <BookingModal
          service={resumedBooking.service}
          slot={resumedBooking.slot}
          customer={resumedBooking.customer}
          bookingId={resumedBooking.bookingId}
          paymentIntentId={resumedBooking.paymentIntentId}
          initialStep="finalizing"
          onClose={() => setResumedBooking(null)}
        />
      )}
      {legal && <LegalModal doc={legal} onClose={() => setLegal(null)} />}
    </div>
  );
}
