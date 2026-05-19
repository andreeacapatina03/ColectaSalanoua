import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colectă Fest Sala Nouă",
  description: "Urmărește progresul colectei în timp real.",
  themeColor: "#08080d",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body className="grain">{children}</body>
    </html>
  );
}
