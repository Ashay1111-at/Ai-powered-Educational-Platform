"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Clock, Users, Search, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: { name: string };
  lessons: { id: string }[];
  _count?: { enrollments: number };
  level?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-4">Course Catalog</span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground">
              Learn Anything, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">Master Everything</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Browse our AI-curated course library. Every course includes quizzes, smart notes, and personal AI tutoring.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search courses, topics, instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-muted border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary outline-none text-lg text-foreground"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-border">
              <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-xl font-bold">No courses found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((course, i) => (
                <div key={course.id} className="group glass rounded-2xl border border-border hover:border-primary/30 overflow-hidden transition-all">
                  <div className="relative h-44 bg-primary/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-red-400/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={44} className="text-white/40" />
                    </div>
                    <span className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {course.level || "Beginner"}
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">by {course.instructor?.name || "AI Tutor"}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1"><Clock size={12} /><span>{course.lessons?.length || 0} lessons</span></span>
                      <span className="flex items-center space-x-1"><Users size={12} /><span>{(course._count?.enrollments || 0).toLocaleString()} students</span></span>
                    </div>
                    <Link href={`/courses/${course.id}`} className="flex items-center justify-between text-sm bg-primary/10 text-primary px-4 py-2.5 rounded-xl font-medium hover:bg-primary hover:text-white transition-all group/btn">
                      <span>Learn More</span>
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
