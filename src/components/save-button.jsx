"use client";

import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useAuth } from "./auth-context";

// The bookmark button for saving a job.
// showText={true} shows "Save job" next to the icon.
export default function SaveButton({ slug, showText = false }) {
  const { user, isEmployer, savedJobs, toggleSavedJob } = useAuth();
  const router = useRouter();

  // Employers can't save jobs
  if (isEmployer) {
    return null;
  }

  const isSaved = savedJobs.includes(slug);
  const label = isSaved ? "Saved" : "Save job";

  function handleClick(event) {
    // The button sits inside a clickable job card, so stop the card's link from opening
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push("/login?next=/jobs/" + slug);
      return;
    }
    toggleSavedJob(slug);
  }

  if (showText) {
    return (
      <button
        onClick={handleClick}
        aria-pressed={isSaved}
        className={`inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-5 font-semibold hover:border-maroon/40 ${isSaved ? "text-brand-dark" : "text-ink"}`}
      >
        <Bookmark className={`size-5 ${isSaved ? "fill-current" : ""}`} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
      className={`relative z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-maroon/5 ${isSaved ? "text-brand-dark" : "text-muted"}`}
    >
      <Bookmark className={`size-5 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
