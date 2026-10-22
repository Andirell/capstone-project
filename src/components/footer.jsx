import Link from "next/link";
import { CONTACT } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-maroon text-cream/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Link href="/" className="font-display text-3xl text-cream no-underline">
            Job<span className="text-brand">Z</span>
          </Link>
          <p className="mt-3 text-sm">Jobs from employers across Nigeria, in one place.</p>
          <a href={"mailto:" + CONTACT.email} className="mt-4 block text-sm text-cream">
            {CONTACT.email}
          </a>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-cream">Job seekers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/jobs" className="text-cream/80">Browse all jobs</Link></li>
            <li><Link href="/jobs?work_mode=remote" className="text-cream/80">Remote jobs</Link></li>
            <li><Link href="/register" className="text-cream/80">Create an account</Link></li>
            <li><Link href="/dashboard" className="text-cream/80">Track applications</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-cream">Employers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/register?role=employer" className="text-cream/80">Post a job</Link></li>
            <li><Link href="/dashboard" className="text-cream/80">Employer dashboard</Link></li>
            <li><Link href="/companies" className="text-cream/80">Browse companies</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-cream">JobZ</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="text-cream/80">About us</Link></li>
            <li><Link href="/contact" className="text-cream/80">Contact us</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex justify-between py-5 text-xs text-cream/60">
          <p>© {year} JobZ</p>
          <p>Built by DevAndi</p>
        </div>
      </div>
    </footer>
  );
}
