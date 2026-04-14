// EAT is UTC+3 year-round (Uganda does not observe DST).
export const EAT_OFFSET_HOURS = 3;
export const EAT_TZ = "Africa/Nairobi";

export function formatEAT(date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: EAT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatLocal(date) {
  return new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function viewerLocalTZ() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

export function viewerIsOnEAT() {
  return viewerLocalTZ() === EAT_TZ;
}

export function formatSlotRangeFull(start, end) {
  const datePart = new Intl.DateTimeFormat("en-GB", {
    timeZone: EAT_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
  const eatRange = `${formatEAT(start)}–${formatEAT(end)} EAT`;
  if (viewerIsOnEAT()) return `${datePart} · ${eatRange}`;
  const localRange = `${formatLocal(start)}–${formatLocal(end)} your time`;
  return `${datePart} · ${eatRange} · ${localRange}`;
}
