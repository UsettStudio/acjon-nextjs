import { Skeleton } from "@/components/ui/skeleton";

export function SelectorSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[110rem] gap-4 p-3 sm:p-6" aria-busy="true">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)]">
        <Skeleton className="aspect-[16/10] w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
