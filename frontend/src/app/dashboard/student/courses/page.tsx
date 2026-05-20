"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ChevronRight, Loader2, Search, BookMarked } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: { name: string };
  lessons: { id: string }[];
  enrollments: { id: string }[];
  image?: string;
  progressPercent?: number;
}

export default function MyCoursesPage() {
  const { user, dbUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!dbUser) return;
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses/enrolled");
        setCourses(response.data);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [dbUser]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Continue where you left off.</p>
        </div>
        <Link
          href="/courses"
          className="bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-medium hover:bg-primary hover:text-white transition-all flex items-center space-x-2"
        >
          <BookMarked size={18} />
          <span>Browse Catalog</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search your courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-muted border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-3xl border border-border p-16 text-center"
        >
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={36} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t enrolled in any courses. Explore the catalog to get started.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <span>Browse Courses</span>
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group glass rounded-2xl border border-border hover:border-primary/30 overflow-hidden transition-all"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-primary/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-red-400/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={40} className="text-white/50" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users size={12} />
                    <span>{course.enrollments?.length || 0} students</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-medium">{course.progressPercent ?? 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${course.progressPercent ?? 0}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/dashboard/student/courses/${course.id}`}
                  className="block w-full text-center bg-primary/10 text-primary py-2.5 rounded-xl font-medium hover:bg-primary hover:text-white transition-all text-sm"
                >
                  Continue Learning
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
