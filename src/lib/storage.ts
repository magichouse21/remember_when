import fs from "fs";
import path from "path";
import { JournalEntry, ScheduleItem } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ENTRIES_FILE = path.join(DATA_DIR, "entries.json");
const SCHEDULE_FILE = path.join(DATA_DIR, "schedule.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getEntries(): JournalEntry[] {
  return readJsonFile<JournalEntry>(ENTRIES_FILE).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function addEntry(input: {
  date: string;
  text: string;
  isSpecial: boolean;
}): JournalEntry {
  const entries = readJsonFile<JournalEntry>(ENTRIES_FILE);
  const entry: JournalEntry = {
    id: makeId(),
    date: input.date,
    text: input.text,
    isSpecial: input.isSpecial,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  writeJsonFile(ENTRIES_FILE, entries);
  return entry;
}

export function getEntryById(id: string): JournalEntry | null {
  const entries = readJsonFile<JournalEntry>(ENTRIES_FILE);
  return entries.find((e) => e.id === id) ?? null;
}

export function getScheduleItems(): ScheduleItem[] {
  return readJsonFile<ScheduleItem>(SCHEDULE_FILE).sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function getScheduleItemsForEntry(entryId: string): ScheduleItem[] {
  const items = readJsonFile<ScheduleItem>(SCHEDULE_FILE);
  return items.filter((i) => i.sourceEntryId === entryId);
}

export function addScheduleItem(input: {
  title: string;
  date: string | null;
  notes: string | null;
  sourceEntryId: string | null;
}): ScheduleItem {
  const items = readJsonFile<ScheduleItem>(SCHEDULE_FILE);
  const item: ScheduleItem = {
    id: makeId(),
    title: input.title,
    date: input.date,
    notes: input.notes,
    sourceEntryId: input.sourceEntryId,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  writeJsonFile(SCHEDULE_FILE, items);
  return item;
}
