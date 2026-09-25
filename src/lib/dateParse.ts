// A small, dependency-free parser for everyday relative date phrases like
// "next week", "tomorrow", "in 3 days", or "next Friday" — so people can
// just type or say a plan naturally and get a date without picking one off
// a calendar.

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function parseNumberToken(token: string): number | null {
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  return NUMBER_WORDS[token.toLowerCase()] ?? null;
}

function formatLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(d: Date, months: number): Date {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function addYears(d: Date, years: number): Date {
  const copy = new Date(d);
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

const NUM_WORD_GROUP = "(\\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)";

/**
 * Looks for a relative date phrase anywhere in `text` and returns the
 * matching calendar date as YYYY-MM-DD, or null if nothing was recognized.
 * `referenceDate` defaults to right now, in whatever timezone it's called
 * from (the browser's for client-side calls, the machine's for the server
 * fallback).
 */
export function parseRelativeDate(
  text: string,
  referenceDate: Date = new Date()
): string | null {
  const t = ` ${text.toLowerCase()} `;

  if (/\bday after tomorrow\b/.test(t)) {
    return formatLocalISO(addDays(referenceDate, 2));
  }
  if (/\btomorrow\b/.test(t)) {
    return formatLocalISO(addDays(referenceDate, 1));
  }
  if (/\b(today|tonight)\b/.test(t)) {
    return formatLocalISO(referenceDate);
  }
  if (/\bnext week\b/.test(t)) {
    return formatLocalISO(addDays(referenceDate, 7));
  }
  if (/\bnext month\b/.test(t)) {
    return formatLocalISO(addMonths(referenceDate, 1));
  }
  if (/\bnext year\b/.test(t)) {
    return formatLocalISO(addYears(referenceDate, 1));
  }

  let m = t.match(new RegExp(`\\bin\\s+${NUM_WORD_GROUP}\\s+day(s)?\\b`));
  if (m) {
    const n = parseNumberToken(m[1]);
    if (n) return formatLocalISO(addDays(referenceDate, n));
  }
  m = t.match(new RegExp(`\\bin\\s+${NUM_WORD_GROUP}\\s+week(s)?\\b`));
  if (m) {
    const n = parseNumberToken(m[1]);
    if (n) return formatLocalISO(addDays(referenceDate, n * 7));
  }
  m = t.match(new RegExp(`\\bin\\s+${NUM_WORD_GROUP}\\s+month(s)?\\b`));
  if (m) {
    const n = parseNumberToken(m[1]);
    if (n) return formatLocalISO(addMonths(referenceDate, n));
  }

  for (let i = 0; i < WEEKDAYS.length; i++) {
    const day = WEEKDAYS[i];
    const match = t.match(new RegExp(`\\b(next|this|on)?\\s*${day}\\b`));
    if (!match) continue;

    const qualifier = (match[1] || "").trim();
    const todayDow = referenceDate.getDay();
    let diff = (i - todayDow + 7) % 7;

    if (qualifier === "this") {
      // "this Friday" can mean today if today is Friday.
    } else {
      // "next Friday", "on Friday", or a bare "Friday" all read, in
      // everyday speech, as the next upcoming one — not today.
      if (diff === 0) diff = 7;
    }
    return formatLocalISO(addDays(referenceDate, diff));
  }

  return null;
}
