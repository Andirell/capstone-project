import { ButtonLink } from "@/components/button";
import { getData } from "@/lib/api";
import { plural } from "@/lib/format";

export const metadata = { title: "About JobZ" };

export default async function AboutPage() {
  const stats = await getData("/stats/", null);

  return (
    <>
      <section className="container-page py-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl">Hiring in Nigeria, without the guesswork.</h1>
          <p className="mt-6 text-xl text-muted">
            JobZ is built around a simple promise: you should know what happened to every application you send. Job
            seekers see where each application stands, and employers get one tidy list of candidates instead of a
            flooded inbox.
          </p>
          {stats && (
            <p className="mt-6 text-lg">
              Today that&apos;s {plural(stats.open_jobs, "open job")} from {plural(stats.companies, "employer")} across{" "}
              {plural(stats.categories, "field")}.
            </p>
          )}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid gap-12 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl">For job seekers</h2>
            <p className="mt-3 text-lg text-muted">
              Search every open role by field, city, work setup and pay. Apply with your CV in a couple of minutes, save
              jobs for later, and follow each application from submitted to interview.
            </p>
            <ButtonLink href="/jobs" variant="dark" className="mt-6">Find a job</ButtonLink>
          </div>
          <div>
            <h2 className="text-3xl">For employers</h2>
            <p className="mt-3 text-lg text-muted">
              Post a job for free, get applications with CVs attached, and move candidates through review, shortlist and
              interview. Each update emails the candidate for you.
            </p>
            <ButtonLink href="/register?role=employer" variant="dark" className="mt-6">Post a job</ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl">Our mission</h2>
          <p className="mt-3 text-lg text-muted">
            Make the job search simple and honest: clear listings with real salary ranges, a fast way to apply, and an
            answer at the end of it.
          </p>
        </div>
        <div>
          <h2 className="text-3xl">Where we&apos;re going</h2>
          <p className="mt-3 text-lg text-muted">
            To be the career platform people across Africa trust first, connecting skilled professionals with employers
            who are ready to hire.
          </p>
        </div>
      </section>
    </>
  );
}
