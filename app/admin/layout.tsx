"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata = {
//   title: "Y-Gym Admin",
//   description: "Admin panel for Y-Gym fitness management",
// };

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}>
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex bg-white">
          <AdminSidebar />
        </div>
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-64 animate-in slide-in-from-left">
              <AdminSidebar />
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
          <footer className="border-t py-4 px-4 md:px-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Y-Gym. All rights reserved.</p>
              <p>v1.0.0</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
