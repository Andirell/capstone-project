import { Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/search-bar";
import { FilterPanel, SortSelect } from "@/components/job-filters";
import JobCard from "@/components/job-card";
import Pagination from "@/components/pagination";
import { getData } from "@/lib/api";

export const metadata = {
  title: "Browse jobs",
  description: "Search and filter open jobs across Nigeria and remote.",
};

// These are the URL filters we pass on to the API
const FILTER_NAMES = ["q", "location", "category", "company", "work_mode", "job_type", "experience_level", "salary_min", "featured", "ordering", "page"];

export default async function JobsPage({ searchParams }) {
  const urlParams = await searchParams;

  // Copy the filters from the page URL into the API URL
  const filters = {};
  for (const name of FILTER_NAMES) {
    if (urlParams[name]) {
      filters[name] = urlParams[name];
    }
  }
  const query = new URLSearchParams(filters).toString();
  const hasFilters = Object.keys(filters).some((name) => name !== "page");

  const categories = await getData("/categories/", []);
  const jobs = await getData("/jobs/?" + query, null);

  return (
    <div>
      <section className="bg-maroon pt-10 pb-14 text-cream">
        <div className="container-page">
          <h1 className="text-4xl text-cream sm:text-5xl">Find your next job</h1>
          <p className="mt-2 text-cream/80">Search by job title, skill or company, then narrow it down with the filters.</p>
          <Suspense>
            <SearchBar keepFilters className="mt-6 max-w-3xl" />
          </Suspense>
        </div>
      </section>

      <div className="container-page grid gap-10 pt-10 lg:grid-cols-[250px_1fr]">
        <aside>
          <Suspense>
            <FilterPanel categories={categories} />
          </Suspense>
        </aside>

        <div className="min-w-0">
          {jobs === null ? (
            <div className="form-error">
              <p className="font-semibold">Jobs couldn&apos;t load</p>
              <p>The job server isn&apos;t responding. Try refreshing the page in a minute.</p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted">
                  <strong className="text-ink">{jobs.count}</strong> {jobs.count === 1 ? "job" : "jobs"} found
                  {hasFilters && (
                    <Link href="/jobs" className="ml-4 font-semibold text-brand-dark">
                      Clear filters
                    </Link>
                  )}
                </p>
                <Suspense>
                  <SortSelect />
                </Suspense>
              </div>

              {jobs.count === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
                  <h2 className="text-2xl">No jobs match these filters</h2>
                  <p className="mt-2 text-muted">Try a different keyword or remove some filters.</p>
                  <Link href="/jobs" className="mt-4 inline-block font-semibold text-brand-dark">
                    See all open jobs
                  </Link>
                </div>
              ) : (
                <div>
                  {jobs.results.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}

              <Pagination page={jobs.page} totalPages={jobs.total_pages} filters={filters} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
