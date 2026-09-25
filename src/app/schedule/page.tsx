import { getScheduleItems } from "@/lib/storage";
import AddScheduleForm from "@/components/AddScheduleForm";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SchedulePage() {
  const items = getScheduleItems();
  const todayIso = new Date().toISOString().slice(0, 10);
  const withDate = items.filter((i) => i.date && i.date >= todayIso);
  const past = items.filter((i) => i.date && i.date < todayIso);
  const someday = items.filter((i) => !i.date);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-warmbrown">Your Schedule</h1>
        <p className="text-xl text-warmbrown/70 mt-1">
          Things to look forward to, all in one place.
        </p>
      </div>

      <AddScheduleForm />

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-warmbrown">Coming up</h2>
        {withDate.length === 0 ? (
          <p className="text-lg text-warmbrown/60">Nothing scheduled yet.</p>
        ) : (
          <ul className="space-y-3">
            {withDate.map((item) => (
              <li key={item.id} className="bg-white rounded-2xl shadow p-5">
                <p className="text-lg font-semibold text-warmbrown">{item.title}</p>
                <p className="text-base text-softblue">{formatDate(item.date as string)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {someday.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-warmbrown">Someday</h2>
          <ul className="space-y-3">
            {someday.map((item) => (
              <li key={item.id} className="bg-white rounded-2xl shadow p-5">
                <p className="text-lg font-semibold text-warmbrown">{item.title}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-warmbrown/60">Past</h2>
          <ul className="space-y-2">
            {past.map((item) => (
              <li key={item.id} className="text-base text-warmbrown/50">
                {item.title} — {formatDate(item.date as string)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
