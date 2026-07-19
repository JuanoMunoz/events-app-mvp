import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eventos Platform',
    short_name: 'Eventos',
    description: 'Gestión y control de asistencia para eventos',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#125AF5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
