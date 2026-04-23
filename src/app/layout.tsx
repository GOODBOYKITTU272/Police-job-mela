import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siddipet Police Udyogh Mitra — Job Portal",
  description:
    "Official Job Mela portal for Siddipet Police. Track applications, pipeline status, and smart matching across multiple job opportunities launched on 23/04/2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
