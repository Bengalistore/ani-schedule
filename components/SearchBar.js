"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-72">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search original or English title…"
        className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </div>
  );
}
