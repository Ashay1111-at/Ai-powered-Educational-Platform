"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Users, BookOpen, Star, TrendingUp, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface InstructorStats {
  coursesCount: number;
  totalStudents: number;
  recentEnrollments: any[];
  revenue: number;
}

interface CourseAnalytics {
  id: string;
  title: string;
  enrollments: number;
  recentEnrollments: number;
  avgProgress: number;
  revenue: number;
  rating: number;
}

export default function InstructorDashboard() {
  const { user, dbUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbUser) return;
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get("/users/instructor-stats"),
          api.get("/users/instructor-course-analytics")
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dbUser]);

  if (loading || authLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-muted rounded-lg" />
            <div className="h-4 w-48 bg-muted rounded-lg" />
          </div>
          <div className="h-12 w-48 bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-2xl border border-border/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-muted rounded-3xl border border-border/50" />
          <div className="h-96 bg-muted rounded-3xl border border-border/50" />
        </div>
      </div>
    );
  }

  const statCards = [
    { name: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-foreground", bg: "bg-muted" },
    { name: "Active Courses", value: stats?.coursesCount || 0, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { name: "Average Rating", value: "4.9", icon: Star, color: "text-foreground", bg: "bg-muted" },
    { name: "Total Revenue", value: `$${(stats?.revenue || 0).toFixed(2)}`, icon: TrendingUp, color: "text-foreground", bg: "bg-muted" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, Professor {user?.displayName?.split(" ")[1] || user?.displayName?.split(" ")[0] || dbUser?.name?.split(" ")[1] || dbUser?.name?.split(" ")[0] || "Instructor"}!</p>
        </div>
        <Link 
          href="/dashboard/instructor/courses/new"
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:neon-glow transition-all flex items-center space-x-2 shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl border border-border"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Enrollments */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Enrollments</h2>
            <Link href="/dashboard/instructor/students" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <ul className="divide-y divide-border">
              {stats?.recentEnrollments.length === 0 ? (
                <li className="p-8 text-center text-muted-foreground">No recent enrollments.</li>
              ) : (
                stats?.recentEnrollments.map((enrollment) => (
                  <li key={enrollment.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(enrollment.student.name || "Student").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{enrollment.student.name || "Unnamed Student"}</p>
                        <p className="text-xs text-muted-foreground">Enrolled in: {enrollment.course.title}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Course Performance */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Course Performance</h2>
          <div className="glass rounded-2xl border border-border p-6 space-y-6">
            {analytics.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No course data available.</div>
            ) : (
              analytics.map((course, i) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-sm">{course.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        {course.enrollments} Students • {course.recentEnrollments} New
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-primary">${course.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>AVERAGE PROGRESS</span>
                      <span>{course.avgProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.avgProgress}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="bg-primary h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className="pt-4 border-t border-border">
              <Link 
                href="/dashboard/instructor/courses"
                className="w-full py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center"
              >
                Detailed Course Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
