"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, BookOpen, ShieldCheck, ArrowRight, Loader2, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

const roles = [
  {
    id: "STUDENT",
    title: "Student",
    description: "Access courses, solve doubts with AI, and track your learning path.",
    icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: "INSTRUCTOR",
    title: "Instructor",
    description: "Create courses, manage students, and use AI to generate curriculum.",
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

function RegisterPageContent() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { signInWithGoogle, registerWithEmail, user, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regMethod, setRegMethod] = useState<"google" | "email">("google");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle redirects if already logged in
  useEffect(() => {
    if (!authLoading && user && dbUser) {
      // If we have a specific returnTo that isn't the default dashboard, honor it
      if (returnTo !== "/dashboard") {
        router.push(returnTo);
        return;
      }

      // Otherwise, redirect based on role
      const role = dbUser.role;
      if (role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (role === "INSTRUCTOR") {
        router.push("/dashboard/instructor");
      } else {
        router.push("/dashboard/student");
      }
    }
  }, [user, dbUser, authLoading, router, returnTo]);

  const handleGoogleRegister = async () => {
    if (!selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem("pendingRole", selectedRole);
      await signInWithGoogle();
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password, name, selectedRole);
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Registration failed", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:block">
          <Link href="/" className="flex items-center gap-2 mb-8 group w-fit">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black tracking-tighter">
              AI <span className="text-primary">SMART</span>
            </span>
          </Link>
          <h1 className="text-5xl font-black tracking-tight mb-6 leading-[1.1]">
            Join the <span className="text-primary italic">Future</span> of Learning.
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            Unlock your potential with AI-powered personalized education. Choose your role and sign up in seconds.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Secure & Private</p>
                <p className="text-xs text-muted-foreground">Your data is always encrypted and protected.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Role Selection & Form */}
        <div className="bg-muted/30 border border-border/50 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl relative">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Create an Account</h2>
            <p className="text-muted-foreground text-sm">
              Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log In</Link>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">1. Choose your role</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center group ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/5 shadow-inner"
                      : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${role.bg} ${role.color}`}>
                    <role.icon size={20} />
                  </div>
                  <h3 className="font-bold text-xs truncate w-full">{role.title}</h3>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">2. Sign Up Method</p>
            
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setRegMethod("google")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  regMethod === "google" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                Google
              </button>
              <button
                onClick={() => setRegMethod("email")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  regMethod === "email" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                Email & Password
              </button>
            </div>

            {regMethod === "google" ? (
              <button
                onClick={handleGoogleRegister}
                disabled={!selectedRole || isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  selectedRole && !isSubmitting
                    ? "bg-primary text-white shadow-xl shadow-primary/30 hover:-translate-y-1 active:scale-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleEmailRegister} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedRole || isSubmitting}
                  className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                    selectedRole && !isSubmitting
                      ? "bg-primary text-white shadow-xl shadow-primary/30 hover:-translate-y-1 active:scale-95"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6 px-4">
            By signing up, you agree to our <span className="text-foreground font-bold underline cursor-pointer">Terms of Service</span> and <span className="text-foreground font-bold underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
