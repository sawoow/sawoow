import { useEffect, useMemo, useState } from "react";
import { getBusy } from "../lib/gcal.js";
import {
  EAT_OFFSET_HOURS,
  formatEAT,
  formatLocal,
  viewerIsOnEAT,
} from "../lib/time.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Availability (in EAT): Mon–Fri 09:00–17:00, 30-min slots.
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const SLOT_MIN = 30;
const LEAD_MIN = 60;        // earliest bookable slot = now + 60 min
const BUFFER_MIN = 15;      // treat 15 min before/after a busy block as busy too
const MAX_MONTHS_AHEAD = 6; // don't allow booking more than 6 months in the future

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildDaySlotsEAT(date) {
  // Use the selected date's Y/M/D as the EAT date. Construct each slot's
  // instant as UTC = EAT - 3h so it renders correctly in any viewer timezone.
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const slots = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let min = 0; min < 60; min += SLOT_MIN) {
      const start = new Date(Date.UTC(y, m, d, h - EAT_OFFSET_HOURS, min));
      const end = new Date(start.getTime() + SLOT_MIN * 60000);
      slots.push({ start, end });
    }
  }
  return slots;
}

function overlapsWithBuffer(slot, busy) {
  const bufferMs = BUFFER_MIN * 60000;
  return busy.some((b) => {
    const bs = new Date(b.start).getTime() - bufferMs;
    const be = new Date(b.end).getTime() + bufferMs;
    return slot.start.getTime() < be && slot.end.getTime() > bs;
  });
}

function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function Calendar({ onSelect }) {
  const today = startOfDay(new Date());
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + MAX_MONTHS_AHEAD);
    return d;
  }, [today.getTime()]);
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [busy, setBusy] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  const cells = useMemo(() => monthGrid(view.year, view.month), [view]);
  const onEAT = viewerIsOnEAT();

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const earliest = new Date(Date.now() + LEAD_MIN * 60000);
    return buildDaySlotsEAT(selectedDate)
      .filter((s) => s.start > earliest)
      .map((s) => ({ ...s, busy: overlapsWithBuffer(s, busy) }));
  }, [selectedDate, busy]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    getBusy(selectedDate)
      .then((data) => {
        if (cancelled) return;
        if (data?.stubbed && import.meta.env.PROD) {
          setError("Availability check is unavailable. Please try again or contact us directly.");
          setBusy([]);
          return;
        }
        setBusy(Array.isArray(data?.busy) ? data.busy : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Could not load availability. Please try again in a moment, or contact us directly to book.");
        setBusy([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const atMinMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();
  const atMaxMonth =
    view.year === maxDate.getFullYear() && view.month === maxDate.getMonth();

  const changeMonth = (delta) => {
    if (delta < 0 && atMinMonth) return;
    if (delta > 0 && atMaxMonth) return;
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelectedDate(null);
  };

  const isSelectable = (d) => {
    if (!d) return false;
    if (d < today) return false;
    if (d > maxDate) return false;
    const dow = d.getDay();
    return dow !== 0 && dow !== 6;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          disabled={atMinMonth}
          style={{ ...arrowStyle, opacity: atMinMonth ? 0.35 : 1, cursor: atMinMonth ? "not-allowed" : "pointer" }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            color: "#4A5C6A",
          }}
        >
          {MONTHS[view.month]} {view.year}
        </div>
        <button
          onClick={() => changeMonth(1)}
          disabled={atMaxMonth}
          style={{ ...arrowStyle, opacity: atMaxMonth ? 0.35 : 1, cursor: atMaxMonth ? "not-allowed" : "pointer" }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1,
          color: "rgba(74,92,106,0.6)",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 16,
        }}
      >
        All times shown in <strong style={{ color: "#3EA8C8" }}>EAT</strong> (Uganda, UTC+3)
        {!onEAT && <> — your local time is shown alongside.</>}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {DAYS.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: 11,
              letterSpacing: 2,
              color: "rgba(74,92,106,0.6)",
              fontFamily: "'DM Sans', sans-serif",
              padding: 8,
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const selectable = isSelectable(d);
          const isSelected = selectedDate && sameDay(d, selectedDate);
          const isToday = sameDay(d, today);
          return (
            <button
              key={i}
              disabled={!selectable}
              onClick={() => setSelectedDate(d)}
              className="luzze-calendar-day"
              aria-label={`${d.toDateString()}${selectable ? "" : " unavailable"}`}
              style={{
                padding: "10px 0",
                border: "none",
                background: isSelected ? "#3EA8C8" : "transparent",
                color: isSelected
                  ? "#fff"
                  : selectable
                  ? "#4A5C6A"
                  : "rgba(74,92,106,0.35)",
                cursor: selectable ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: isToday ? 600 : 400,
                borderRadius: 4,
                outline: isToday && !isSelected ? "1px solid rgba(62,168,200,0.5)" : "none",
                transition: "background 0.2s",
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: "#3EA8C8",
              textTransform: "uppercase",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Available slots — {selectedDate.toDateString()}
          </div>
          {error && (
            <div style={{ color: "#c75a5a", fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}
          {loadingSlots ? (
            <div style={{ color: "rgba(74,92,106,0.7)", fontSize: 14 }}>Loading…</div>
          ) : error ? null : slots.length === 0 ? (
            <div style={{ color: "rgba(74,92,106,0.7)", fontSize: 14 }}>
              No slots available on this day.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 8,
              }}
            >
              {slots.map((s, i) => {
                const eat = formatEAT(s.start);
                const local = formatLocal(s.start);
                return (
                  <button
                    key={i}
                    disabled={s.busy}
                    onClick={() => onSelect(s)}
                    className="luzze-slot"
                    aria-label={`Book ${eat} EAT${onEAT ? "" : ` (${local} your time)`}${s.busy ? " — unavailable" : ""}`}
                    style={{
                      padding: "10px 8px",
                      border: "1px solid",
                      borderColor: s.busy ? "rgba(74,92,106,0.15)" : "#3EA8C8",
                      background: s.busy ? "rgba(74,92,106,0.05)" : "transparent",
                      color: s.busy ? "rgba(74,92,106,0.35)" : "#3EA8C8",
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: s.busy ? "not-allowed" : "pointer",
                      textDecoration: s.busy ? "line-through" : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{eat} EAT</span>
                    {!onEAT && (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>{local} local</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: "rgba(74,92,106,0.55)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Slots fill in 30-minute blocks. Earliest booking is {LEAD_MIN} minutes from now.
          </div>
        </div>
      )}
    </div>
  );
}

const arrowStyle = {
  background: "transparent",
  border: "1px solid rgba(74,92,106,0.25)",
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 18,
  color: "#4A5C6A",
  borderRadius: 4,
};
