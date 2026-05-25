"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, UserCircle, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, dbUser, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const getDashboardLink = () => {
    if (!dbUser) return "/dashboard/student";
    switch (dbUser.role) {
      case "ADMIN": return "/dashboard/admin";
      case "INSTRUCTOR": return "/dashboard/instructor";
      default: return "/dashboard/student";
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3 shadow-lg" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black tracking-tighter hidden sm:block">
              AI <span className="text-primary">SMART</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              <Link href="/courses" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Courses</Link>
              <Link href="/community" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Community</Link>
            </div>

            <div className="h-4 w-px bg-border/50" />

            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-24 h-9 bg-muted animate-pulse rounded-full" />
              ) : user ? (
                <Link 
                  href={getDashboardLink()} 
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all font-black text-sm active:scale-95"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 hover:text-primary transition-colors"
                  >
                    <LogIn size={18} />
                    <span>Log In</span>
                  </Link>
                  <Link 
                    href="/register" 
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-2xl hover:bg-primary hover:text-white transition-all font-black text-sm active:scale-95"
                  >
                    <UserPlus size={18} />
                    <span>Join Free</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-muted/50 border border-border/50 rounded-xl"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-8 flex flex-col gap-6 items-center text-center">
              <Link href="/courses" className="text-xl font-bold" onClick={() => setIsOpen(false)}>Courses</Link>
              <Link href="/community" className="text-xl font-bold" onClick={() => setIsOpen(false)}>Community</Link>
              
              <div className="w-full h-px bg-border/50" />

              {user ? (
                <Link 
                  href={getDashboardLink()} 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex flex-col w-full gap-4">
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 rounded-2xl bg-muted/50 border border-border/50 font-black text-lg"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20"
                  >
                    Join for Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
