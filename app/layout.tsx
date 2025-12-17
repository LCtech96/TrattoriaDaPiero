import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Trattoria Da Piero - Specialità Mondello",
  description: "Il tuo punto di riferimento tra i ristoranti a Mondello. Vista mare, vicino la spiaggia, specialità siciliane. Pranzo veloce, cena romantica in un luogo tipico siciliano con tradizioni locali sul lungomare Mondello.",
  icons: {
    icon: '/favicon-image.png',
    apple: '/favicon-image.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

