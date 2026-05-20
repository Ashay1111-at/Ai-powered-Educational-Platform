"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Plus, ChevronRight, Save, BookOpen, Trash2, PlusCircle } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface CourseOutline {
  title: string;
  description: string;
  weeks: {
    weekNumber: number;
    title: string;
    lessons: string[];
  }[];
}

interface ManualLesson {
  title: string;
  content: string;
  generateAI: boolean;
}

interface ManualWeek {
  weekNumber: number;
  title: string;
  lessons: ManualLesson[];
}

export default function CreateCoursePage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const router = useRouter();
  const { dbUser } = useAuth();

  // AI Outline states
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Beginners");
  const [duration, setDuration] = useState(4);
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<CourseOutline | null>(null);

  // Manual Builder states
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualWeeks, setManualWeeks] = useState<ManualWeek[]>([
    {
      weekNumber: 1,
      title: "Introduction",
      lessons: [{ title: "Lesson 1: Core Concepts", content: "", generateAI: true }]
    }
  ]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/ai/course-outline", {
        topic,
        targetAudience: audience,
        durationWeeks: duration
      });
      setOutline(response.data);
    } catch (error: any) {
      console.error("Failed to generate outline", error);
      if (error?.response?.status === 429) {
        toast.error("AI is currently busy due to high demand. Please try again later.", { duration: 5000 });
      } else {
        toast.error("Failed to generate course outline. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!outline || !dbUser) return;
    setLoading(true);
    try {
      await api.post("/courses", {
        ...outline
      });
      toast.success("Course created successfully!");
      router.push("/dashboard/instructor/courses");
    } catch (error) {
      console.error("Failed to save course", error);
      toast.error("Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Manual Builder logic handlers
  const addWeek = () => {
    setManualWeeks([
      ...manualWeeks,
      {
        weekNumber: manualWeeks.length + 1,
        title: `Module ${manualWeeks.length + 1}`,
        lessons: [{ title: `Lesson 1: Introduction`, content: "", generateAI: true }]
      }
    ]);
  };

  const removeWeek = (index: number) => {
    const updated = manualWeeks.filter((_, i) => i !== index).map((w, idx) => ({
      ...w,
      weekNumber: idx + 1
    }));
    setManualWeeks(updated);
  };

  const updateWeekTitle = (weekIndex: number, title: string) => {
    const updated = [...manualWeeks];
    updated[weekIndex].title = title;
    setManualWeeks(updated);
  };

  const addLesson = (weekIndex: number) => {
    const updated = [...manualWeeks];
    updated[weekIndex].lessons.push({
      title: `Lesson ${updated[weekIndex].lessons.length + 1}`,
      content: "",
      generateAI: true
    });
    setManualWeeks(updated);
  };

  const removeLesson = (weekIndex: number, lessonIndex: number) => {
    const updated = [...manualWeeks];
    updated[weekIndex].lessons = updated[weekIndex].lessons.filter((_, i) => i !== lessonIndex);
    setManualWeeks(updated);
  };

  const updateLesson = (weekIndex: number, lessonIndex: number, field: keyof ManualLesson, value: any) => {
    const updated = [...manualWeeks];
    updated[weekIndex].lessons[lessonIndex] = {
      ...updated[weekIndex].lessons[lessonIndex],
      [field]: value
    };
    setManualWeeks(updated);
  };

  const handleSaveManual = async () => {
    if (!manualTitle.trim()) {
      toast.error("Please enter a course title.");
      return;
    }
    if (!manualDescription.trim()) {
      toast.error("Please enter a course description.");
      return;
    }
    // Validation
    for (const week of manualWeeks) {
      if (!week.title.trim()) {
        toast.error(`Please enter a title for Week/Module ${week.weekNumber}.`);
        return;
      }
      if (week.lessons.length === 0) {
        toast.error(`Week/Module ${week.weekNumber} must have at least one lesson.`);
        return;
      }
      for (let j = 0; j < week.lessons.length; j++) {
        const lesson = week.lessons[j];
        if (!lesson.title.trim()) {
          toast.error(`Please enter a title for Lesson ${j + 1} in Week ${week.weekNumber}.`);
          return;
        }
        if (!lesson.generateAI && !lesson.content.trim()) {
          toast.error(`Please enter content for Lesson "${lesson.title}" or enable AI generation.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      await api.post("/courses", {
        title: manualTitle,
        description: manualDescription,
        weeks: manualWeeks
      });
      toast.success("Manual course created successfully!");
      router.push("/dashboard/instructor/courses");
    } catch (error) {
      console.error("Failed to create manual course", error);
      toast.error("Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header and Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
          <p className="text-muted-foreground mt-2">
            Build your curriculum interactively using AI or design it manually line by line.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl self-start md:self-auto border border-border/10">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'ai'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles size={16} />
            <span>AI Outline Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'manual'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen size={16} />
            <span>Manual Builder</span>
          </button>
        </div>
      </div>

      {activeTab === 'ai' ? (
        // AI OUTLINE GENERATOR TAB
        <div className="space-y-8">
          {!outline ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl border border-border space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What is the course about?</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Quantum Computing for Dummies or Advanced React Patterns"
                    className="w-full bg-muted border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-muted border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option>Beginners</option>
                      <option>Intermediate</option>
                      <option>Advanced Professionals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full bg-muted border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:neon-glow transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                <span>{loading ? "Generating Your Curriculum..." : "Generate Course Outline"}</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-3xl border border-border">
                <h2 className="text-2xl font-bold mb-2">{outline.title}</h2>
                <p className="text-muted-foreground mb-8">{outline.description}</p>

                <div className="space-y-6">
                  {outline.weeks.map((week, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-6 py-2 relative">
                      <div className="absolute -left-[9px] top-4 w-4 h-4 bg-primary rounded-full" />
                      <h3 className="font-bold text-lg mb-4 text-primary">Week {week.weekNumber}: {week.title}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {week.lessons.map((lesson, j) => (
                          <div key={j} className="bg-muted/50 p-4 rounded-xl flex items-center justify-between group hover:bg-muted transition-colors">
                            <span className="font-medium text-sm">{lesson}</span>
                            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:neon-glow transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{loading ? "Creating Course & AI Lessons (This may take a minute)..." : "Save & Create Course"}</span>
                  </button>
                  <button
                    onClick={() => setOutline(null)}
                    disabled={loading}
                    className="px-8 bg-muted text-foreground py-4 rounded-xl font-bold hover:bg-muted/80 transition-all disabled:opacity-50"
                  >
                    Restart
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        // MANUAL COURSE BUILDER TAB
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* General Course Info */}
          <div className="glass p-8 rounded-3xl border border-border space-y-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <BookOpen className="text-primary" size={22} />
              <span>General Information</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g., Python Basics & OOP Foundations"
                  className="w-full bg-muted border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Provide a comprehensive summary of what students will achieve in this course."
                  rows={4}
                  className="w-full bg-muted border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Weeks / Modules Editor */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Curriculum Structure</h2>
              <button
                type="button"
                onClick={addWeek}
                className="flex items-center space-x-1.5 text-sm text-primary hover:underline font-semibold"
              >
                <Plus size={16} />
                <span>Add Module/Week</span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {manualWeeks.map((week, weekIdx) => (
                <motion.div
                  key={weekIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass p-6 rounded-2xl border border-border/80 space-y-4 relative"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center space-x-3">
                      <span className="font-bold text-primary text-sm uppercase tracking-wider">Week {week.weekNumber}</span>
                      <input
                        type="text"
                        value={week.title}
                        onChange={(e) => updateWeekTitle(weekIdx, e.target.value)}
                        placeholder={`Week ${week.weekNumber} Module Title`}
                        className="flex-1 bg-muted/70 border-none rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                      />
                    </div>
                    {manualWeeks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWeek(weekIdx)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-muted/70"
                        title="Remove week"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Lessons list */}
                  <div className="space-y-4 pl-4 border-l border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block">Lessons</span>
                    {week.lessons.map((lesson, lessonIdx) => (
                      <div key={lessonIdx} className="bg-muted/30 p-4 rounded-xl space-y-3 relative border border-border/20">
                        <div className="flex items-center justify-between gap-4">
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(weekIdx, lessonIdx, 'title', e.target.value)}
                            placeholder={`Lesson ${lessonIdx + 1} Title`}
                            className="flex-1 bg-muted/60 border-none rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary outline-none text-xs font-medium"
                          />
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 text-xs font-medium text-muted-foreground select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={lesson.generateAI}
                                onChange={(e) => updateLesson(weekIdx, lessonIdx, 'generateAI', e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 bg-muted border-none"
                              />
                              <span>Autogenerate with AI</span>
                            </label>
                            {week.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(weekIdx, lessonIdx)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-md hover:bg-muted"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Custom Lesson Content Editor */}
                        {!lesson.generateAI && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2"
                          >
                            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Lesson Material / Content (Markdown supported)
                            </label>
                            <textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(weekIdx, lessonIdx, 'content', e.target.value)}
                              placeholder="# Introduction to the module...&#10;&#10;Use markdown headers, lists, code snippets, etc."
                              rows={5}
                              className="w-full bg-muted/60 border-none rounded-lg py-3 px-3 focus:ring-1 focus:ring-primary outline-none text-xs font-mono resize-y"
                            />
                          </motion.div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(weekIdx)}
                      className="flex items-center space-x-1 text-xs text-primary/80 hover:text-primary font-semibold"
                    >
                      <PlusCircle size={14} />
                      <span>Add Lesson</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 mt-8">
            <button
              onClick={handleSaveManual}
              disabled={loading}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:neon-glow transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{loading ? "Saving Course..." : "Save & Create Course"}</span>
            </button>
            <button
              onClick={() => {
                setManualTitle("");
                setManualDescription("");
                setManualWeeks([
                  {
                    weekNumber: 1,
                    title: "Introduction",
                    lessons: [{ title: "Lesson 1: Core Concepts", content: "", generateAI: true }]
                  }
                ]);
              }}
              disabled={loading}
              className="px-8 bg-muted text-foreground py-4 rounded-xl font-bold hover:bg-muted/80 transition-all disabled:opacity-50"
            >
              Reset Form
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
