"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Activity, TrendingUp, Loader2, GraduationCap, Shield, BarChart3, ChevronRight, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeSessions: number;
}

interface Health {
  status: string;
  checks: {
    database: string;
    aiService: string;
    storage: string;
  };
  timestamp: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchStats = async () => {
    try {
      const [statsRes, healthRes, activitiesRes] = await Promise.all([
        api.get('/users/admin-stats'),
        api.get('/users/health'),
        api.get('/users/admin/activities'),
      ]);
      setStats(statsRes.data);
      setHealth(healthRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error("Failed to load platform data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-foreground", bg: "bg-muted" },
    { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: GraduationCap, color: "text-foreground", bg: "bg-muted" },
    { label: "Active Sessions", value: stats?.activeSessions ?? 0, icon: Activity, color: "text-foreground", bg: "bg-muted" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Shield className="text-primary" size={28} />
            <span>Admin Control Center</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Monitoring platform-wide performance and user growth.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Server Status</p>
          <p className={`${health?.status === 'healthy' ? 'text-green-500' : 'text-primary'} font-bold flex items-center justify-end space-x-1.5`}>
            <span className={`w-2 h-2 ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-primary'} rounded-full animate-pulse`} />
            <span>{health?.status === 'healthy' ? 'Operational' : 'Issue Detected'}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-2xl border border-border group hover:border-primary/50 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon size={22} />
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded text-[10px] font-bold text-primary flex items-center space-x-1">
                    <TrendingUp size={10} />
                    <span>+12%</span>
                  </div>
                </div>
                <p className="text-4xl font-black mb-1">{card.value.toLocaleString()}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Platform Status */}
            <div className="lg:col-span-2 glass rounded-2xl border border-border p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl flex items-center space-x-2">
                  <BarChart3 size={20} className="text-primary" />
                  <span>Platform Health</span>
                </h2>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-xs font-bold uppercase text-primary hover:underline flex items-center space-x-1 disabled:opacity-50"
                >
                  {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  <span>Refresh Logs</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Core API", status: health?.checks.database === 'connected' ? 'Operational' : 'Down', dot: health?.checks.database === 'connected' ? "bg-green-500" : "bg-primary" },
                  { label: "AI Engine", status: health?.checks.aiService === 'operational' ? 'Operational' : 'Degraded', dot: health?.checks.aiService === 'operational' ? "bg-green-500" : "bg-primary" },
                  { label: "DB Cluster", status: health?.checks.database === 'connected' ? 'Operational' : 'Down', dot: health?.checks.database === 'connected' ? "bg-green-500" : "bg-primary" },
                ].map((s) => (
                  <div key={s.label} className="p-5 bg-muted/30 rounded-2xl border border-border/50 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                    <div className={`flex items-center space-x-2 text-sm font-bold`}>
                      <span className={`w-2 h-2 ${s.dot} rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]`} />
                      <span>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Recent System Logs</h3>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {[
                    `Last successful health check: ${health ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}`,
                    `Platform status set to ${health?.status || 'unknown'}`,
                    "System monitor active and reporting.",
                  ].map((log, i) => (
                    <div key={i} className="flex items-center space-x-3 text-xs p-3 bg-muted/20 rounded-lg border border-border/30">
                      <span className="text-muted-foreground">{mounted ? `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}:${i}5` : "--:--"}</span>
                      <span className="font-medium">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <h2 className="font-bold text-xl">Quick Controls</h2>
              <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                      <div>
                        <p className="text-sm font-medium text-white">{activity.type}</p>
                        <p className="text-xs text-white/50">{activity.student?.name || "Unnamed Student"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">{formatTime(activity.createdAt)}</p>
                      <p className="text-[10px] text-primary font-bold">+{activity.points} pts</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-white/30">
                  <p>No recent activity found</p>
                </div>
              )}
            </div>
              <div className="glass p-6 rounded-2xl border border-border space-y-4">
                <Link href="/dashboard/admin/users" className="block w-full p-4 bg-muted hover:bg-muted/80 rounded-xl transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users size={18} className="text-primary" />
                      <span className="font-bold text-sm">Manage Users</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link href="/dashboard/admin/courses" className="block w-full p-4 bg-muted hover:bg-muted/80 rounded-xl transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen size={18} className="text-primary" />
                      <span className="font-bold text-sm">Audit Courses</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <button className="w-full p-4 bg-primary text-white rounded-xl font-bold text-sm hover:neon-glow transition-all shadow-lg shadow-primary/20">
                  Generate Platform Report
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
