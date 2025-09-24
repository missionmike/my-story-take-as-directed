import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Take As Directed",
  description:
    "A modern app that fetches content from Google Docs and renders each tab as its own page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
