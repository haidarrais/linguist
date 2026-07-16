import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Linguist",
  description: "Teacher-reviewed multilingual learning packages.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
