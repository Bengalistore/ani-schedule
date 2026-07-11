"use client";

import { useEffect, useState, cloneElement } from "react";
import { useRouter } from "next/navigation";

const EMPTY_FORM = {
  titleOriginal: "",
  titleEnglish: "",
  image: "",
  type: "TV",
  genres: "",
  description: "",
  streamUrl: "",
  streamPlatform: "",
  status: "airing",
  firstEpisodeAt: "",
  releaseYear: "",
  releaseMonth: "",
  intervalDays: 7,
  totalEpisodes: "",
  nextEpisodeNumber: "",
  nextEpisodeAt: "",
  seoTitle: "",
  seoDescription: ""
};

export default function AdminPanel() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  async function loadList() {
    setLoading(true);
    const res = await fetch("/api/anime");
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadList();
  }, []);

  function startEdit(anime) {
    setEditingId(anime._id);
    setForm({
      titleOriginal: anime.titleOriginal || "",
      titleEnglish: anime.titleEnglish || "",
      image: anime.image || "",
      type: anime.type || "TV",
      genres: (anime.genres || []).join(", "),
      description: anime.description || "",
      streamUrl: anime.streamUrl || "",
      streamPlatform: anime.streamPlatform || "",
      status: anime.status || "airing",
      firstEpisodeAt: anime.firstEpisodeAt
        ? toLocalInputValue(anime.firstEpisodeAt)
        : "",
      releaseYear: anime.releaseYear || "",
      releaseMonth: anime.releaseMonth || "",
      intervalDays: anime.intervalDays || 7,
      totalEpisodes: anime.totalEpisodes || "",
      nextEpisodeNumber: anime.nextEpisodeNumber || "",
      nextEpisodeAt: anime.nextEpisodeAt ? toLocalInputValue(anime.nextEpisodeAt) : "",
      seoTitle: anime.seoTitle || "",
      seoDescription: anime.seoDescription || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      genres: form.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      firstEpisodeAt: form.firstEpisodeAt
        ? new Date(form.firstEpisodeAt).toISOString()
        : null,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
      releaseMonth: form.releaseMonth ? Number(form.releaseMonth) : null,
      intervalDays: Number(form.intervalDays) || 7,
      totalEpisodes: form.totalEpisodes ? Number(form.totalEpisodes) : null,
      nextEpisodeNumber: form.nextEpisodeNumber ? Number(form.nextEpisodeNumber) : null,
      nextEpisodeAt: form.nextEpisodeAt
        ? new Date(form.nextEpisodeAt).toISOString()
        : null
    };

    const url = editingId ? `/api/anime/${editingId}` : "/api/anime";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);

    if (res.ok) {
      resetForm();
      loadList();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this anime? This cannot be undone.")) return;
    await fetch(`/api/anime/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    loadList();
  }

  async function handleImport(mode) {
    setImporting(true);
    setImportError("");
    setImportResult(null);

    const res = await fetch("/api/admin/import-anilist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });

    const data = await res.json().catch(() => ({}));
    setImporting(false);

    if (res.ok) {
      setImportResult(data);
      loadList();
    } else {
      setImportError(data.error || "Import failed.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            RESTRICTED
          </p>
          <h1 className="font-display text-2xl tracking-wide text-white">
            Admin Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-white"
        >
          Log out
        </button>
      </div>

      <div className="mb-10 rounded-card border border-line bg-surface p-6">
        <h2 className="font-display text-lg tracking-wide text-white">
          Import from AniList
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pulls currently-airing episode times and/or announced upcoming anime
          from AniList (the same source AniChart runs on) and adds or updates
          them automatically. Watch links you&apos;ve set manually are never
          overwritten.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => handleImport("airing")}
            disabled={importing}
            className="rounded-full bg-surface2 px-4 py-2 text-sm font-semibold text-white hover:bg-surface2/70 disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import Airing"}
          </button>
          <button
            onClick={() => handleImport("upcoming")}
            disabled={importing}
            className="rounded-full bg-surface2 px-4 py-2 text-sm font-semibold text-white hover:bg-surface2/70 disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import Upcoming"}
          </button>
          <button
            onClick={() => handleImport("both")}
            disabled={importing}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import Both"}
          </button>
        </div>

        {importResult && (
          <p className="mt-3 text-sm text-onair">
            Done — {importResult.created} added, {importResult.updated} updated
            (of {importResult.total} checked).
          </p>
        )}
        {importError && <p className="mt-3 text-sm text-accent">{importError}</p>}

        <p className="mt-3 text-xs text-muted">
          This also runs automatically every 6 hours if you&apos;ve set up the{" "}
          <code className="text-white">CRON_SECRET</code> env var and deployed
          with the included <code className="text-white">vercel.json</code>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-10 grid gap-4 rounded-card border border-line bg-surface p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-full font-display text-lg tracking-wide text-white">
          {editingId ? "Edit anime" : "Add anime"}
        </h2>

        <Field label="Original title">
          <input
            required
            value={form.titleOriginal}
            onChange={(v) => setForm({ ...form, titleOriginal: v })}
          />
        </Field>

        <Field label="English title">
          <input
            required
            value={form.titleEnglish}
            onChange={(v) => setForm({ ...form, titleEnglish: v })}
          />
        </Field>

        <Field label="Poster image URL" full>
          <input
            required
            value={form.image}
            onChange={(v) => setForm({ ...form, image: v })}
          />
        </Field>

        <Field label="Type">
          <select value={form.type} onChange={(v) => setForm({ ...form, type: v })}>
            {["TV", "Movie", "OVA", "ONA", "Special"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select value={form.status} onChange={(v) => setForm({ ...form, status: v })}>
            <option value="airing">Airing (Schedule tab)</option>
            <option value="upcoming">Upcoming (Upcoming tab)</option>
            <option value="finished">Finished</option>
          </select>
        </Field>

        <Field label="Genres (comma separated)" full>
          <input
            placeholder="Action, Fantasy, Shounen"
            value={form.genres}
            onChange={(v) => setForm({ ...form, genres: v })}
          />
        </Field>

        <Field label="Description" full>
          <textarea
            rows={3}
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
        </Field>

        <Field label="Official watch URL">
          <input
            value={form.streamUrl}
            onChange={(v) => setForm({ ...form, streamUrl: v })}
          />
        </Field>

        <Field label="Platform label (e.g. Crunchyroll)">
          <input
            value={form.streamPlatform}
            onChange={(v) => setForm({ ...form, streamPlatform: v })}
          />
        </Field>

        <Field label="First episode date & time">
          <input
            type="datetime-local"
            value={form.firstEpisodeAt}
            onChange={(v) => setForm({ ...form, firstEpisodeAt: v })}
          />
        </Field>

        <Field label="Days between episodes">
          <input
            type="number"
            min="1"
            value={form.intervalDays}
            onChange={(v) => setForm({ ...form, intervalDays: v })}
          />
        </Field>

        <p className="col-span-full -mb-2 text-xs text-muted">
          Don&apos;t know the exact date yet? Leave it blank and just set a release
          year/month below — you can add the exact date later once it&apos;s announced.
        </p>

        <Field label="Release year (upcoming only)">
          <input
            type="number"
            value={form.releaseYear}
            onChange={(v) => setForm({ ...form, releaseYear: v })}
          />
        </Field>

        <Field label="Release month (1–12, upcoming only)">
          <input
            type="number"
            min="1"
            max="12"
            value={form.releaseMonth}
            onChange={(v) => setForm({ ...form, releaseMonth: v })}
          />
        </Field>

        <Field label="Total episodes (optional)">
          <input
            type="number"
            value={form.totalEpisodes}
            onChange={(v) => setForm({ ...form, totalEpisodes: v })}
          />
        </Field>

        <p className="col-span-full -mb-2 text-xs text-muted">
          Episode delayed or didn&apos;t air on time? Set these two fields to
          correct it — everything after that will keep auto-continuing on
          schedule from the new date, no further edits needed.
        </p>

        <Field label="Correct: next episode number">
          <input
            type="number"
            min="1"
            placeholder="e.g. 5"
            value={form.nextEpisodeNumber}
            onChange={(v) => setForm({ ...form, nextEpisodeNumber: v })}
          />
        </Field>

        <Field label="Correct: next episode date & time">
          <input
            type="datetime-local"
            value={form.nextEpisodeAt}
            onChange={(v) => setForm({ ...form, nextEpisodeAt: v })}
          />
        </Field>

        <Field label="SEO title (optional)">
          <input
            value={form.seoTitle}
            onChange={(v) => setForm({ ...form, seoTitle: v })}
          />
        </Field>

        <Field label="SEO description (optional)" full>
          <textarea
            rows={2}
            value={form.seoDescription}
            onChange={(v) => setForm({ ...form, seoDescription: v })}
          />
        </Field>

        {error && <p className="col-span-full text-sm text-accent">{error}</p>}

        <div className="col-span-full flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add anime"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-white"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <h2 className="mb-4 font-display text-lg tracking-wide text-white">
        All anime ({list.length})
      </h2>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="space-y-2">
          {list.map((anime) => (
            <div
              key={anime._id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {anime.titleEnglish}{" "}
                  <span className="text-muted">· {anime.status}</span>
                </p>
                <p className="truncate text-xs text-muted">{anime.titleOriginal}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(anime)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(anime._id)}
                  className="rounded-full border border-accent/40 px-3 py-1.5 text-xs text-accent hover:bg-accent/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Field({ label, children, full }) {
  // Wires shared styling + a simplified onChange(value) signature onto the
  // single input/select/textarea passed in as a child.
  const styled = cloneElement(children, {
    className:
      "rounded-lg border border-line bg-surface2 px-3 py-2.5 text-white focus:border-accent focus:outline-none",
    onChange: (e) => children.props.onChange(e.target.value)
  });

  return (
    <label className={`flex flex-col gap-1.5 text-sm text-muted ${full ? "sm:col-span-2" : ""}`}>
      {label}
      {styled}
    </label>
  );
}

function toLocalInputValue(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
