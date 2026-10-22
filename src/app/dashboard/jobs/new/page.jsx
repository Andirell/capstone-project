"use client";

import Link from "next/link";
import RequireLogin from "@/components/require-login";
import JobForm from "@/components/job-form";

export default function NewJobPage() {
  return (
    <RequireLogin role="employer">
      <div className="container-page max-w-3xl py-12">
        <Link href="/dashboard" className="text-sm text-muted">Back to dashboard</Link>
        <h1 className="mt-2 text-5xl">Post a job</h1>
        <p className="mt-2 mb-8 text-muted">It goes live as soon as you publish. You can edit or close it any time.</p>
        <JobForm />
      </div>
    </RequireLogin>
  );
}
