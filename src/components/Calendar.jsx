import { useEffect, useMemo, useState } from "react";
import { getBusy } from "../lib/gcal.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Business hours (local): 9:00 – 17:00, Mon–Fri, 30-minute slots.
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const SLOT_MIN = 30;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMinutes(d, min) {
  return new Date(d.getTime() + min * 60000);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildDaySlots(date) {
  const base = startOfDay(date);
  const slots = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MIN) {
      const start = new Date(base);
      start.setHours(h, m, 0, 0);
      const end = addMinutes(start, SLOT_MIN);
      slots.push({ start, end });
    }
  }
  return slots;
}

function overlaps(slot, busy) {
  return busy.some((b) => {
    const bs = new Date(b.start);
    const be = new Date(b.end);
    return slot.start < be && slot.end > bs;
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
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [busy, setBusy] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  const cells = useMemo(() => monthGrid(view.year, view.month), [view]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return buildDaySlots(selectedDate)
      .filter((s) => s.start > new Date())
      .map((s) => ({ ...s, busy: overlaps(s, busy) }));
  }, [selectedDate, busy]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    getBusy(selectedDate)
      .then((data) => {
        if (cancelled) return;
        setBusy(Array.isArray(data?.busy) ? data.busy : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Could not load availability. Showing all slots as available.");
        setBusy([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const changeMonth = (delta) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelectedDate(null);
  };

  const isSelectable = (d) => {
    if (!d) return false;
    if (d < today) return false;
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
          marginBottom: 20,
        }}
      >
        <button onClick={() => changeMonth(-1)} style={arrowStyle} aria-label="Previous month">
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
        <button onClick={() => changeMonth(1)} style={arrowStyle} aria-label="Next month">
          ›
        </button>
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
              color: "rgba(74,92,106,0.5)",
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
              style={{
                padding: "10px 0",
                border: "none",
                background: isSelected ? "#3EA8C8" : "transparent",
                color: isSelected
                  ? "#fff"
                  : selectable
                  ? "#4A5C6A"
                  : "rgba(74,92,106,0.3)",
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
            <div style={{ color: "rgba(74,92,106,0.6)", fontSize: 14 }}>Loading…</div>
          ) : slots.length === 0 ? (
            <div style={{ color: "rgba(74,92,106,0.6)", fontSize: 14 }}>
              No slots available on this day.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: 8,
              }}
            >
              {slots.map((s, i) => {
                const label = s.start.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                });
                return (
                  <button
                    key={i}
                    disabled={s.busy}
                    onClick={() => onSelect(s)}
                    style={{
                      padding: "10px 8px",
                      border: "1px solid",
                      borderColor: s.busy ? "rgba(74,92,106,0.15)" : "#3EA8C8",
                      background: s.busy ? "rgba(74,92,106,0.05)" : "transparent",
                      color: s.busy ? "rgba(74,92,106,0.3)" : "#3EA8C8",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: s.busy ? "not-allowed" : "pointer",
                      textDecoration: s.busy ? "line-through" : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const arrowStyle = {
  background: "transparent",
  border: "1px solid rgba(74,92,106,0.2)",
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 18,
  color: "#4A5C6A",
  borderRadius: 4,
};
