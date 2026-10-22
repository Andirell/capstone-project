"use client";

import { Button } from "@/components/button";

// Shown if a page crashes
export default function ErrorPage({ reset }) {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-4xl">This page didn&apos;t load</h1>
      <p className="mt-3 text-muted">The job server may be restarting. Try again in a few seconds.</p>
      <Button className="mt-8" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
