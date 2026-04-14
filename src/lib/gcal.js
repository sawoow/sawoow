const ENDPOINT = import.meta.env.VITE_GCAL_ENDPOINT;
const TOKEN = import.meta.env.VITE_GCAL_TOKEN;

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isGCalConfigured() {
  return Boolean(ENDPOINT);
}

export async function getBusy(date) {
  if (!ENDPOINT) return { busy: [], stubbed: true };
  const url = `${ENDPOINT}?action=busy&date=${toISODate(date)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch busy times (${res.status})`);
  return res.json();
}

export async function createEvent({ title, start, end, email, notes }) {
  if (!ENDPOINT) {
    console.warn("[gcal] VITE_GCAL_ENDPOINT not set; skipping event creation.");
    return { id: "demo-event", skipped: true };
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      token: TOKEN || "",
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      email,
      notes,
    }),
  });
  if (!res.ok) throw new Error(`Failed to create event (${res.status})`);
  return res.json();
}
