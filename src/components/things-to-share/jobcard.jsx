import Link from "next/link";
import { Button } from "../ui/button";

export default function JobCard({ job }) {
  return (
    <div className="bg-white flex flex-col justify-between items-start p-6 border border-gray-200 rounded-2xl">
      <h2 className="text-xl font-semibold text-[#3C1414] mb-2">{job.title}</h2>

      <p className="text-lg font-medium text-[#EC5C42] mb-4">{job.company}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full ">
          {job.location}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full ">
          {job.tags}
        </span>
      </div>

      <p className="text-base font-medium text-amber-700 bg-amber-50 border border-[amber-200] px-4 py-2 rounded-xl mb-6">
        {job.salary}
      </p>

      <Link
        href={`/jobs/${job.title
          .toLowerCase()
          .replace(/[\s/]+/g, "-")}-${job.company
          .toLowerCase()
          .replace(/[\s/]+/g, "-")}-${job.id}`}
      >
        <Button className="w-32 bg-[#EC5C42] text-white font-semibold py-3 rounded-xl hover:bg-[#3C1414] ">
          View More
        </Button>
      </Link>
    </div>
  );
}
