export function SiteSkeleton() {
  return (
    <div className="min-h-svh animate-pulse bg-white" aria-busy="true">
      <div className="h-16 border-b" />
      <div className="h-[28rem] bg-neutral-200" />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="h-4 w-full max-w-2xl rounded bg-neutral-200" />
        <div className="h-4 w-full max-w-xl rounded bg-neutral-200" />
      </div>
    </div>
  );
}
