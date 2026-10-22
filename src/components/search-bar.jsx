"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Button } from "./button";

// The "Job title + City" search box.
// On the jobs page we keep the other filters (keepFilters={true}).
export default function SearchBar({ keepFilters = false, className = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("location") || "");

  function handleSubmit(event) {
    event.preventDefault();

    const params = keepFilters ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();

    if (keyword.trim()) {
      params.set("q", keyword.trim());
    } else {
      params.delete("q");
    }

    if (city.trim()) {
      params.set("location", city.trim());
    } else {
      params.delete("location");
    }

    // New search, so go back to page 1
    params.delete("page");

    router.push("/jobs?" + params.toString());
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 rounded-2xl bg-cream p-2 text-ink shadow-lg sm:flex-row sm:items-center sm:rounded-full ${className}`}
    >
      <label className="flex flex-1 items-center gap-2.5 px-3">
        <Search className="size-5 text-muted" />
        <span className="sr-only">Job title, skill or company</span>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Title, skill or company"
          className="h-11 w-full bg-transparent placeholder:text-muted focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2.5 border-t border-line px-3 sm:w-48 sm:border-t-0 sm:border-l">
        <MapPin className="size-5 text-muted" />
        <span className="sr-only">City</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or “Remote”"
          className="h-11 w-full bg-transparent placeholder:text-muted focus:outline-none"
        />
      </label>

      <Button type="submit">Search jobs</Button>
    </form>
  );
}
