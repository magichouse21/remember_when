export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD, the day this entry is about
  text: string;
  isSpecial: boolean; // marked as a commemorative / memorable day
  createdAt: string; // ISO timestamp
};

export type ScheduleItem = {
  id: string;
  title: string;
  date: string | null; // YYYY-MM-DD if known, otherwise null ("someday")
  notes: string | null;
  sourceEntryId: string | null; // which journal entry this came from, if any
  createdAt: string; // ISO timestamp
};
