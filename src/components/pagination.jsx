import Link from "next/link";

// "Previous  Page 2 of 6  Next" links at the bottom of the jobs list.
// filters = the current search filters, so they stay when changing page.
export default function Pagination({ page, totalPages, filters }) {
  if (totalPages <= 1) {
    return null;
  }

  function pageLink(pageNumber) {
    const params = new URLSearchParams(filters);
    params.set("page", pageNumber);
    return "/jobs?" + params.toString();
  }

  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-6 font-semibold">
      {page > 1 ? (
        <Link href={pageLink(page - 1)} className="rounded-full px-4 py-2 text-ink no-underline hover:bg-maroon/5">
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 text-muted/50">← Previous</span>
      )}

      <span className="text-muted">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={pageLink(page + 1)} className="rounded-full px-4 py-2 text-ink no-underline hover:bg-maroon/5">
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 text-muted/50">Next →</span>
      )}
    </nav>
  );
}
