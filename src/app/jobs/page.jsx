"use client";
import { useState } from "react";
import MaxWidthContainer from "@/components/things-to-share/max-width-container";
import JobCard from "@/components/things-to-share/jobcard";
import { JobsCategories } from "@/constants/jobscategories";
import { differentJobs } from "@/constants/jobs";

export default function Jobs() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filteredJobs =
    selectedCategory === "All"
      ? differentJobs
      : differentJobs.filter((job) => job.category === selectedCategory);

  return (
    <section className="bg-[#FFF8F0]">
      <MaxWidthContainer className="flex flex-col md:flex-row gap-10">
        <aside className="hidden md:block md:sticky md:top-20 md:w-48 space-y-6 md:space-y-10 border-b-2 md:border-r-2 md:border-b-0 border-gray-400 h-full py-4 md:py-10 divide-y-2 md:divide-y-0 divide-gray-400">
          {JobsCategories.map((category, index) => (
            <h2
              key={index}
              className={`cursor-pointer py-3 md:py-6 hover:text-job-orange hover:scale-105 transition ${
                selectedCategory === category.title
                  ? "text-job-orange font-bold"
                  : ""
              }`}
              onClick={() => setSelectedCategory(category.title)}
            >
              {category.title}
            </h2>
          ))}
        </aside>

        <div className="md:hidden mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-job-orange rounded-lg my-2 px-3 py-4 text-sm text-[#3C1414]"
          >
            {JobsCategories.map((category, index) => (
              <option key={index} value={category.title}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6 md:py-10">
          {filteredJobs.map((job) => (
            <JobCard job={job} key={job.title} />
          ))}
        </div>
      </MaxWidthContainer>
    </section>
  );
}
