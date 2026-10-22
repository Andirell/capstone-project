"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Mail, Phone } from "lucide-react";
import RequireLogin from "@/components/require-login";
import { Button } from "@/components/button";
import { authDownload, authRequest } from "@/lib/auth";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";

// CVs are private, so we download them with the employer's login token
// and then save the file in the browser.
async function downloadCv(application) {
  const path = `/employer/applications/${application.id}/resume/`;
  const response = await authDownload(path);
  if (!response.ok) {
    throw new Error("Couldn't download this CV. Try again.");
  }

  // The API sends the file name in a header like: attachment; filename="ada-okafor-1a2b.pdf"
  const header = response.headers.get("Content-Disposition") || "";
  const match = header.match(/filename="?([^"]+)"?/);
  const fileName = match ? match[1] : "cv";

  const file = await response.blob();
  const fileUrl = URL.createObjectURL(file);

  // Make a hidden link and click it to start the download
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
}

// One applicant card
function Applicant({ application, onUpdate }) {
  const [notes, setNotes] = useState(application.employer_notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function update(changes) {
    setSaving(true);
    setError("");
    try {
      const updated = await authRequest(`/employer/applications/${application.id}/`, { method: "PATCH", body: changes });
      onUpdate(updated);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleDownload() {
    try {
      await downloadCv(application);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-lg font-semibold text-ink">{application.full_name}</h3>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <a href={"mailto:" + application.email} className="inline-flex items-center gap-1.5 text-muted">
              <Mail className="size-4" /> {application.email}
            </a>
            {application.phone && (
              <a href={"tel:" + application.phone} className="inline-flex items-center gap-1.5 text-muted">
                <Phone className="size-4" /> {application.phone}
              </a>
            )}
            <span>Applied {formatDate(application.created_at)}</span>
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Status</span>
          <select
            value={application.status}
            disabled={saving}
            onChange={(e) => update({ status: e.target.value })}
            className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 font-semibold"
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {application.resume_url && (
          <Button variant="dark" size="sm" onClick={handleDownload}>
            <Download className="size-4" /> Download CV
          </Button>
        )}
        {application.resume_link && (
          <a href={application.resume_link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-maroon px-4 text-sm font-semibold text-cream no-underline">
            <ExternalLink className="size-4" /> Open CV link
          </a>
        )}
        {application.portfolio_link && (
          <a href={application.portfolio_link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink no-underline">
            <ExternalLink className="size-4" /> Portfolio
          </a>
        )}
      </div>

      {application.cover_letter && (
        <p className="mt-4 border-l-2 border-brand pl-4 whitespace-pre-line">{application.cover_letter}</p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-brand-dark">
          {application.employer_notes ? "Private notes" : "Add a private note"}
        </summary>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Only you can see this."
          aria-label={"Private notes about " + application.full_name}
          className="input mt-3"
        />
        <Button variant="outline" size="sm" className="mt-2" disabled={saving} onClick={() => update({ employer_notes: notes })}>
          Save note
        </Button>
      </details>

      {error && <p className="field-error">{error}</p>}
    </li>
  );
}

function Applicants({ slug }) {
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); // "" means all
  const [error, setError] = useState("");

  useEffect(() => {
    authRequest(`/jobs/${slug}/`)
      .then((data) => setJob(data))
      .catch((err) => setError(err.message));

    authRequest(`/employer/applications/?job=${slug}&page_size=50`)
      .then((data) => setApplications(data.results))
      .catch((err) => setError(err.message));
  }, [slug]);

  // Replace one application in the list after it changes
  function handleUpdate(updatedApplication) {
    setApplications(applications.map((a) => (a.id === updatedApplication.id ? updatedApplication : a)));
  }

  let shownApplications = applications || [];
  if (statusFilter) {
    shownApplications = shownApplications.filter((a) => a.status === statusFilter);
  }

  function filterButtonClass(value) {
    const base = "cursor-pointer rounded-full border px-3 py-1 text-sm";
    if (statusFilter === value) {
      return base + " border-maroon bg-maroon text-cream";
    }
    return base + " border-line bg-white hover:border-maroon/40";
  }

  return (
    <div className="container-page max-w-4xl py-12">
      <Link href="/dashboard" className="text-sm text-muted">Back to dashboard</Link>
      <h1 className="mt-2 text-4xl sm:text-5xl">{job ? "Applicants for " + job.title : "Applicants"}</h1>
      <p className="mt-2 text-muted">When you change someone&apos;s status, they get an email about it.</p>

      {error && <p className="form-error mt-6">{error}</p>}
      {!applications && !error && <p className="mt-8 text-muted">Loading applicants...</p>}

      {applications && applications.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
          <h2 className="text-2xl">No applicants yet</h2>
          <p className="mt-2 text-muted">You&apos;ll get an email as soon as someone applies.</p>
        </div>
      )}

      {applications && applications.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter("")} className={filterButtonClass("")}>
            All ({applications.length})
          </button>
          {APPLICATION_STATUSES.map((status) => {
            const count = applications.filter((a) => a.status === status.value).length;
            if (count === 0) return null;
            return (
              <button key={status.value} onClick={() => setStatusFilter(status.value)} className={filterButtonClass(status.value)}>
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {shownApplications.map((application) => (
          <Applicant key={application.id} application={application} onUpdate={handleUpdate} />
        ))}
      </ul>
    </div>
  );
}

export default function ApplicantsPage({ params }) {
  const { slug } = use(params);

  return (
    <RequireLogin role="employer">
      <Applicants slug={slug} />
    </RequireLogin>
  );
}
