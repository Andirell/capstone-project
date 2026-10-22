"use client";

// The filters on the jobs page.
// Filters are stored in the URL (e.g. /jobs?category=engineering&work_mode=remote)
// so the page can load the right jobs from the server, and people can share the link.

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { EXPERIENCE_LEVELS, JOB_TYPES, SALARY_OPTIONS, SORT_OPTIONS, WORK_MODES } from "@/lib/constants";

// A small hook so both components below can read and change the URL filters
function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getValue(name) {
    return searchParams.get(name) || "";
  }

  // For filters that can have many values, e.g. work_mode=remote,hybrid
  function getList(name) {
    const value = searchParams.get(name);
    return value ? value.split(",") : [];
  }

  function setValue(name, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.delete("page"); // filters changed, so start from page 1
    router.push(pathname + "?" + params.toString(), { scroll: false });
  }

  function toggleInList(name, value) {
    let list = getList(name);
    if (list.includes(value)) {
      list = list.filter((item) => item !== value);
    } else {
      list.push(value);
    }
    setValue(name, list.join(","));
  }

  return { getValue, getList, setValue, toggleInList };
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-b-0">
      <h3 className="mb-2 font-sans text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange, type = "checkbox", name, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-maroon/5">
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-4 accent-brand-dark" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-sm text-muted">{count}</span>}
    </label>
  );
}

export function FilterPanel({ categories }) {
  const filters = useFilters();
  const [showOnMobile, setShowOnMobile] = useState(false);

  const selectedCategory = filters.getValue("category");

  return (
    <div>
      {/* On phones the filters are hidden until you tap this button */}
      <button
        onClick={() => setShowOnMobile(!showOnMobile)}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        {showOnMobile ? "Hide filters" : "Show filters"}
      </button>

      <div className={showOnMobile ? "mb-6 block" : "hidden lg:block"}>
        <FilterSection title="Category">
          <Checkbox
            type="radio"
            name="category"
            label="All categories"
            checked={selectedCategory === ""}
            onChange={() => filters.setValue("category", "")}
          />
          {categories.map((category) => (
            <Checkbox
              key={category.slug}
              type="radio"
              name="category"
              label={category.name}
              count={category.job_count}
              checked={selectedCategory === category.slug}
              onChange={() => filters.setValue("category", category.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Where you work">
          {WORK_MODES.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={filters.getList("work_mode").includes(option.value)}
              onChange={() => filters.toggleInList("work_mode", option.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Job type">
          {JOB_TYPES.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={filters.getList("job_type").includes(option.value)}
              onChange={() => filters.toggleInList("job_type", option.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Experience">
          {EXPERIENCE_LEVELS.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={filters.getList("experience_level").includes(option.value)}
              onChange={() => filters.toggleInList("experience_level", option.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Salary">
          <select
            aria-label="Minimum salary"
            value={filters.getValue("salary_min")}
            onChange={(e) => filters.setValue("salary_min", e.target.value)}
            className="input"
          >
            {SALARY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterSection>
      </div>
    </div>
  );
}

export function SortSelect() {
  const filters = useFilters();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort by
      <select
        value={filters.getValue("ordering")}
        onChange={(e) => filters.setValue("ordering", e.target.value)}
        className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-ink"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
