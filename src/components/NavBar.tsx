import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-warmbrown text-cream shadow-md">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2 sm:gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:opacity-90"
        >
          Remember When
        </Link>
        <div className="flex gap-2 sm:gap-3 ml-auto">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-lg font-medium bg-cream/10 hover:bg-cream/20 transition"
          >
            Home
          </Link>
          <Link
            href="/entry/new"
            className="px-4 py-2 rounded-xl text-lg font-medium bg-blush hover:opacity-90 transition"
          >
            + New Entry
          </Link>
          <Link
            href="/schedule"
            className="px-4 py-2 rounded-xl text-lg font-medium bg-cream/10 hover:bg-cream/20 transition"
          >
            Schedule
          </Link>
        </div>
      </div>
    </nav>
  );
}
