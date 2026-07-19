import { Skeleton } from "@/app/_components/skeleton"

export default function CalendarLoading() {
  return (
    <div className="flex flex-col gap-6 px-5 py-7 lg:px-8 lg:py-8 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-7 w-52" />
      </div>

      {/* Calendar skeleton */}
      <div
        className="rounded-sm p-4"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Nav */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-3 w-24" />
        </div>
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 mx-auto w-5" />
          ))}
        </div>
        {/* Days */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={col} className="h-8" />
            ))}
          </div>
        ))}
      </div>

      {/* Event list skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-2.5 w-20 mb-1" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-sm"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderLeft: "2px solid var(--color-skeleton)",
            }}
          >
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
