"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseRelativeDate } from "@/lib/dateParse";

function formatPretty(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function AddScheduleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Don't overwrite a date the person picked themselves.
    if (date && !autoDetected) return;
    const detected = parseRelativeDate(value);
    setDate(detected || "");
    setAutoDetected(!!detected);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setAutoDetected(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date: date || null, notes: null }),
      });
      setTitle("");
      setDate("");
      setAutoDetected(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-3">
      <h2 className="text-2xl font-semibold text-warmbrown">Add something to look forward to</h2>
      <p className="text-base text-warmbrown/70">
        Type it naturally, like &ldquo;Visit from Grandkids next week&rdquo;
        — we&apos;ll figure out the date for you.
      </p>
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="e.g. Visit from Grandkids next week"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="flex-1 min-w-[200px] rounded-xl border-2 border-warmbrown/20 p-3 text-lg focus:outline-none focus:border-softblue"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-xl border-2 border-warmbrown/20 p-3 text-lg focus:outline-none focus:border-softblue"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-softblue text-white text-lg font-bold shadow hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </div>
      {autoDetected && date && (
        <p className="text-sm text-gentlegreen">
          📅 We figured this means {formatPretty(date)} — change the date
          above if that&apos;s not right.
        </p>
      )}
    </form>
  );
}
