import emailjs from "@emailjs/browser";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const BOOKING_TEMPLATE = import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE_ID;
const CONTACT_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;

let initialized = false;

export function initEmail() {
  if (initialized || !PUBLIC_KEY) return;
  emailjs.init({ publicKey: PUBLIC_KEY });
  initialized = true;
}

export function isEmailConfigured() {
  return Boolean(PUBLIC_KEY && SERVICE_ID);
}

export async function sendBookingConfirm({ name, email, service, price, slotStart, slotEnd }) {
  if (!isEmailConfigured() || !BOOKING_TEMPLATE) {
    console.warn("[email] EmailJS booking template not configured; skipping send.");
    return { skipped: true };
  }
  return emailjs.send(SERVICE_ID, BOOKING_TEMPLATE, {
    to_name: name,
    to_email: email,
    service,
    price,
    slot_start: slotStart,
    slot_end: slotEnd,
  });
}

export async function sendContact({ name, email, message }) {
  if (!isEmailConfigured() || !CONTACT_TEMPLATE) {
    console.warn("[email] EmailJS contact template not configured; skipping send.");
    return { skipped: true };
  }
  return emailjs.send(SERVICE_ID, CONTACT_TEMPLATE, {
    from_name: name,
    from_email: email,
    message,
  });
}
