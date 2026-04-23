import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecruitIQ — Candidate Intelligence Dashboard",
  description:
    "Real-time recruitment intelligence system. Track candidate applications, pipeline status, and smart matching across multiple jobs.",
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
