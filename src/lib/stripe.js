const ENDPOINT = import.meta.env.VITE_GCAL_ENDPOINT;
const TOKEN = import.meta.env.VITE_GCAL_TOKEN;

function endpointWith(action) {
  if (!ENDPOINT) return null;
  const sep = ENDPOINT.includes("?") ? "&" : "?";
  return `${ENDPOINT}${sep}action=${action}`;
}

async function postJSON(action, payload) {
  const url = endpointWith(action);
  if (!url) throw new Error("Booking endpoint not configured");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ token: TOKEN || "", ...payload }),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const body = await res.json();
  if (body.error) throw new Error(body.error);
  return body;
}

export function isStripeBackendConfigured() {
  return Boolean(ENDPOINT);
}

export async function createPaymentIntent({ bookingId, service, slot, customer }) {
  return postJSON("create-payment-intent", {
    bookingId,
    service: {
      title: service.title,
      amount: service.amount,
      price: service.price,
    },
    slot: {
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    },
    customer: {
      name: customer.name,
      email: customer.email,
    },
  });
}

export async function finalizeBooking({ bookingId, paymentIntentId }) {
  return postJSON("finalize-booking", { bookingId, paymentIntentId });
}

export function newBookingId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
