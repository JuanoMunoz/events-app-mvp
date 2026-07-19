import FloatingBottomNav from "@/app/_components/floating-bottom-nav"
import { requireSession } from "@/lib/utils/auth"

export default async function EventDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  return (
    <div
      className="relative min-h-dvh flex flex-col pb-24"
      style={{ background: "var(--color-background)" }}
    >
      <main className="flex-1 w-full max-w-lg mx-auto min-w-0">
        {children}
      </main>

      <FloatingBottomNav />
    </div>
  )
}
