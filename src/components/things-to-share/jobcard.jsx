import Link from "next/link";
import { Button } from "../ui/button";

export default function JobCard({ job }) {
  return (
    <div className="bg-white flex flex-col justify-between p-6 border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold text-[#3C1414] mb-2 break-words">
        {job.title}
      </h2>

      <p className="text-base sm:text-lg font-medium text-[#EC5C42] mb-4">
        {job.company}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm break-words">
          {job.location}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm break-words">
          {job.tags}
        </span>
      </div>

      <p className="text-sm sm:text-base font-medium text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl mb-6 inline-block">
        {job.salary}
      </p>

      <Link
        href={`/jobs/${job.title
          .toLowerCase()
          .replace(/[\s/]+/g, "-")}-${job.company
          .toLowerCase()
          .replace(/[\s/]+/g, "-")}-${job.id}`}
        className="w-full"
      >
        <Button className="w-full sm:w-32 bg-[#EC5C42] text-white font-semibold py-3 rounded-xl hover:bg-[#3C1414] transition">
          View More
        </Button>
      </Link>
    </div>
  );
}
