"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Target, Briefcase, Heart, DollarSign, BookOpen, BarChart2, Menu, X, Timer, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checkin", label: "Check-in", icon: CheckSquare },
  { href: "/goals", label: "Objectifs 90j", icon: Target },
  { href: "/business", label: "Business", icon: Briefcase },
  { href: "/health", label: "Santé", icon: Heart },
  { href: "/finances", label: "Finances", icon: DollarSign },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/review", label: "Revue Hebdo", icon: BarChart2 },
  { href: "/timer", label: "Minuterie", icon: Timer },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <span className="font-bold text-primary text-lg tracking-tight">MODE DE VIE</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 pt-14">
          <nav className="p-4 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 flex-col bg-card border-r border-border z-40">
        <div className="p-6 border-b border-border">
          <h1 className="font-bold text-primary text-xl tracking-tight">MODE DE VIE</h1>
          <p className="text-xs text-muted-foreground mt-1">Système Personnel</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">v1.0.0 — Données locales</p>
        </div>
      </aside>

      <div className="md:hidden h-14" />
    </>
  );
}
