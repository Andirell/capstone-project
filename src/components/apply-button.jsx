"use client";

// The "Apply now" button on the job page, and the application form that pops up.

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useAuth } from "./auth-context";
import { Button, ButtonLink } from "./button";
import { sendRequest } from "@/lib/api";
import { authRequest } from "@/lib/auth";

const MAX_FILE_SIZE_MB = 5;

function ApplyForm({ job, onSuccess }) {
  const { user } = useAuth();

  const [cvType, setCvType] = useState("file"); // "file" or "link"
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files[0];
    setErrors({ ...errors, resume: "" });

    if (!file) {
      setCvFile(null);
      return;
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
      setCvFile(null);
      setErrors({ ...errors, resume: "Upload a PDF or Word document." });
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setCvFile(null);
      setErrors({ ...errors, resume: `That file is too big. The limit is ${MAX_FILE_SIZE_MB} MB.` });
      return;
    }

    setCvFile(file);
  }

  // Check the form before sending it, so people get errors straight away
  function checkForm(formData) {
    const newErrors = {};

    if (!user) {
      if (!formData.get("full_name").trim()) {
        newErrors.full_name = "Enter your full name.";
      }
      const email = formData.get("email").trim();
      if (!email) {
        newErrors.email = "Enter your email address.";
      } else if (!email.includes("@") || !email.includes(".")) {
        newErrors.email = "Enter a valid email address, like name@example.com.";
      }
    }

    if (cvType === "file" && !cvFile) {
      newErrors.resume = "Attach your CV, or switch to pasting a link.";
    }
    if (cvType === "link" && !formData.get("resume_link").trim()) {
      newErrors.resume = "Paste a link to your CV.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.target);
    formData.delete("resume");

    const newErrors = checkForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (cvType === "file") {
      formData.set("resume", cvFile);
      formData.delete("resume_link");
    }

    setSending(true);
    try {
      const url = `/jobs/${job.slug}/apply/`;
      if (user) {
        await authRequest(url, { method: "POST", formData });
      } else {
        await sendRequest(url, { method: "POST", formData });
      }
      onSuccess();
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length === 0) {
        setFormError(error.message);
      }
    }
    setSending(false);
  }

  const cvError = errors.resume || errors.resume_link;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {user ? (
        <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">
          Applying as <strong className="text-ink">{user.full_name}</strong> ({user.email})
        </p>
      ) : (
        <>
          <div>
            <label htmlFor="full_name" className="label">Full name</label>
            <input id="full_name" name="full_name" autoComplete="name" className={errors.full_name ? "input has-error" : "input"} />
            {errors.full_name && <p className="field-error">{errors.full_name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" className={errors.email ? "input has-error" : "input"} />
            {errors.email ? <p className="field-error">{errors.email}</p> : <p className="hint">We&apos;ll send your confirmation here.</p>}
          </div>

          <div>
            <label htmlFor="phone" className="label">Phone (optional)</label>
            <input id="phone" name="phone" type="tel" placeholder="+234" className="input" />
          </div>
        </>
      )}
      {user && errors.email && <p className="field-error">{errors.email}</p>}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label mb-0">Your CV</span>
          <div className="flex rounded-full bg-paper p-0.5 text-sm">
            <button
              type="button"
              aria-pressed={cvType === "file"}
              onClick={() => setCvType("file")}
              className={`cursor-pointer rounded-full px-3 py-1 ${cvType === "file" ? "bg-white font-semibold shadow-sm" : "text-muted"}`}
            >
              Upload file
            </button>
            <button
              type="button"
              aria-pressed={cvType === "link"}
              onClick={() => setCvType("link")}
              className={`cursor-pointer rounded-full px-3 py-1 ${cvType === "link" ? "bg-white font-semibold shadow-sm" : "text-muted"}`}
            >
              Paste link
            </button>
          </div>
        </div>

        {cvType === "file" ? (
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-white p-4 hover:border-brand-dark ${cvError ? "border-red" : "border-line"}`}>
            {cvFile ? <FileText className="size-6 text-brand-dark" /> : <Upload className="size-6 text-muted" />}
            <span className="min-w-0 flex-1 text-sm">
              {cvFile ? (
                <>
                  <span className="block truncate font-semibold">{cvFile.name}</span>
                  <span className="text-muted">Click to choose a different file</span>
                </>
              ) : (
                <>
                  <span className="block font-semibold">Choose a file</span>
                  <span className="text-muted">PDF or Word, up to {MAX_FILE_SIZE_MB} MB</span>
                </>
              )}
            </span>
            <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="sr-only" />
          </label>
        ) : (
          <input name="resume_link" type="url" placeholder="https://drive.google.com/..." aria-label="Link to your CV" className="input" />
        )}
        {cvError && <p className="field-error">{cvError}</p>}
      </div>

      <div>
        <label htmlFor="portfolio_link" className="label">Portfolio or LinkedIn (optional)</label>
        <input id="portfolio_link" name="portfolio_link" type="url" placeholder="https://" className="input" />
        {errors.portfolio_link && <p className="field-error">{errors.portfolio_link}</p>}
      </div>

      <div>
        <label htmlFor="cover_letter" className="label">Why are you a good fit? (optional)</label>
        <textarea id="cover_letter" name="cover_letter" rows={5} className="input" />
      </div>

      {formError && <p role="alert" className="form-error">{formError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={sending}>
        {sending ? "Sending application..." : "Send application"}
      </Button>
    </form>
  );
}

export default function ApplyButton({ job }) {
  const { user, isEmployer } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  // If a job seeker is logged in, check if they already applied
  useEffect(() => {
    if (!user || isEmployer) return;
    authRequest("/me/applications/?page_size=50")
      .then((data) => {
        const alreadyApplied = data.results.some((application) => application.job.slug === job.slug);
        setApplied(alreadyApplied);
      })
      .catch(() => {});
  }, [user, isEmployer, job.slug]);

  // Close the form when Escape is pressed
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") setShowForm(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!job.is_open) {
    return <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">This job is no longer taking applications.</p>;
  }

  if (isEmployer) {
    return <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">You&apos;re logged in as an employer. Log in as a job seeker to apply.</p>;
  }

  return (
    <>
      {applied ? (
        <div className="rounded-xl bg-green-light px-4 py-3 text-sm text-green">
          <p className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="size-4" /> You applied for this job
          </p>
          {user && <Link href="/dashboard" className="mt-1 inline-block text-green underline">See its status</Link>}
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={() => setShowForm(true)}>
          Apply now
        </Button>
      )}

      {/* The pop-up */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon/60 p-4" onClick={() => setShowForm(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white px-6 py-5">
              <div>
                <h2 id="apply-title" className="text-2xl">Apply for {job.title}</h2>
                <p className="text-sm text-muted">{job.company.name}</p>
              </div>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="cursor-pointer rounded-full p-2 hover:bg-maroon/5">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6">
              {justApplied ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto size-12 text-green" />
                  <h3 className="mt-3 text-2xl">Application sent</h3>
                  <p className="mt-2 text-muted">
                    {job.company.name} now has your application. A confirmation is on its way to your email.
                  </p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    {user ? (
                      <ButtonLink href="/dashboard" variant="dark">Track my applications</ButtonLink>
                    ) : (
                      <ButtonLink href="/jobs" variant="dark">Browse more jobs</ButtonLink>
                    )}
                    <Button variant="outline" onClick={() => setShowForm(false)}>Close</Button>
                  </div>
                </div>
              ) : (
                <ApplyForm
                  job={job}
                  onSuccess={() => {
                    setJustApplied(true);
                    setApplied(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
