import type { Metadata } from "next";
import { googleSans, googleSansCode } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "GDG on Campus AİBÜ",
  description: "Bolu Abant İzzet Baysal Üniversitesi Google Developer Group topluluğu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${googleSans.variable} ${googleSansCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
