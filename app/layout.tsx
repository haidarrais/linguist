import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeachBack - Make learning visible",
  description: "A teacher-controlled Misconception Twin for explanation, transfer, and learning evidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
