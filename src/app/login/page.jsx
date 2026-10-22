"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button, ButtonLink } from "@/components/button";

function LoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Where to go after logging in, e.g. /login?next=/jobs/some-job
  let nextPage = searchParams.get("next") || "/dashboard";
  // Only allow pages on this site (not "//other-site.com")
  if (!nextPage.startsWith("/") || nextPage.startsWith("//")) {
    nextPage = "/dashboard";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push(nextPage);
    } catch (err) {
      if (err.status === 401) {
        setError("That email and password don't match an account. Check them and try again.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  }

  if (user && !loading) {
    return (
      <div className="text-center">
        <p className="text-muted">You&apos;re already logged in as {user.email}.</p>
        <ButtonLink href="/dashboard" className="mt-4">Go to your dashboard</ButtonLink>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        </div>

        {error && <p role="alert" className="form-error">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to JobZ? <Link href="/register">Create an account</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-14">
      <div className="w-full max-w-md">
        <h1 className="text-4xl">Log in</h1>
        <p className="mt-2 mb-8 text-muted">Track your applications, or manage your company&apos;s jobs.</p>
        {/* useSearchParams() needs to be inside <Suspense> */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
