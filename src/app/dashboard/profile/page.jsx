"use client";

import { useState } from "react";
import Link from "next/link";
import RequireLogin from "@/components/require-login";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/button";
import { authRequest } from "@/lib/auth";

// Shows "Saved" or an error message next to a save button
function SaveMessage({ message }) {
  if (!message) return null;
  if (message === "Saved") {
    return <span className="text-sm font-semibold text-green">Saved</span>;
  }
  return <span className="text-sm font-medium text-red">{message}</span>;
}

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    setMessage("");
    setErrors({});
    try {
      const updatedUser = await authRequest("/auth/me/", { method: "PATCH", body: values });
      updateUser(updatedUser);
      setMessage("Saved");
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length === 0) {
        setMessage(error.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="full_name" className="label">Full name</label>
        <input id="full_name" name="full_name" defaultValue={user.full_name} required className="input" />
        {errors.full_name && <p className="field-error">{errors.full_name}</p>}
      </div>
      {user.role === "seeker" && (
        <div>
          <label htmlFor="headline" className="label">Headline</label>
          <input id="headline" name="headline" defaultValue={user.headline} placeholder="e.g. Accountant, ACCA, 4 years in audit" className="input" />
          <p className="hint">A one-line summary of what you do.</p>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">Phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={user.phone} className="input" />
        </div>
        <div>
          <label htmlFor="location" className="label">City</label>
          <input id="location" name="location" defaultValue={user.location} className="input" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit">Save changes</Button>
        <SaveMessage message={message} />
      </div>
    </form>
  );
}

function CompanyForm() {
  const { user, updateUser } = useAuth();
  const company = user.company;
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    setMessage("");
    setErrors({});
    try {
      await authRequest("/auth/me/company/", { method: "PATCH", body: values });
      // Reload the user so the new company info shows everywhere
      const updatedUser = await authRequest("/auth/me/");
      updateUser(updatedUser);
      setMessage("Saved");
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length === 0) {
        setMessage(error.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="label">Company name</label>
        <input id="name" name="name" defaultValue={company.name} required className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="website" className="label">Website</label>
          <input id="website" name="website" type="url" defaultValue={company.website} placeholder="https://" className="input" />
          {errors.website && <p className="field-error">{errors.website}</p>}
        </div>
        <div>
          <label htmlFor="company_location" className="label">Head office city</label>
          <input id="company_location" name="location" defaultValue={company.location} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="logo_url" className="label">Logo URL</label>
        <input id="logo_url" name="logo_url" type="url" defaultValue={company.logo_url} className="input" />
        {errors.logo_url ? (
          <p className="field-error">{errors.logo_url}</p>
        ) : (
          <p className="hint">Link to a square image. Leave it empty to show your initials.</p>
        )}
      </div>
      <div>
        <label htmlFor="description" className="label">About the company</label>
        <textarea id="description" name="description" rows={4} defaultValue={company.description} className="input" />
        <p className="hint">Shown on every job you post.</p>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit">Save changes</Button>
        <SaveMessage message={message} />
      </div>
    </form>
  );
}

function PasswordForm() {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form));
    setMessage("");
    setErrors({});
    try {
      await authRequest("/auth/change-password/", { method: "POST", body: values });
      form.reset();
      setMessage("Saved");
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length === 0) {
        setMessage(error.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="current_password" className="label">Current password</label>
        <input id="current_password" name="current_password" type="password" autoComplete="current-password" required className="input" />
        {errors.current_password && <p className="field-error">{errors.current_password}</p>}
      </div>
      <div>
        <label htmlFor="new_password" className="label">New password</label>
        <input id="new_password" name="new_password" type="password" autoComplete="new-password" minLength={8} required className="input" />
        {errors.new_password && <p className="field-error">{errors.new_password}</p>}
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit">Change password</Button>
        <SaveMessage message={message} />
      </div>
    </form>
  );
}

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container-page max-w-3xl space-y-8 py-12">
      <div>
        <Link href="/dashboard" className="text-sm text-muted">Back to dashboard</Link>
        <h1 className="mt-2 text-5xl">Your profile</h1>
        <p className="mt-2 text-muted">Logged in as {user.email}</p>
      </div>

      <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="mb-5 text-2xl">About you</h2>
        <ProfileForm />
      </section>

      {user.company && (
        <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="mb-5 text-2xl">Company profile</h2>
          <CompanyForm />
        </section>
      )}

      <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="mb-5 text-2xl">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <RequireLogin>
      <ProfilePage />
    </RequireLogin>
  );
}
