import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Guard | Secure Telecom Engineering Assistant",
  description: "A portfolio prototype for controlled engineering support, approval gates, and agent accountability.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
