import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "IELTS Listening Hub — General Training Practice Tests",
  description:
    "Practice IELTS General Training Listening with realistic CBT-style mock tests. Instant auto-save, review flags, answer key, and high-contrast mode.",
  applicationName: "IELTS Listening Hub",
  authors: [{ name: "Manoj Kumar" }],
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
