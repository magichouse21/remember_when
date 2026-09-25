import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryById, getScheduleItemsForEntry } from "@/lib/storage";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EntryDetailPage({ params }: { params: { id: string } }) {
  const entry = getEntryById(params.id);
  if (!entry) {
    notFound();
  }

  const relatedSchedule = getScheduleItemsForEntry(entry.id);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-softblue font-medium hover:underline">
        ← Back to home
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-warmbrown">
          {formatDate(entry.date)}
        </h1>
        {entry.isSpecial && (
          <p className="text-blush font-semibold mt-1">★ A special day</p>
        )}
      </div>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-warmbrown/70 mb-3">
          Full entry
        </h2>
        <p className="text-lg text-warmbrown whitespace-pre-wrap leading-relaxed">
          {entry.text}
        </p>
      </section>

      {relatedSchedule.length > 0 && (
        <section className="bg-gentlegreen/10 rounded-2xl p-6 space-y-2">
          <h2 className="text-xl font-semibold text-warmbrown">
            Added to the schedule from this entry
          </h2>
          <ul className="space-y-1">
            {relatedSchedule.map((item) => (
              <li key={item.id} className="text-lg text-warmbrown">
                <span className="font-semibold">{item.title}</span>
                {item.date && (
                  <span className="text-warmbrown/60"> — {formatDate(item.date)}</span>
                )}
              </li>
            ))}
          </ul>
          <Link href="/schedule" className="inline-block text-softblue font-medium hover:underline">
            See full schedule →
          </Link>
        </section>
      )}
    </div>
  );
}
