"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, ArrowLeft, Loader2, Mail, Lock, Shield, User } from "lucide-react";
import toast from "react-hot-toast";

function LoginPageContent() {
  const { signInWithGoogle, signInWithEmail, user, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"google" | "email">("google");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Clear any pending roles from failed registration attempts
  useEffect(() => {
    localStorage.removeItem("pendingRole");
  }, []);

  // Handle redirects if already logged in
  useEffect(() => {
    if (!authLoading && user && dbUser) {
      // If we have a specific returnTo that isn't the default dashboard, honor it
      if (returnTo !== "/dashboard") {
        router.push(returnTo);
        return;
      }

      // Otherwise, redirect based on role
      toast.success("Welcome back!");
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

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed", error);
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      console.error("Login failed", error);
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Link */}
        <Link 
          href="/" 
          className="absolute -top-16 left-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="bg-muted/30 border border-border/50 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                <span className="text-white font-black text-xl">S</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              AI <span className="text-primary">SMART</span>
            </h1>
            <p className="text-muted-foreground text-sm">Log in to your account</p>
          </div>

          {/* Login Tabs */}
          <div className="flex bg-muted/50 p-1.5 rounded-2xl mb-8 border border-border/50">
            <button
              onClick={() => setLoginMethod("google")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                loginMethod === "google"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User size={16} />
              Standard
            </button>
            <button
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                loginMethod === "email"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield size={16} />
              Admin / Email
            </button>
          </div>

          <div className="space-y-6">
            {loginMethod === "google" ? (
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-zinc-100 hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-primary/90 hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <LogIn size={20} />
                      Log In
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground text-xs uppercase font-bold tracking-widest">New to AI SMART?</span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-4 rounded-2xl bg-muted/50 border border-border/50 font-bold text-center block hover:bg-muted transition-colors"
            >
              Create an Account
            </Link>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-10">
            By logging in, you acknowledge that you have read and understood our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
