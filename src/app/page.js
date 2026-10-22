import { Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/search-bar";
import JobCard from "@/components/job-card";
import CompanyLogo from "@/components/company-logo";
import CategoryIcon from "@/components/category-icon";
import { ButtonLink } from "@/components/button";
import { getData } from "@/lib/api";
import { formatSalary, plural, timeAgo } from "@/lib/format";

// Reload the data from the API at most once a minute
export const revalidate = 60;

const POPULAR_SEARCHES = [
  { label: "Remote", link: "/jobs?work_mode=remote" },
  { label: "Lagos", link: "/jobs?location=Lagos" },
  { label: "Abuja", link: "/jobs?location=Abuja" },
  { label: "React", link: "/jobs?q=react" },
  { label: "Nursing", link: "/jobs?q=nursing" },
  { label: "Contract", link: "/jobs?job_type=contract" },
];

const STEPS = [
  {
    title: "Search and filter",
    text: "Narrow every open job down to the ones that fit you, by field, city, remote or on-site, salary and experience.",
  },
  {
    title: "Apply in one go",
    text: "Upload your CV once and send it with a short note. No account needed, though one saves you retyping.",
  },
  {
    title: "Follow every application",
    text: "Your dashboard shows when an employer reviews, shortlists or invites you to interview.",
  },
];

export default async function Home() {
  const latestJobs = await getData("/jobs/?ordering=-created_at&page_size=5", { results: [] });
  const featuredJobs = await getData("/jobs/?featured=true&page_size=6", { results: [] });
  const categories = await getData("/categories/", []);
  const stats = await getData("/stats/", null);

  return (
    <>
      {/* Hero */}
      <section className="bg-maroon text-cream">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <h1 className="text-5xl text-cream sm:text-6xl">Your next job in Lagos, Abuja, or right from home.</h1>

            {stats ? (
              <p className="mt-5 text-lg text-cream/80">
                {plural(stats.open_jobs, "open job")} from {plural(stats.companies, "employer")}, including{" "}
                {stats.remote_jobs} remote roles. Search them all in one place.
              </p>
            ) : (
              <p className="mt-5 text-lg text-cream/80">Jobs from employers across Nigeria, in one place.</p>
            )}

            {/* SearchBar reads the URL, so Next.js needs it inside <Suspense> */}
            <Suspense>
              <SearchBar className="mt-8" />
            </Suspense>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 text-cream/70">Popular:</span>
              {POPULAR_SEARCHES.map((search) => (
                <Link
                  key={search.label}
                  href={search.link}
                  className="rounded-full border border-white/20 px-3 py-1 text-cream no-underline hover:border-brand"
                >
                  {search.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Latest jobs box */}
          {latestJobs.results.length > 0 && (
            <div className="rounded-3xl bg-maroon-light/60 p-2">
              <p className="px-4 pt-3 pb-2 text-sm font-semibold">Just posted</p>
              {latestJobs.results.map((job) => (
                <Link key={job.id} href={"/jobs/" + job.slug} className="flex items-center gap-3 rounded-2xl px-3 py-3 no-underline hover:bg-white/10">
                  <CompanyLogo company={job.company} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-cream">{job.title}</span>
                    <span className="block truncate text-sm text-cream/70">
                      {job.company.name}, {job.location}
                    </span>
                  </span>
                  <span className="hidden text-right text-xs text-cream/70 sm:block">
                    <span className="block font-semibold text-cream">{formatSalary(job)}</span>
                    {timeAgo(job.created_at)}
                  </span>
                </Link>
              ))}
              <Link href="/jobs?ordering=-created_at" className="block px-4 pt-1 pb-3 text-sm font-semibold text-brand">
                See all new jobs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl">Browse by field</h2>
            <Link href="/jobs" className="font-semibold text-brand-dark">All jobs</Link>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.slug} href={"/jobs?category=" + category.slug} className="flex gap-4 bg-white p-6 no-underline hover:bg-paper">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{category.name}</span>
                  <span className="block text-sm text-muted">{category.description}</span>
                  <span className="mt-2 block text-sm font-semibold text-ink">{plural(category.job_count, "open job")}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured jobs */}
      {featuredJobs.results.length > 0 && (
        <section className="border-y border-line bg-white py-16">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-4xl">Featured jobs</h2>
              <Link href="/jobs?featured=true" className="font-semibold text-brand-dark">See all featured</Link>
            </div>
            <div className="mt-6 grid gap-x-12 md:grid-cols-2">
              {featuredJobs.results.map((job) => (
                <JobCard key={job.id} job={job} small />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-4xl">From search to interview</h2>
            <p className="mt-3 text-muted">Finding work shouldn&apos;t feel like a second job. Here&apos;s how JobZ works.</p>
          </div>
          <ol className="space-y-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-5">
                <span className="w-7 shrink-0 font-display text-4xl text-brand">{index + 1}</span>
                <div>
                  <h3 className="font-sans text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For employers */}
      <section className="container-page">
        <div className="grid items-center overflow-hidden rounded-[2rem] bg-brand-light md:grid-cols-2">
          <div className="p-8 sm:p-12">
            <h2 className="text-4xl">Hiring? Post your job for free.</h2>
            <p className="mt-3 text-ink/80">
              Create an employer account, publish a job in a few minutes, and review every applicant&apos;s CV from your
              dashboard. When you change someone&apos;s status, they get an email automatically.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/register?role=employer" variant="dark" size="lg">Post a job</ButtonLink>
              <ButtonLink href="/login" variant="outline" size="lg">Employer log in</ButtonLink>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dxekfksjf/image/upload/v1758118561/women_in_tech_cover_c2080a7fc7_j3wc4t.webp"
            alt="A woman working on a laptop"
            className="h-full max-h-96 w-full object-cover"
          />
        </div>
      </section>
    </>
  );
}
