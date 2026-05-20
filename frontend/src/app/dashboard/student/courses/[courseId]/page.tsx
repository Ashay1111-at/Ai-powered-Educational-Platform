"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, CheckCircle2, Loader2, ArrowLeft, Users, Lock } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
}
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: { name: string };
  lessons: Lesson[];
  enrollments: { id: string }[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data);
        // Check enrollment status from lessons count or a dedicated endpoint
        setEnrolled(res.data.enrollments?.length > 0);
        if (res.data.lessons?.length > 0) setSelectedLesson(res.data.lessons[0]);
      } catch {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolled(true);
      toast.success("Enrolled successfully! Happy learning 🎉");
    } catch {
      toast.error("Failed to enroll. You may already be enrolled.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }
  if (!course) return <div className="text-center py-20">Course not found.</div>;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/dashboard/student/courses" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors text-sm">
        <ArrowLeft size={16} />
        <span>Back to My Courses</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLesson ? (
            <motion.div
              key={selectedLesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="glass rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold mb-4">{selectedLesson.title}</h2>
                {enrolled ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedLesson.content || "Lesson content coming soon."}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Lock size={28} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">Enroll to Access Lessons</h3>
                    <p className="text-muted-foreground">Enroll in this course to start reading the lesson content.</p>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {enrolling && <Loader2 size={18} className="animate-spin" />}
                      <span>{enrolling ? "Enrolling..." : "Enroll Now — Free"}</span>
                    </button>
                  </div>
                )}
              </div>

              {enrolled && (
                <div className="flex justify-between">
                  <button
                    disabled={selectedLesson.order === 0}
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === selectedLesson.id);
                      if (idx > 0) setSelectedLesson(course.lessons[idx - 1]);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-muted font-medium disabled:opacity-30 hover:bg-muted/80 transition-colors text-sm"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === selectedLesson.id);
                      if (idx < course.lessons.length - 1) setSelectedLesson(course.lessons[idx + 1]);
                    }}
                    disabled={course.lessons.indexOf(selectedLesson) === course.lessons.length - 1}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-30 hover:bg-primary/90 transition-colors text-sm flex items-center space-x-2"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl border border-border p-16 text-center">
              <p className="text-muted-foreground">No lessons available yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Course Info + Lesson List */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h1 className="text-xl font-bold mb-1">{course.title}</h1>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <BookOpen size={14} />
                <span>{course.lessons?.length || 0} lessons</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{course.enrollments?.length || 0} enrolled</span>
              </span>
            </div>
            {!enrolled && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {enrolling && <Loader2 size={18} className="animate-spin" />}
                <span>{enrolling ? "Enrolling..." : "Enroll for Free"}</span>
              </button>
            )}
            {enrolled && (
              <div className="flex items-center space-x-2 text-green-500 text-sm font-medium">
                <CheckCircle2 size={16} />
                <span>You are enrolled</span>
              </div>
            )}
          </div>

          {/* Lesson List */}
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold">Lessons</h3>
            </div>
            <ul className="divide-y divide-border">
              {course.lessons?.sort((a, b) => a.order - b.order).map((lesson, i) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => enrolled && setSelectedLesson(lesson)}
                    className={`w-full flex items-center space-x-3 p-4 hover:bg-muted/50 transition-colors text-left ${selectedLesson?.id === lesson.id ? "bg-primary/10" : ""} ${!enrolled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedLesson?.id === lesson.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium line-clamp-1">{lesson.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
