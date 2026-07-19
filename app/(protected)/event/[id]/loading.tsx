import { Skeleton } from "@/app/_components/skeleton"

export default function EventLoading() {
  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:px-8 lg:py-8 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="h-7 w-56" />
      </div>

      {/* City selector card */}
      <div
        className="p-5 rounded-sm"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderLeft: "2px solid var(--color-skeleton)",
        }}
      >
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
