"use client";

const DAYS = [
  { key: 0, label: "Sun" },
  { key: 1, label: "Mon" },
  { key: 2, label: "Tue" },
  { key: 3, label: "Wed" },
  { key: 4, label: "Thu" },
  { key: 5, label: "Fri" },
  { key: 6, label: "Sat" }
];

export default function WeekdayTabs({ active, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      <button
        onClick={() => onChange("all")}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
          active === "all"
            ? "bg-gold text-ink"
            : "border border-line text-muted hover:text-white"
        }`}
      >
        All
      </button>
      {DAYS.map((day) => (
        <button
          key={day.key}
          onClick={() => onChange(day.key)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            active === day.key
              ? "bg-gold text-ink"
              : "border border-line text-muted hover:text-white"
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
