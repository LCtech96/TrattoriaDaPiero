import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
})

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://trattoriadapieromondello.site'),
  title: 'Trattoria Da Piero - Specialità Mondello',
  description:
    'Il tuo punto di riferimento tra i ristoranti a Mondello. Vista mare, vicino la spiaggia, specialità siciliane. Pranzo veloce, cena romantica in un luogo tipico siciliano con tradizioni locali sul lungomare Mondello.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF6EC' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1428' },
  ],
}

// Applica il tema salvato prima del primo paint, così non c'è il flash chiaro/scuro.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('theme-storage')||'{}');if(s&&s.state&&s.state.isDark){document.documentElement.classList.add('dark')}}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
