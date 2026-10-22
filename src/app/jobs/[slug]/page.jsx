import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyLogo from "@/components/company-logo";
import ApplyButton from "@/components/apply-button";
import SaveButton from "@/components/save-button";
import ShareButton from "@/components/share-button";
import JobCard from "@/components/job-card";
import { getData } from "@/lib/api";
import { formatDate, formatSalary, timeAgo } from "@/lib/format";

// Sets the browser tab title, e.g. "Frontend Engineer at CodeBase | JobZ"
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getData(`/jobs/${slug}/`);
  if (!job) {
    return { title: "Job not found" };
  }
  return {
    title: `${job.title} at ${job.company.name}`,
    description: `${job.company.name} is hiring a ${job.title} in ${job.location}.`,
  };
}

// Extra info for Google so the job can show up in Google's job search
function googleJobData(job) {
  const data = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    hiringOrganization: { "@type": "Organization", name: job.company.name },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "NG" },
    },
  };
  if (job.deadline) {
    data.validThrough = job.deadline;
  }
  // Replace "<" so text in a job description can't break out of the <script> tag
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// One row in the "job details" box
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

export default async function JobPage({ params }) {
  const { slug } = await params;
  const job = await getData(`/jobs/${slug}/`);
  if (!job) {
    notFound();
  }

  const similarJobs = await getData(`/jobs/${slug}/related/`, []);
  const salary = formatSalary(job);
  // Split the description into paragraphs at each new line
  const paragraphs = job.description.split("\n").filter((line) => line.trim() !== "");

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: googleJobData(job) }} />

      {/* Top section */}
      <header className="border-b border-line bg-white">
        <div className="container-page pt-6 pb-10">
          <p className="text-sm text-muted">
            <Link href="/jobs" className="text-muted">Jobs</Link>
            {job.category && (
              <>
                {" › "}
                <Link href={"/jobs?category=" + job.category.slug} className="text-muted">
                  {job.category.name}
                </Link>
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row">
            <CompanyLogo company={job.company} size="lg" />
            <div>
              <h1 className="text-4xl sm:text-5xl">{job.title}</h1>
              <p className="mt-2 text-lg text-muted">
                <Link href={"/companies/" + job.company.slug} className="font-semibold text-ink">
                  {job.company.name}
                </Link>{" "}
                in {job.location}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-line bg-paper px-3 py-1">{job.work_mode_display}</span>
                <span className="rounded-full border border-line bg-paper px-3 py-1">{job.job_type_display}</span>
                {job.experience_level_display && (
                  <span className="rounded-full border border-line bg-paper px-3 py-1">{job.experience_level_display}</span>
                )}
                {salary && <span className="rounded-full bg-green-light px-3 py-1 font-semibold text-green">{salary}</span>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        {/* Left: job description */}
        <div className="max-w-[68ch]">
          {!job.is_open && (
            <p className="mb-8 rounded-xl border border-line bg-white px-5 py-4 text-muted">
              This job has closed. <Link href="/jobs">See other open jobs</Link>.
            </p>
          )}

          <h2 className="text-3xl">About the role</h2>
          <div className="mt-4 space-y-4 text-[1.05rem] leading-relaxed">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {job.requirement_list.length > 0 && (
            <>
              <h2 className="mt-10 text-3xl">What you&apos;ll need</h2>
              <ul className="mt-4 space-y-3 text-[1.05rem]">
                {job.requirement_list.map((requirement) => (
                  <li key={requirement} className="flex gap-3">
                    <span className="mt-2.5 size-2 shrink-0 rounded-full bg-brand" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </>
          )}

          {job.benefit_list.length > 0 && (
            <>
              <h2 className="mt-10 text-3xl">Benefits</h2>
              <ul className="mt-4 space-y-3 text-[1.05rem]">
                {job.benefit_list.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <span className="mt-2.5 size-2 shrink-0 rounded-full bg-green" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </>
          )}

          {job.company.description && (
            <div className="mt-10 rounded-2xl border border-line bg-white p-6">
              <h2 className="text-2xl">About {job.company.name}</h2>
              <p className="mt-2 text-muted">{job.company.description}</p>
              {job.company.website && (
                <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-brand-dark">
                  Visit website
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right: apply box */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-white p-6">
            <ApplyButton job={job} />
            <div className="mt-3 flex gap-2">
              <SaveButton slug={job.slug} showText />
              <ShareButton title={job.title} />
            </div>
            <dl className="mt-6 text-sm">
              {salary && <DetailRow label="Salary" value={salary} />}
              <DetailRow label="Location" value={job.location} />
              <DetailRow label="Work setup" value={job.work_mode_display} />
              <DetailRow label="Job type" value={job.job_type_display} />
              {job.experience_level_display && <DetailRow label="Experience" value={job.experience_level_display} />}
              <DetailRow label="Posted" value={timeAgo(job.created_at)} />
              {job.deadline && <DetailRow label="Apply by" value={formatDate(job.deadline)} />}
            </dl>
          </div>
        </aside>
      </div>

      {similarJobs.length > 0 && (
        <section className="container-page">
          <div className="border-t border-line pt-10">
            <h2 className="text-3xl">Similar jobs</h2>
            <div className="mt-4 grid gap-x-10 md:grid-cols-2">
              {similarJobs.map((similarJob) => (
                <JobCard key={similarJob.id} job={similarJob} small />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
