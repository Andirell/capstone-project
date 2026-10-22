"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/button";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // /register?role=employer opens the form with "I'm hiring" picked
  const [role, setRole] = useState(searchParams.get("role") === "employer" ? "employer" : "seeker");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    values.role = role;

    setLoading(true);
    setErrors({});
    setFormError("");
    try {
      await register(values);
      // Employers go straight to posting a job, job seekers go to the jobs list
      router.push(role === "employer" ? "/dashboard/jobs/new" : "/jobs");
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length === 0) {
        setFormError(error.message);
      }
      setLoading(false);
    }
  }

  function roleButtonClass(value) {
    const base = "flex cursor-pointer flex-col items-start gap-2 rounded-2xl border p-4 text-sm font-semibold";
    if (role === value) {
      return base + " border-maroon bg-maroon text-cream";
    }
    return base + " border-line hover:border-maroon/40";
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div>
          <p className="label">What brings you here?</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={role === "seeker"} onClick={() => setRole("seeker")} className={roleButtonClass("seeker")}>
              <UserRound className="size-5" />
              I&apos;m looking for a job
            </button>
            <button type="button" aria-pressed={role === "employer"} onClick={() => setRole("employer")} className={roleButtonClass("employer")}>
              <Briefcase className="size-5" />
              I&apos;m hiring
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="full_name" className="label">Full name</label>
          <input id="full_name" name="full_name" autoComplete="name" required className="input" />
          {errors.full_name && <p className="field-error">{errors.full_name}</p>}
        </div>

        {role === "employer" && (
          <div>
            <label htmlFor="company_name" className="label">Company name</label>
            <input id="company_name" name="company_name" autoComplete="organization" required className="input" />
            {errors.company_name && <p className="field-error">{errors.company_name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
          {errors.password ? (
            <p className="field-error">{errors.password}</p>
          ) : (
            <p className="hint">At least 8 characters. Avoid common passwords.</p>
          )}
        </div>

        {formError && <p role="alert" className="form-error">{formError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-14">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-4xl">Create your account</h1>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
