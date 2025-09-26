import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Take As Directed",
  description: "An autobiographical work by Michael Dinerstein",
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
