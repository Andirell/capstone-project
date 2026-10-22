import { ButtonLink } from "@/components/button";

// Shown for any page that doesn't exist (404)
export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-7xl text-brand">404</p>
      <h1 className="mt-4 text-4xl">This page isn&apos;t here</h1>
      <p className="mt-3 text-muted">The job may have been filled and taken down, or the link is wrong.</p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/jobs">Browse open jobs</ButtonLink>
        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
      </div>
    </div>
  );
}
