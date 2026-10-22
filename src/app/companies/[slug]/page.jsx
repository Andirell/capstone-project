import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyLogo from "@/components/company-logo";
import JobCard from "@/components/job-card";
import { getData } from "@/lib/api";
import { plural } from "@/lib/format";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const company = await getData(`/companies/${slug}/`);
  return { title: company ? "Jobs at " + company.name : "Company not found" };
}

export default async function CompanyPage({ params }) {
  const { slug } = await params;
  const company = await getData(`/companies/${slug}/`);
  if (!company) {
    notFound();
  }

  const jobs = await getData(`/jobs/?company=${slug}&page_size=50`, { results: [] });

  return (
    <div className="container-page py-12">
      <Link href="/companies" className="text-sm text-muted">All companies</Link>

      <div className="mt-4 flex items-center gap-5">
        <CompanyLogo company={company} size="lg" />
        <div>
          <h1 className="text-5xl">{company.name}</h1>
          {company.location && <p className="mt-1 text-muted">{company.location}</p>}
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer">Website</a>
          )}
        </div>
      </div>

      {company.description && <p className="mt-6 max-w-[68ch] text-lg">{company.description}</p>}

      <h2 className="mt-12 text-3xl">{plural(jobs.results.length, "open job")}</h2>
      <div className="mt-2 max-w-4xl">
        {jobs.results.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
