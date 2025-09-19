import { differentJobs } from "@/constants/jobs";

export default function page({ params }) {
  const { slug } = params;
  const differentJob = differentJobs.find(
    (job) => job.id.toString() === slug.split("-").pop()
  );

  return (
    <div>
      <div>
        <h1>{differentJob.title}</h1>
        <p>{differentJob.company}</p>
        <p>{differentJob.location}</p>
        <p>{differentJob.salary}</p>
        <p>{differentJob.remote}</p>
      </div>
      <div>
        <p>{differentJob.description}</p>
      </div>
      <div>
        {differentJob.requirement}
      <p> 3+ years of professional experience in software development. <br />
        - Proficiency in JavaScript/TypeScript, React, or Next.js. <br /> 
- Familiarity with backend technologies (Node.js, Express, or Django). <br />  
- Experience with relational and NoSQL databases (e.g., PostgreSQL, MongoDB). <br /> 
- Strong understanding of version control (Git) and CI/CD pipelines.  <br />
- Excellent debugging, optimization, and problem-solving skills.  <br />
- Ability to work independently and remotely with minimal supervision. <br />  
- Good communication skills and a strong team spirit.</p>
      </div>
    </div>
  );
}
