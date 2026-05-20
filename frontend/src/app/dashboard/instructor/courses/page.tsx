"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Plus, Loader2, Search, Eye, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Course {
  id: string;
  title: string;
  description: string;
  published: boolean;
  lessons: { id: string }[];
  enrollments: { id: string }[];
  createdAt: string;
}

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/instructor");
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? All data including student enrollments will be lost.")) return;
    
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully");
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const res = await api.patch(`/courses/${course.id}`, {
        published: !course.published
      });
      setCourses(courses.map(c => c.id === course.id ? res.data : c));
      toast.success(res.data.published ? "Course published" : "Course unpublished");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Manage and track all your courses.</p>
        </div>
        <Link
          href="/dashboard/instructor/courses/new"
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Course</span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Courses", value: courses.length, icon: BookOpen },
          { label: "Total Students", value: courses.reduce((s, c) => s + (c.enrollments?.length || 0), 0), icon: Users },
          { label: "Total Lessons", value: courses.reduce((s, c) => s + (c.lessons?.length || 0), 0), icon: BookOpen },
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
          placeholder="Search your courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-muted border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
          </div>
          <div className="h-12 w-full bg-muted rounded-xl" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      ) : (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <BookOpen size={40} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">Create your first AI-generated course.</p>
              <Link href="/dashboard/instructor/courses/new" className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors inline-flex items-center space-x-2">
                <Plus size={18} />
                <span>Create Course</span>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Lessons</th>
                  <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Students</th>
                  <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((course, i) => (
                  <motion.tr
                    key={course.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium line-clamp-1">{course.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="text-sm">{course.lessons?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="text-sm">{course.enrollments?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleTogglePublish(course)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${course.published ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/dashboard/instructor/courses/${course.id}`} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary" title="View/Edit Lessons">
                          <Eye size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                          title="Delete Course"
                        >
                          <Plus size={16} className="rotate-45" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
