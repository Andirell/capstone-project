import { differentJobs } from "@/constants/jobs";
import MaxWidthContainer from "@/components/things-to-share/max-width-container";
import { Button } from "@/components/ui/button";

export default function page({ params }) {
  const { slug } = params;
  const differentJob = differentJobs.find(
    (job) => job.id.toString() === slug.split("-").pop()
  );

  return (
    <MaxWidthContainer>
      <div className="p-8 space-y-6 w-full max-w-4xl mx-auto">
        <div className="bg-white gap-8 shadow-lg border border-gray-200 rounded-2xl p-6 flex flex-col  hover:shadow-xl transition"> 
          <h1 className="text-5xl text-[#3C1414]">{differentJob.title}</h1>
          <div className=" flex flex-cols gap-8 text-gray-600">
            <p>{differentJob.company}</p>
            <p>{differentJob.location}</p>
            <p>{differentJob.salary}</p>
            <p>{differentJob.tags}</p>
          </div>
          <Button type= "submit" className="w-40 bg-[#EC5C42] hover:bg-[#d84f39] text-white py-3 rounded-xl font-semibold transition">
            Apply Now</Button>
        </div>
        <div className="space-y-6"> 
          <h2 className="text-2xl font-bold text-[#3C1414] mb-4">Job Description</h2>
          <p>{differentJob.description}</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#3C1414] mb-4">Job Requirements</h2>
          {differentJob.requirement}
          <p>
            {" "}
            - 3+ years of professional experience in software development. <br />
            - Proficiency in JavaScript/TypeScript, React, or Next.js. <br />
            - Familiarity with backend technologies (Node.js, Express, or
            Django). <br />
            - Experience with relational and NoSQL databases (e.g., PostgreSQL,
            MongoDB). <br />
            - Strong understanding of version control (Git) and CI/CD pipelines.{" "}
            <br />
            - Excellent debugging, optimization, and problem-solving skills.{" "}
            <br />
            - Ability to work independently and remotely with minimal
            supervision. <br />- Good communication skills and a strong team
            spirit.
          </p>
        </div>
      </div>
    </MaxWidthContainer>
  );
}
