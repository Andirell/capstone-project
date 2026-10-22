// Shown while the jobs page is loading
export default function Loading() {
  return (
    <div>
      <div className="h-56 bg-maroon" />
      <p className="container-page py-10 text-muted">Loading jobs...</p>
    </div>
  );
}
