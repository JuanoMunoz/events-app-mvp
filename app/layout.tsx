import type { Metadata, Viewport } from "next"
import { Galindo, Google_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
})

const galindo = Galindo({
  variable: "--font-galindo",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Eventos · Sistema de gestión",
  description: "Registra y gestiona la asistencia a tus eventos.",
}

export const viewport: Viewport = {
  themeColor: "#125AF5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Mejor experiencia para PWA (evita zoom accidental)
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${galindo.variable} ${googleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderLeft: "2px solid var(--color-primary)",
              borderRadius: "4px",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  )
}
