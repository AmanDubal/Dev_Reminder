import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppDataProvider } from "@/context/AppDataContext";
import ReminderEngine from "@/components/ReminderEngine";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Dev Reminder",
  description: "A simple personal task alarm — plan your day and never forget what matters.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppDataProvider>
          <Header />
          {children}
          <ReminderEngine />
        </AppDataProvider>
      </body>
    </html>
  );
}
