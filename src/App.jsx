import { useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import WhyLuzze from "./pages/WhyLuzze.jsx";
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";
import BookingModal from "./components/BookingModal.jsx";
import { initEmail } from "./lib/email.js";

export default function App() {
  const [current, setCurrent] = useState(0);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    initEmail();
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
      {current === 1 && <WhyLuzze />}
      {current === 2 && <Services onBook={openBooking} onContact={goToContact} />}
      {current === 3 && <Contact />}
      {booking && <BookingModal service={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
