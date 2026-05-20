"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Flame, Target, Trophy, Clock, Loader2, ArrowRight } from "lucide-react";
import StreakHeatmap from "@/components/dashboard/StreakHeatmap";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface StudentStats {
  enrollmentsCount: number;
  completedCount: number;
  latestEnrollment: any | null;
  streak: number;
  hoursLearned: number;
}

export default function StudentDashboard() {
  const { user, dbUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !dbUser) return;
    if (!user) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get("/users/student-stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dbUser, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-48 bg-muted rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-2xl border border-border/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-muted rounded-3xl border border-border/50" />
          <div className="h-96 bg-muted rounded-3xl border border-border/50" />
        </div>
      </div>
    );
  }

  const statCards = [
    { name: "Current Streak", value: `${stats?.streak || 0} Days`, icon: Flame, color: "text-primary", bg: "bg-primary/10" },
    { name: "Courses Completed", value: stats?.completedCount || 0, icon: Trophy, color: "text-foreground", bg: "bg-muted" },
    { name: "Hours Learned", value: `${stats?.hoursLearned || 0}h`, icon: Clock, color: "text-foreground", bg: "bg-muted" },
    { name: "Courses Enrolled", value: stats?.enrollmentsCount || 0, icon: Target, color: "text-foreground", bg: "bg-muted" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(" ")[0] || dbUser?.name?.split(" ")[0] || "Student"}!</h1>
        <p className="text-muted-foreground mt-2">Ready to continue your learning journey?</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Continue Learning</h2>
          {stats?.latestEnrollment ? (
            <div className="glass p-8 rounded-2xl border border-border">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-full md:w-56 h-36 bg-primary/20 rounded-2xl flex-shrink-0 neon-glow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-red-400/40" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                      <ArrowRight className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold">{stats.latestEnrollment.course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Next up: {stats.latestEnrollment.course.lessons[0]?.title || "First Lesson"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Course Progress</span>
                      <span className="font-bold text-primary">{stats.latestEnrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.latestEnrollment.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-primary h-3 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/student/courses/${stats.latestEnrollment.courseId}`}
                    className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:neon-glow transition-all shadow-lg shadow-primary/20"
                  >
                    Resume Learning
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-12 rounded-2xl border border-border text-center space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Target size={40} />
              </div>
              <div className="max-w-xs mx-auto">
                <h3 className="text-lg font-bold">No active courses yet</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Explore our catalog and start your first AI-powered learning journey today!
                </p>
              </div>
              <Link href="/courses" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:neon-glow transition-all">
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">AI Intelligence</h2>
          <div className="glass p-6 rounded-2xl border border-border space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-bold flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <span>Smart Recommendations</span>
              </p>
              <p className="text-xs text-muted-foreground">Tailored to your recent learning patterns.</p>
            </div>
            
            <ul className="space-y-3">
              {[
                { title: "Neural Networks 101", tag: "Math" },
                { title: "Python for Data Science", tag: "Coding" },
              ].map((rec, i) => (
                <li key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                  <div>
                    <span className="text-sm font-bold block">{rec.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{rec.tag}</span>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </li>
              ))}
            </ul>

            <Link 
              href="/dashboard/student/study-plans"
              className="w-full py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center"
            >
              Generate AI Study Plan
            </Link>
          </div>

          <StreakHeatmap />
        </div>
      </div>
    </div>
  );
}
