import type { Metadata } from "next";
import "./globals.scss";
import { Nunito } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: process.env.SITE_TITLE,
  description: process.env.SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env?.GTM_ID ? (
          <GoogleTagManager gtmId={process.env.GTM_ID} />
        ) : null}
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/images/ampd-resume-favicon.png" />
      </head>
      <body className={nunito.variable}>{children}</body>
    </html>
  );
}
