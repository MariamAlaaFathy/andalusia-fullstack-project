export function CatalogPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Catalog pages"
      className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-[#765f52] sm:gap-5"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="min-h-11 rounded-lg border border-[#d8cabc] bg-white px-3 py-2 transition hover:bg-[#eee2d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
      >
        Previous
      </button>
      <span aria-live="polite" className="px-1 text-center">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="min-h-11 rounded-lg border border-[#d8cabc] bg-white px-3 py-2 transition hover:bg-[#eee2d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
      >
        Next
      </button>
    </nav>
  );
}

export function CatalogLoading() {
  return (
    <p role="status" className="py-12 text-center text-[#765f52]">
      Loading catalog…
    </p>
  );
}

export function CatalogEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#dfd2c3] bg-white/70 px-6 py-12 text-center">
      <h2 className="font-serif text-2xl font-bold">No {label} found</h2>
      <p className="mt-2 text-sm text-[#765f52]">
        Try another search or check back later.
      </p>
    </div>
  );
}
