import { mockStats } from "@/lib/mock-data"

interface StatItem {
  label: string
  value: string
  sub: string
  accent: "primary" | "accent"
}

interface StatsGridProps {
  stats: StatItem[]
}

/** Server Component — rejilla de tarjetas de métricas */
export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 p-4 rounded-sm"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span
            className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {stat.label}
          </span>
          <span
            className="text-2xl font-semibold tracking-tight"
            style={{ color: `var(--color-${stat.accent})` }}
          >
            {stat.value}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {stat.sub}
          </span>
        </div>
      ))}
    </div>
  )
}
