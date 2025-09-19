import MaxWidthContainer from "@/components/things-to-share/max-width-container";
import JobCard from "@/components/things-to-share/jobcard";
import { JobsCategories } from "@/constants/jobscategories";
import { differentJobs } from "@/constants/jobs";

export default function Jobs() {
    return (
        <section className="">
            <MaxWidthContainer className="flex gap-20">
                <aside className="sticky top-0 w-48 space-y-10 border-r-2 border-gray-400 h-full py-10 divide-y-2">
                    {JobsCategories.map((category, index) => (
                        <h2 className="cursor-pointer py-6 hover:text-job-orange hover:scale-105" key={index}>{category.title}</h2>
                    ))}
                </aside>

                <div className="relative flex-1 overflow-y-auto flex flex-wrap gap-8 py-10">
                    {differentJobs.map(job => <JobCard job={job} key={job.title}/>)}
                </div>
            </MaxWidthContainer>
        </section>
    )
}
