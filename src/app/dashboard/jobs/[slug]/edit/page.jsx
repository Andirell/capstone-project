"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import RequireLogin from "@/components/require-login";
import JobForm from "@/components/job-form";
import { authRequest } from "@/lib/auth";

function EditJob({ slug }) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authRequest(`/jobs/${slug}/`)
      .then((data) => setJob(data))
      .catch((err) => setError(err.status === 404 ? "This job doesn't exist or isn't yours." : err.message));
  }, [slug]);

  return (
    <div className="container-page max-w-3xl py-12">
      <Link href="/dashboard" className="text-sm text-muted">Back to dashboard</Link>
      <h1 className="mt-2 mb-8 text-5xl">Edit job</h1>
      {error && <p className="form-error">{error}</p>}
      {!job && !error && <p className="text-muted">Loading...</p>}
      {job && <JobForm job={job} />}
    </div>
  );
}

export default function EditJobPage({ params }) {
  // In Next.js 15, params is a Promise, so we unwrap it with use()
  const { slug } = use(params);

  return (
    <RequireLogin role="employer">
      <EditJob slug={slug} />
    </RequireLogin>
  );
}
