"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Loader2, LayoutDashboard, BookOpen, MessageSquare,
  LogOut, Brain, FileText, HelpCircle, Menu, X, ChevronRight, GraduationCap
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const navItems = [
  { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard, exact: true },
  { name: "My Courses", href: "/dashboard/student/courses", icon: BookOpen },
  { name: "AI Tutor", href: "/dashboard/student/tutor", icon: MessageSquare },
  { name: "Quiz Lab", href: "/dashboard/student/quiz", icon: Brain },
  { name: "Smart Notes", href: "/dashboard/student/notes", icon: FileText },
  { name: "Doubt Solver", href: "/dashboard/student/doubts", icon: HelpCircle },
];

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!user && !loading) return null; // Let ProtectedRoute handle redirect

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          AI<span className="text-primary">Smart</span>
        </Link>
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={19} />
              <span className="font-medium">{item.name}</span>
              {isActive && <ChevronRight size={15} className="ml-auto opacity-70" />}
            </Link>
          );
        })}

        {dbUser?.role === 'ADMIN' && (
          <div className="pt-4 mt-4 border-t border-border">
            <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Admin Tools</p>
            <Link
              href="/dashboard/instructor"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <GraduationCap size={19} />
              <span className="font-medium">Instructor Mode</span>
            </Link>
            <Link
              href="/dashboard/admin"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <LayoutDashboard size={19} />
              <span className="font-medium">Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3 px-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">{user?.displayName || "User"}</p>
            <div className="flex items-center space-x-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                dbUser?.role === 'ADMIN' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {dbUser?.role || 'STUDENT'}
              </span>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
      <div className="min-h-screen bg-background flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop: static | mobile: drawer */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 z-40 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:z-auto
          `}
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile topbar */}
          <header className="md:hidden sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-lg">
              AI<span className="text-primary">Smart</span>
            </span>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.displayName?.charAt(0) || "S"}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
