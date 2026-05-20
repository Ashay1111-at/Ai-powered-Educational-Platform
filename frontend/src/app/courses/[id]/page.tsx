"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Clock, Users, ChevronRight, Loader2, Target, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: { name: string };
  lessons: { id: string, title: string }[];
  _count?: { enrollments: number };
}

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrolledRes] = await Promise.all([
          api.get(`/courses/${id}`),
          user ? api.get("/courses/enrolled") : Promise.resolve({ data: [] })
        ]);
        
        setCourse(courseRes.data);
        if (user) {
          const alreadyEnrolled = enrolledRes.data.some((c: any) => c.id === id);
          setIsEnrolled(alreadyEnrolled);
        }
      } catch (err) {
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success("Successfully enrolled!");
      setIsEnrolled(true);
      router.push(`/dashboard/student/courses/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!course) return null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <span className="inline-block bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md mb-6">
                  Course Overview
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Clock, label: "Duration", value: "Self-paced" },
                  { icon: BookOpen, label: "Lessons", value: `${course.lessons.length} Modules` },
                  { icon: Users, label: "Students", value: course._count?.enrollments || 0 },
                  { icon: Star, label: "Rating", value: "4.9/5.0" }
                ].map((stat, i) => (
                  <div key={i} className="glass p-4 rounded-2xl border border-border">
                    <stat.icon className="text-primary mb-2" size={20} />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</p>
                    <p className="font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Target className="text-primary" />
                  What you&apos;ll learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Master core concepts with AI Tutoring",
                    "Real-world project implementations",
                    "AI-generated personalized quizzes",
                    "Structured lesson summaries"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Curriculum</h2>
                <div className="space-y-3">
                  {course.lessons.map((lesson, i) => (
                    <div key={lesson.id} className="glass p-5 rounded-xl border border-border flex justify-between items-center group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-primary bg-primary/10 w-8 h-8 flex items-center justify-center rounded-lg">
                          {i + 1}
                        </span>
                        <span className="font-bold group-hover:text-primary transition-colors">{lesson.title}</span>
                      </div>
                      <ShieldCheck size={18} className="text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Enrollment */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 glass p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -z-10 group-hover:bg-primary/20 transition-all" />
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">Free</span>
                      <span className="text-muted-foreground line-through text-lg">$99.00</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Limited time offer for AI Smart members.</p>
                  </div>

                  <button
                    onClick={isEnrolled ? () => router.push(`/dashboard/student/courses/${id}`) : handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:neon-glow transition-all disabled:opacity-50"
                  >
                    {enrolling ? (
                      <Loader2 className="animate-spin" />
                    ) : isEnrolled ? (
                      <>
                        <span>Go to Course</span>
                        <ChevronRight size={20} />
                      </>
                    ) : (
                      <>
                        <span>Enroll Now</span>
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Includes</p>
                    <div className="space-y-3">
                      {[
                        "Full lifetime access",
                        "Personal AI Tutor",
                        "Smart Study Plans",
                        "Certificate of Completion"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <CheckCircle2 className="text-primary" size={16} />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    By enrolling, you agree to AI SMART&apos;s terms of service and privacy policy.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
