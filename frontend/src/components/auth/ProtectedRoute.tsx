"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?returnTo=${returnUrl}`);
      } else if (allowedRoles && dbUser) {
        // Check authorization (ADMIN role bypasses specific role requirements)
        const isAuthorized = dbUser.role === "ADMIN" || allowedRoles.includes(dbUser.role);
        
        if (!isAuthorized) {
          // Logged in but unauthorized for this specific role
          if (dbUser.role === "INSTRUCTOR") {
            router.push("/dashboard/instructor");
          } else if (dbUser.role === "ADMIN") {
            router.push("/dashboard/admin");
          } else {
            router.push("/dashboard/student");
          }
        }
      }
    }
  }, [user, dbUser, loading, allowedRoles, router, pathname]);

  // Authorization check for rendering
  const isAuthorized = !allowedRoles || (dbUser && (dbUser.role === "ADMIN" || allowedRoles.includes(dbUser.role)));

  if (loading || !user || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">
          Authenticating Secure Session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
