import Link from "next/link";
import { getEntries, getScheduleItems } from "@/lib/storage";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function excerpt(text: string, max = 220): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function HomePage() {
  const entries = getEntries();
  const specialEntries = entries.filter((e) => e.isSpecial).slice(0, 8);
  const recentEntries = entries.slice(0, 5);
  const upcoming = getScheduleItems()
    .filter((s) => s.date && s.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 3);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-warmbrown">
          Welcome back
        </h1>
        <p className="text-xl text-warmbrown/70">Today is {today}</p>
        <Link
          href="/entry/new"
          className="inline-block mt-2 px-8 py-4 rounded-2xl bg-blush text-white text-xl font-bold shadow hover:opacity-90 transition"
        >
          Write about today
        </Link>
      </section>

      {upcoming.length > 0 && (
        <section className="bg-gentlegreen/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-warmbrown">
              Coming up soon
            </h2>
            <Link href="/schedule" className="text-softblue font-medium hover:underline">
              See full schedule →
            </Link>
          </div>
          <ul className="space-y-2">
            {upcoming.map((item) => (
              <li key={item.id} className="text-lg text-warmbrown">
                <span className="font-semibold">{item.title}</span>
                {item.date && (
                  <span className="text-warmbrown/60"> — {formatDate(item.date)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-warmbrown">
          Special memories
        </h2>
        {specialEntries.length === 0 ? (
          <p className="text-lg text-warmbrown/60">
            Days you mark as special will show up here as a list you can look back on.
          </p>
        ) : (
          <ul className="space-y-1 bg-white rounded-2xl shadow p-6 divide-y divide-warmbrown/10">
            {specialEntries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/entry/${entry.id}`}
                  className="block py-2 text-lg text-warmbrown hover:text-softblue transition"
                >
                  <span aria-hidden>• </span>
                  <span className="font-semibold">{formatDate(entry.date)}:</span>{" "}
                  {excerpt(entry.text, 120)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-warmbrown">
          What&apos;s happened lately
        </h2>
        {recentEntries.length === 0 ? (
          <p className="text-lg text-warmbrown/60">
            Once you write your first entry, a summary of your recent days will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/entry/${entry.id}`}
                className="block bg-white rounded-2xl shadow p-6 hover:shadow-md hover:bg-softblue/5 transition"
              >
                <p className="text-base font-semibold text-softblue mb-1">
                  {formatDate(entry.date)}
                  {entry.isSpecial && (
                    <span className="ml-2 text-blush">★ special day</span>
                  )}
                </p>
                <p className="text-lg text-warmbrown/90">{excerpt(entry.text)}</p>
                <p className="text-base text-softblue/80 mt-2 font-medium">
                  Read full entry →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
