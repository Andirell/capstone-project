import Link from "next/link";
import CompanyLogo from "@/components/company-logo";
import { getData } from "@/lib/api";
import { plural } from "@/lib/format";

export const metadata = { title: "Companies hiring" };

export default async function CompaniesPage() {
  const data = await getData("/companies/?page_size=50", { results: [] });

  // Only show companies that have open jobs
  const companies = data.results.filter((company) => company.open_jobs > 0);

  return (
    <div className="container-page py-12">
      <h1 className="text-5xl">Companies hiring now</h1>
      <p className="mt-2 text-muted">Click a company to see all of its open jobs.</p>

      {companies.length === 0 ? (
        <p className="mt-10 text-muted">No companies are hiring at the moment. Check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={"/companies/" + company.slug}
              className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 no-underline hover:border-maroon/30"
            >
              <CompanyLogo company={company} />
              <span>
                <span className="block font-semibold text-ink">{company.name}</span>
                <span className="block text-sm text-muted">{plural(company.open_jobs, "open job")}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
