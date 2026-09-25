import { NextRequest, NextResponse } from "next/server";
import { addScheduleItem, getScheduleItems } from "@/lib/storage";
import { parseRelativeDate } from "@/lib/dateParse";

export async function GET() {
  const items = getScheduleItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, date, notes } = body as {
    title: string;
    date: string | null;
    notes: string | null;
  };

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Fall back to parsing a relative phrase ("next week", "in 3 days") out
  // of the title itself if no explicit date was given.
  const resolvedDate = date || parseRelativeDate(title);

  const item = addScheduleItem({
    title: title.trim(),
    date: resolvedDate || null,
    notes: notes || null,
    sourceEntryId: null,
  });

  return NextResponse.json(item, { status: 201 });
}
