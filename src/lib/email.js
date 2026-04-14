import emailjs from "@emailjs/browser";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
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
