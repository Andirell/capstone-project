"use client";

// Wrap a page with this to make it for logged-in users only.
// Pass role="employer" or role="seeker" to only allow one type of user.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { ButtonLink } from "./button";

export default function RequireLogin({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Send them to log in, then bring them back here
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="container-page py-24 text-center text-muted">Loading your account...</p>;
  }

  if (role && user.role !== role) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl">This page is for {role === "employer" ? "employers" : "job seekers"}</h1>
        <p className="mt-2 text-muted">You are logged in as {user.email}.</p>
        <ButtonLink href="/dashboard" className="mt-6">
          Go to your dashboard
        </ButtonLink>
      </div>
    );
  }

  return children;
}
