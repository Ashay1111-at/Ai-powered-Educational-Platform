"use client";

import { motion } from "framer-motion";
import { Users, Search, GraduationCap, BookOpen, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  joined: string;
  courses: number;
  progress: number;
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/users/instructor-students");
        setStudents(res.data);
      } catch (err) {
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-2">Monitor your students&apos; progress and engagement.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: students.length, icon: Users },
          { label: "Avg. Progress", value: `${students.length > 0 ? Math.round(students.reduce((s, st) => s + st.progress, 0) / students.length) : 0}%`, icon: TrendingUp },
          { label: "Courses Taught", value: students.length > 0 ? Array.from(new Set(students.map(s => s.id))).length : 0, icon: BookOpen },
        ].map((stat) => (
          <div key={stat.label} className="glass p-5 rounded-2xl border border-border flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-muted border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No students found matching your criteria.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Total Courses</th>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress</th>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {student.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <div className="flex items-center space-x-1 text-sm">
                      <GraduationCap size={14} className="text-muted-foreground" />
                      <span>{student.courses}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Overall</span>
                        <span className={`font-medium ${student.progress >= 70 ? "text-green-500" : student.progress >= 40 ? "text-yellow-500" : "text-red-500"}`}>
                          {student.progress}%
                        </span>
                      </div>
                      <div className="w-32 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{new Date(student.joined).toLocaleDateString()}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
