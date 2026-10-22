"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./auth-context";
import { ButtonLink } from "./button";
import CompanyLogo from "./company-logo";
import JobCard from "./job-card";
import StatusBadge, { StatusProgress } from "./status-badge";
import { authRequest } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("applications"); // "applications" or "saved"
  const [applications, setApplications] = useState(null);
  const [savedJobs, setSavedJobs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authRequest("/me/applications/?page_size=50")
      .then((data) => setApplications(data.results))
      .catch((err) => setError(err.message));

    authRequest("/me/saved-jobs/?page_size=50")
      .then((data) => setSavedJobs(data.results))
      .catch((err) => setError(err.message));
  }, []);

  function tabClass(name) {
    if (tab === name) {
      return "-mb-px cursor-pointer border-b-2 border-brand-dark pb-3 font-semibold text-ink";
    }
    return "-mb-px cursor-pointer border-b-2 border-transparent pb-3 font-semibold text-muted hover:text-ink";
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl">Hi, {user.full_name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted">{user.headline || "Add a headline so employers know what you do."}</p>
        </div>
        <ButtonLink href="/dashboard/profile" variant="outline">Edit profile</ButtonLink>
      </div>

      <div role="tablist" className="mt-10 flex gap-6 border-b border-line">
        <button role="tab" aria-selected={tab === "applications"} onClick={() => setTab("applications")} className={tabClass("applications")}>
          Applications
        </button>
        <button role="tab" aria-selected={tab === "saved"} onClick={() => setTab("saved")} className={tabClass("saved")}>
          Saved jobs
        </button>
      </div>

      <div role="tabpanel" className="mt-6 max-w-4xl">
        {error && <p className="form-error">{error}</p>}

        {/* Applications tab */}
        {tab === "applications" && applications === null && <p className="text-muted">Loading...</p>}

        {tab === "applications" && applications && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
            <h3 className="text-2xl">No applications yet</h3>
            <p className="mt-2 text-muted">When you apply for a job while logged in, it shows up here with its status.</p>
            <ButtonLink href="/jobs" variant="dark" className="mt-5">Find a job to apply for</ButtonLink>
          </div>
        )}

        {tab === "applications" && applications && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <CompanyLogo company={application.job.company} />
                  <div className="min-w-0 flex-1">
                    <Link href={"/jobs/" + application.job.slug} className="font-semibold text-ink">
                      {application.job.title}
                    </Link>
                    <p className="text-sm text-muted">
                      {application.job.company.name}, {application.job.location}. Applied {formatDate(application.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
                <StatusProgress status={application.status} />
              </div>
            ))}
          </div>
        )}

        {/* Saved jobs tab */}
        {tab === "saved" && savedJobs === null && <p className="text-muted">Loading...</p>}

        {tab === "saved" && savedJobs && savedJobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
            <h3 className="text-2xl">No saved jobs</h3>
            <p className="mt-2 text-muted">Tap the bookmark on any job to keep it here for later.</p>
            <ButtonLink href="/jobs" variant="dark" className="mt-5">Browse jobs</ButtonLink>
          </div>
        )}

        {tab === "saved" && savedJobs && savedJobs.length > 0 && (
          <div className="rounded-2xl border border-line bg-white px-5">
            {savedJobs.map((saved) => (
              <JobCard key={saved.id} job={saved.job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
