"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Edit2, 
  Trash2, 
  Plus, 
  BookOpen, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

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
  published: boolean;
  lessons: Lesson[];
}

export default function CourseManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, dbUser, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editing Course Info
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");

  // Editing Lesson
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  useEffect(() => {
    if (authLoading || !dbUser) return;
    fetchCourse();
  }, [id, dbUser, authLoading]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setEditedTitle(res.data.title);
      setEditedDesc(res.data.description);
    } catch (error) {
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourseInfo = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/courses/${id}`, {
        title: editedTitle,
        description: editedDesc
      });
      setCourse({ ...course!, ...res.data });
      setIsEditingInfo(false);
      toast.success("Course information updated");
    } catch (error) {
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);
  };

  const handleUpdateLesson = async () => {
    if (!editingLessonId) return;
    setSaving(true);
    try {
      await api.patch(`/courses/lessons/${editingLessonId}`, {
        title: lessonTitle,
        content: lessonContent
      });
      toast.success("Lesson updated");
      setEditingLessonId(null);
      fetchCourse();
    } catch (error) {
      toast.error("Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    setSaving(true);
    try {
      await api.post(`/courses/${id}/lessons`, {
        title: "New Lesson",
        content: "Lesson content goes here...",
        order: course?.lessons.length || 0
      });
      toast.success("New lesson added");
      fetchCourse();
    } catch (error) {
      toast.error("Failed to add lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      toast.success("Lesson deleted");
      fetchCourse();
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-muted-foreground animate-pulse">Loading course data...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Course not found</h2>
        <Link href="/dashboard/instructor/courses" className="text-primary hover:underline mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${course.published ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
            {course.published ? "Live" : "Draft"}
          </span>
        </div>
      </div>

      {/* Course Info Card */}
      <div className="glass rounded-3xl border border-border overflow-hidden p-8">
        {isEditingInfo ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Course Title</label>
              <input 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-xl font-bold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea 
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => setIsEditingInfo(false)}
                className="px-6 py-2 rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateCourseInfo}
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-4">{course.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                {course.description}
              </p>
            </div>
            <button 
              onClick={() => setIsEditingInfo(true)}
              className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground hover:text-primary"
            >
              <Edit2 size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Lessons Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <BookOpen size={20} />
            </div>
            <h2 className="text-2xl font-bold">Curriculum</h2>
          </div>
          <button 
            onClick={handleAddLesson}
            disabled={saving}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:neon-glow transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>Add Lesson</span>
          </button>
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {course.lessons.sort((a, b) => a.order - b.order).map((lesson, idx) => (
              <motion.div 
                key={lesson.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-2xl border border-border overflow-hidden"
              >
                {editingLessonId === lesson.id ? (
                  <div className="p-6 space-y-4 bg-muted/20">
                    <input 
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary font-bold"
                    />
                    <textarea 
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      rows={12}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => setEditingLessonId(null)}
                        className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateLesson}
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>Update Lesson</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{lesson.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lesson.content.length > 100 ? `${lesson.content.substring(0, 100)}...` : lesson.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditLesson(lesson)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
