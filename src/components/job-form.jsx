"use client";

// The form for posting a new job or editing one.
// For a new job: <JobForm />
// To edit a job:  <JobForm job={job} />

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "./button";
import { getData } from "@/lib/api";
import { authRequest } from "@/lib/auth";
import { EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from "@/lib/constants";

const EMPTY_FORM = {
  title: "",
  category: "",
  location: "",
  work_mode: "onsite",
  job_type: "full_time",
  experience_level: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
  description: "",
  requirements: "",
  benefits: "",
  deadline: "",
  is_active: true,
};

// Fill the form with the job's current values when editing
function jobToForm(job) {
  return {
    title: job.title,
    category: job.category ? job.category.slug : "",
    location: job.location,
    work_mode: job.work_mode,
    job_type: job.job_type,
    experience_level: job.experience_level || "",
    salary_min: job.salary_min || "",
    salary_max: job.salary_max || "",
    salary_currency: job.salary_currency,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    deadline: job.deadline || "",
    is_active: job.is_active,
  };
}

export default function JobForm({ job }) {
  const router = useRouter();
  const [form, setForm] = useState(job ? jobToForm(job) : EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getData("/categories/", []).then((data) => setCategories(data));
  }, []);

  // One change handler for every input, using the input's "name"
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setSaving(true);

    // Empty number/date fields must be sent as null, not ""
    const data = {
      ...form,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
      deadline: form.deadline === "" ? null : form.deadline,
    };

    try {
      if (job) {
        await authRequest(`/jobs/${job.slug}/`, { method: "PATCH", body: data });
        router.push("/dashboard");
      } else {
        const newJob = await authRequest("/jobs/", { method: "POST", body: data });
        router.push("/jobs/" + newJob.slug);
      }
    } catch (error) {
      setErrors(error.fields);
      if (Object.keys(error.fields).length > 0) {
        setFormError("Some fields need fixing. They're marked below.");
      } else {
        setFormError(error.message);
      }
      setSaving(false);
      window.scrollTo(0, 0);
    }
  }

  // Shows the error under a field, or a hint if there's no error
  function fieldMessage(name, hint) {
    if (errors[name]) {
      return <p className="field-error">{errors[name]}</p>;
    }
    if (hint) {
      return <p className="hint">{hint}</p>;
    }
    return null;
  }

  function inputClass(name) {
    return errors[name] ? "input has-error" : "input";
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {formError && <p role="alert" className="form-error">{formError}</p>}

      <section className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="text-2xl">The basics</h2>

        <div>
          <label htmlFor="title" className="label">Job title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" className={inputClass("title")} />
          {fieldMessage("title")}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className={inputClass("category")}>
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
            {fieldMessage("category")}
          </div>
          <div>
            <label htmlFor="location" className="label">City</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Lagos" className={inputClass("location")} />
            {fieldMessage("location", "For fully remote jobs, write “Remote”.")}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="work_mode" className="label">Work setup</label>
            <select id="work_mode" name="work_mode" value={form.work_mode} onChange={handleChange} className="input">
              {WORK_MODES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="job_type" className="label">Job type</label>
            <select id="job_type" name="job_type" value={form.job_type} onChange={handleChange} className="input">
              {JOB_TYPES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="experience_level" className="label">Experience</label>
            <select id="experience_level" name="experience_level" value={form.experience_level} onChange={handleChange} className="input">
              <option value="">Not specified</option>
              {EXPERIENCE_LEVELS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-2xl">Pay</h2>
          <p className="mt-1 text-sm text-muted">Showing a range helps candidates decide quickly if the job fits.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="salary_min" className="label">From</label>
            <input id="salary_min" name="salary_min" type="number" min="0" value={form.salary_min} onChange={handleChange} className={inputClass("salary_min")} />
            {fieldMessage("salary_min")}
          </div>
          <div>
            <label htmlFor="salary_max" className="label">To</label>
            <input id="salary_max" name="salary_max" type="number" min="0" value={form.salary_max} onChange={handleChange} className={inputClass("salary_max")} />
            {fieldMessage("salary_max")}
          </div>
          <div>
            <label htmlFor="salary_currency" className="label">Currency</label>
            <select id="salary_currency" name="salary_currency" value={form.salary_currency} onChange={handleChange} className="input">
              <option value="USD">US dollars ($)</option>
              <option value="NGN">Naira (₦)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="text-2xl">The job</h2>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" name="description" rows={8} value={form.description} onChange={handleChange} className={inputClass("description")} />
          {fieldMessage("description", "What the person will do and who they'll work with.")}
        </div>

        <div>
          <label htmlFor="requirements" className="label">Requirements</label>
          <textarea
            id="requirements"
            name="requirements"
            rows={6}
            value={form.requirements}
            onChange={handleChange}
            placeholder={"3+ years of React\nExperience with REST APIs"}
            className={inputClass("requirements")}
          />
          {fieldMessage("requirements", "One per line. Each line becomes a bullet point.")}
        </div>

        <div>
          <label htmlFor="benefits" className="label">Benefits (optional)</label>
          <textarea
            id="benefits"
            name="benefits"
            rows={4}
            value={form.benefits}
            onChange={handleChange}
            placeholder={"Health insurance\nRemote Fridays"}
            className={inputClass("benefits")}
          />
          {fieldMessage("benefits", "One per line.")}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="deadline" className="label">Application deadline (optional)</label>
            <input id="deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} className={inputClass("deadline")} />
            {fieldMessage("deadline", "The job closes automatically after this date.")}
          </div>
          <label className="flex items-center gap-3 self-end pb-3 font-semibold">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="size-5 accent-brand-dark" />
            Open for applications
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving..." : job ? "Save changes" : "Publish job"}
        </Button>
        <ButtonLink href="/dashboard" variant="outline" size="lg">Cancel</ButtonLink>
      </div>
    </form>
  );
}
