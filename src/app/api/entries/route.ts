import { NextRequest, NextResponse } from "next/server";
import { addEntry, addScheduleItem, getEntries } from "@/lib/storage";
import { parseRelativeDate } from "@/lib/dateParse";

export async function GET() {
  const entries = getEntries();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, text, isSpecial, upcoming } = body as {
    date: string;
    text: string;
    isSpecial: boolean;
    upcoming?: { title: string; date: string | null }[];
  };

  if (!date || !text || !text.trim()) {
    return NextResponse.json(
      { error: "date and text are required" },
      { status: 400 }
    );
  }

  const entry = addEntry({ date, text: text.trim(), isSpecial: !!isSpecial });

  if (Array.isArray(upcoming)) {
    for (const item of upcoming) {
      if (item.title && item.title.trim()) {
        // Fall back to parsing a relative phrase ("next week", "in 3 days")
        // out of the title itself if no explicit date was given.
        const resolvedDate = item.date || parseRelativeDate(item.title);
        addScheduleItem({
          title: item.title.trim(),
          date: resolvedDate || null,
          notes: null,
          sourceEntryId: entry.id,
        });
      }
    }
  }

  return NextResponse.json(entry, { status: 201 });
}
