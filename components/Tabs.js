"use client";

export default function Tabs({ active, onChange }) {
  const tabs = [
    { key: "schedule", label: "Schedule" },
    { key: "upcoming", label: "Upcoming" }
  ];

  return (
    <div className="inline-flex rounded-full border border-line bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            active === tab.key
              ? "bg-accent text-white"
              : "text-muted hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
