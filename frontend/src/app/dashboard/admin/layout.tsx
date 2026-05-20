"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, BookOpen,
  LogOut, Shield, ChevronRight, Menu, X, Loader2, GraduationCap, UserCircle
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

const adminNav = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/instructor", label: "Instructor Mode", icon: GraduationCap },
  { href: "/dashboard/student", label: "Student Mode", icon: UserCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!user && !loading) return null;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-40 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.displayName || "Administrator"}</p>
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                  {dbUser?.role || 'ADMIN'}
                </span>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted">
            <Menu size={22} />
          </button>
          <span className="font-bold">Admin Panel</span>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user?.displayName?.charAt(0) || "A"}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
