"use client";

import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 bg-white">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      {showSearch ? (
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm outline-none"
            autoComplete="off"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSearch(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close search</span>
          </Button>
        </div>
      ) : (
        <>
          <div className="w-full flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 md:flex"
            asChild
          >
            <Link href="/admin/profile">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                A
              </div>
              <span className="hidden md:inline-flex">Admin</span>
            </Link>
          </Button>
        </>
      )}
    </header>
  );
}
