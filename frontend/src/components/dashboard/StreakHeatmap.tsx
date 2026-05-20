"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ActivityDay {
  date: string;
  count: number;
}

export default function StreakHeatmap() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    if (!user) return;
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const activityData: ActivityDay[] = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (34 - i));
    const dateStr = d.toISOString().split("T")[0];
    
    // Find activity count for this date
    const count = stats?.activities?.filter((a: any) => 
      a.createdAt.split("T")[0] === dateStr
    )?.length || 0;

    return {
      date: dateStr,
      count,
    };
  });

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/50";
    if (count === 1) return "bg-primary/20";
    if (count === 2) return "bg-primary/40";
    if (count === 3) return "bg-primary/60";
    return "bg-primary neon-glow-sm";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <Flame className="text-orange-500" />
          <span>Learning Activity</span>
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Trophy className="text-yellow-500" size={16} />
            <span className="text-sm font-medium">{stats?.streak || 0} Day Streak</span>
          </div>
          <span className="text-sm text-muted-foreground">Level {stats?.level || 1}</span>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-border min-h-[140px] flex flex-col justify-center">
        {!mounted || loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {activityData.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`w-4 h-4 rounded-sm ${getIntensity(day.count)}`}
                  title={`${day.date}: ${day.count} activities`}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-sm bg-muted/50" />
                <div className="w-2 h-2 rounded-sm bg-primary/20" />
                <div className="w-2 h-2 rounded-sm bg-primary/40" />
                <div className="w-2 h-2 rounded-sm bg-primary/60" />
                <div className="w-2 h-2 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
