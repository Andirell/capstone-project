import Link from "next/link";
import { MapPin } from "lucide-react";
import CompanyLogo from "./company-logo";
import SaveButton from "./save-button";
import { formatSalary, timeAgo } from "@/lib/format";

// One job in a list.
// small={true} hides the save button and date (used for "Similar jobs" and "Featured jobs").
export default function JobCard({ job, small = false }) {
  const salary = formatSalary(job);

  return (
    // "relative" + the link's "after:absolute after:inset-0" makes the whole card clickable
    <article className="group relative flex gap-4 border-b border-line py-5 last:border-b-0">
      <CompanyLogo company={job.company} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-sans text-[1.05rem] font-semibold text-ink">
            <Link
              href={"/jobs/" + job.slug}
              className="no-underline after:absolute after:inset-0 group-hover:text-brand-dark group-hover:underline"
            >
              {job.title}
            </Link>
          </h3>
          {job.is_featured && !small && (
            <span className="rounded-full bg-brand-dark px-2 py-0.5 text-xs font-semibold text-white">Featured</span>
          )}
        </div>
        <p className="text-muted">{job.company.name}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            {job.location}
          </span>
          <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-ink">{job.work_mode_display}</span>
          <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-ink">{job.job_type_display}</span>
          {salary && <span className="font-semibold text-green">{salary}</span>}
          {!small && <span>{timeAgo(job.created_at)}</span>}
        </div>
      </div>

      {!small && <SaveButton slug={job.slug} />}
    </article>
  );
}
