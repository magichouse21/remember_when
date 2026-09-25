"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import { parseRelativeDate } from "@/lib/dateParse";

type UpcomingDraft = {
  title: string;
  date: string; // YYYY-MM-DD, or "" if none detected/chosen
  autoDetected: boolean; // true if `date` was filled in from the title text
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatPretty(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function NewEntryPage() {
  const router = useRouter();
  const [date] = useState(todayISO());
  const [text, setText] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [upcoming, setUpcoming] = useState<UpcomingDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = (chunk: string) => {
    setText((prev) => (prev ? `${prev} ${chunk}` : chunk));
  };

  const addUpcomingRow = () => {
    setUpcoming((prev) => [...prev, { title: "", date: "", autoDetected: false }]);
  };

  const updateUpcomingTitle = (index: number, title: string) => {
    setUpcoming((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        // Only auto-fill the date while the person hasn't manually picked
        // one themselves, so we never stomp on a deliberate choice.
        if (row.date && !row.autoDetected) {
          return { ...row, title };
        }
        const detected = parseRelativeDate(title);
        return {
          ...row,
          title,
          date: detected || "",
          autoDetected: !!detected,
        };
      })
    );
  };

  const updateUpcomingDate = (index: number, newDate: string) => {
    setUpcoming((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, date: newDate, autoDetected: false } : row
      )
    );
  };

  const removeUpcomingRow = (index: number) => {
    setUpcoming((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please write or say a little something about your day first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          text,
          isSpecial,
          upcoming: upcoming
            .filter((u) => u.title.trim())
            .map((u) => ({ title: u.title.trim(), date: u.date || null })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save entry");
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong saving your entry. Please try again.");
      setSaving(false);
    }
  };

  const prettyDate = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-warmbrown">How was your day?</h1>
        <p className="text-xl text-warmbrown/70 mt-1">{prettyDate}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <VoiceRecorder onTranscript={handleTranscript} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your day here, or tap the microphone above and talk..."
            rows={8}
            className="w-full rounded-xl border-2 border-warmbrown/20 p-4 text-lg leading-relaxed focus:outline-none focus:border-softblue"
          />
          <label className="flex items-center gap-3 text-lg">
            <input
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
              className="w-6 h-6 accent-blush"
            />
            This was a special day I want to remember
          </label>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-warmbrown">
            Anything you&apos;re looking forward to?
          </h2>
          <p className="text-base text-warmbrown/70">
            Just type it naturally, like &ldquo;Trip to Disneyland next
            week&rdquo; — we&apos;ll figure out the date and add it to your
            Schedule. You can still pick a date yourself if you&apos;d rather.
          </p>
          <div className="space-y-3">
            {upcoming.map((row, index) => (
              <div key={index} className="space-y-1">
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    placeholder="e.g. Trip to Disneyland next week"
                    value={row.title}
                    onChange={(e) => updateUpcomingTitle(index, e.target.value)}
                    className="flex-1 min-w-[220px] rounded-xl border-2 border-warmbrown/20 p-3 text-lg focus:outline-none focus:border-softblue"
                  />
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateUpcomingDate(index, e.target.value)}
                    className="rounded-xl border-2 border-warmbrown/20 p-3 text-lg focus:outline-none focus:border-softblue"
                  />
                  <button
                    type="button"
                    onClick={() => removeUpcomingRow(index)}
                    className="text-warmbrown/60 hover:text-blush text-2xl leading-none px-2"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
                {row.autoDetected && row.date && (
                  <p className="text-sm text-gentlegreen pl-1">
                    📅 We figured this means {formatPretty(row.date)} — change
                    the date above if that&apos;s not right.
                  </p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addUpcomingRow}
            className="px-4 py-2 rounded-xl bg-gentlegreen/10 text-gentlegreen font-semibold hover:bg-gentlegreen/20 transition"
          >
            + Add something to look forward to
          </button>
        </section>

        {error && <p className="text-blush font-medium text-lg">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-softblue text-white text-xl font-bold shadow hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save My Entry"}
        </button>
      </form>
    </div>
  );
}
