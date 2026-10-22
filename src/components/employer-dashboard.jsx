"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "./auth-context";
import { Button, ButtonLink } from "./button";
import CompanyLogo from "./company-logo";
import { authRequest } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  function loadJobs() {
    authRequest("/employer/jobs/")
      .then((data) => setJobs(data))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadJobs();
  }, []);

  // Close a job (stop taking applications) or open it again
  async function toggleJobOpen(job) {
    try {
      await authRequest(`/jobs/${job.slug}/`, { method: "PATCH", body: { is_active: !job.is_active } });
      loadJobs();
    } catch (err) {
      setError(err.message);
    }
  }

  // Add up the numbers for the summary boxes
  let openJobs = 0;
  let totalApplicants = 0;
  let waitingForReview = 0;
  if (jobs) {
    for (const job of jobs) {
      if (job.is_active) openJobs += 1;
      totalApplicants += job.application_count;
      waitingForReview += job.new_application_count;
    }
  }

  const company = user.company;

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {company && <CompanyLogo company={company} size="lg" />}
          <div>
            <h1 className="text-4xl">{company ? company.name : "Your company"}</h1>
            <p className="text-muted">
              Logged in as {user.full_name}. <Link href="/dashboard/profile">Edit company profile</Link>
            </p>
          </div>
        </div>
        <ButtonLink href="/dashboard/jobs/new" size="lg">
          <Plus className="size-4" /> Post a job
        </ButtonLink>
      </div>

      {jobs && (
        <div className="mt-10 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white">
          <div className="px-5 py-4">
            <p className="text-sm text-muted">Open jobs</p>
            <p className="font-display text-3xl text-maroon">{openJobs}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-muted">Applicants</p>
            <p className="font-display text-3xl text-maroon">{totalApplicants}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-muted">Waiting for review</p>
            <p className={`font-display text-3xl ${waitingForReview > 0 ? "text-brand-dark" : "text-maroon"}`}>{waitingForReview}</p>
          </div>
        </div>
      )}

      <h2 className="mt-12 text-3xl">Your jobs</h2>

      {error && <p className="form-error mt-4">{error}</p>}
      {!jobs && !error && <p className="mt-6 text-muted">Loading your jobs...</p>}

      {jobs && jobs.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
          <h3 className="text-2xl">You haven&apos;t posted a job yet</h3>
          <p className="mt-2 text-muted">It only takes a few minutes. Applicants and their CVs will show up here.</p>
          <ButtonLink href="/dashboard/jobs/new" className="mt-5">Post your first job</ButtonLink>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="mt-4 space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <Link href={"/jobs/" + job.slug} className="font-semibold text-ink">{job.title}</Link>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${job.is_active ? "bg-green-light text-green" : "bg-paper text-muted"}`}>
                    {job.is_active ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {job.application_count} applicants
                  {job.new_application_count > 0 && <strong className="text-brand-dark"> ({job.new_application_count} new)</strong>}
                  , {job.views_count} views. Posted {timeAgo(job.created_at).toLowerCase()}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/dashboard/jobs/${job.slug}/applicants`} variant="dark" size="sm">Review applicants</ButtonLink>
                <ButtonLink href={`/dashboard/jobs/${job.slug}/edit`} variant="outline" size="sm">Edit</ButtonLink>
                <Button variant="ghost" size="sm" onClick={() => toggleJobOpen(job)}>
                  {job.is_active ? "Close job" : "Reopen job"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
