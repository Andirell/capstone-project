"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./button";
import { sendRequest } from "@/lib/api";

export default function ContactForm() {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFormError("");

    // Turn the form into an object like { name: "...", email: "...", message: "..." }
    const values = Object.fromEntries(new FormData(event.target));

    setSending(true);
    try {
      await sendRequest("/contact/", { method: "POST", body: values });
      setSent(true);
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length === 0) {
        setFormError(error.message);
      }
    }
    setSending(false);
  }

  if (sent) {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green" />
        <h2 className="mt-3 text-3xl">Message sent</h2>
        <p className="mt-2 text-muted">Thanks for writing. We usually reply within one working day.</p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input id="name" name="name" autoComplete="name" className={errors.name ? "input has-error" : "input"} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className={errors.email ? "input has-error" : "input"} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="label">Subject (optional)</label>
        <input id="subject" name="subject" placeholder="e.g. Problem posting a job" className="input" />
      </div>

      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={6} className={errors.message ? "input has-error" : "input"} />
        {errors.message && <p className="field-error">{errors.message}</p>}
      </div>

      {/* Hidden field to catch spam bots. Real people never see it. */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {formError && <p role="alert" className="form-error">{formError}</p>}

      <Button type="submit" size="lg" disabled={sending}>
        {sending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
