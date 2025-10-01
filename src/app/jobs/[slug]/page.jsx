"use client";
import { use } from "react";   
import { useState } from "react";
import { differentJobs } from "@/constants/jobs";
import MaxWidthContainer from "@/components/things-to-share/max-width-container";
import { Button } from "@/components/ui/button";


function JobApplicationForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Application submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="johndoe12@gmail.com"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resume (Link)</label>
        <input
          type="url"
          placeholder="resume link"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Why should we pick you?</label>
        <textarea
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          rows="4"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#EC5C42] hover:bg-[#d84f39] text-white py-2 rounded-lg font-semibold"
      >
        Submit Application
      </Button>
    </form>
  );
}

export default function Page({ params }) {
  const { slug } = use(params);   
  const differentJob = differentJobs.find(
    (job) => job.id.toString() === slug.split("-").pop()
  );

  const [isOpen, setIsOpen] = useState(false);

  if (!differentJob) {
    return (
      <MaxWidthContainer>
        <p className="text-center text-red-500 text-lg py-10">Job not found</p>
      </MaxWidthContainer>
    );
  }

  return (
    <section className="py-16 bg-[#FFF8F0]">
      <MaxWidthContainer>
      <div className="border  border-gray-200 rounded-2xl p-8 space-y-6 w-full max-w-4xl mx-auto">
        <div className="bg-white gap-8 shadow-lg border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-xl transition">
          <h1 className="text-5xl text-[#3C1414]">{differentJob.title}</h1>
          <div className="flex gap-8 text-gray-600">
            <p>{differentJob.company}</p>
            <p>{differentJob.location}</p>
            <p>{differentJob.salary}</p>
            <p>{differentJob.tags}</p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-40 bg-[#EC5C42] hover:bg-[#d84f39] text-white py-3 rounded-xl font-semibold transition"
          >
            Apply Now
          </Button>
        </div>

        <div className="space-y-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition">
          <h2 className="text-2xl font-bold text-[#3C1414] mb-4">Job Description</h2>
          <p>{differentJob.description}</p>
        </div>

        <div className="space-y-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition">
          <h2 className="text-2xl font-light text-[#3C1414] mb-4">Job Requirements</h2>
          <p>{differentJob.requirement}</p>
        </div>

        {isOpen && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Apply for {differentJob.title}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <JobApplicationForm />
            </div>
          </div>
        )}
      </div>
     </MaxWidthContainer>
   </section> 
     );
}
