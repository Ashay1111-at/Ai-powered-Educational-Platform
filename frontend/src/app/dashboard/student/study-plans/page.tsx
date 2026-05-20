"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, BookOpen, ChevronRight, Calendar, Target, Plus, Layout, ArrowLeft, Download } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface StudyPlan {
  id: string;
  topic: string;
  content: {
    title: string;
    description: string;
    weeks: {
      weekNumber: number;
      title: string;
      lessons: string[];
    }[];
  };
  createdAt: string;
}

export default function StudyPlansPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPlans();
  }, [user]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await api.get("/ai/study-plans");
      setPlans(res.data);
    } catch (err) {
      toast.error("Failed to load study plans");
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = () => {
    if (!selectedPlan) return;
    const element = document.createElement("a");
    const content = `STUDY PLAN: ${selectedPlan.content.title}\n` +
      `Description: ${selectedPlan.content.description}\n\n` +
      selectedPlan.content.weeks.map(w => 
        `Week ${w.weekNumber}: ${w.title}\n` + 
        w.lessons.map(l => `- ${l}`).join('\n')
      ).join('\n\n');
    
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `study_plan_${selectedPlan.topic.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const response = await api.post("/ai/generate-study-plan", { topic });
      setPlans([response.data, ...plans]);
      setSelectedPlan(response.data);
      setTopic("");
      toast.success("AI Study Plan generated and saved!");
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("AI is currently busy due to high demand. Please try again later.");
      } else {
        toast.error("Failed to generate study plan");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 bg-muted/60 rounded-md w-48 mb-3"></div>
            <div className="h-4 bg-muted/60 rounded-md w-96"></div>
          </div>
        </div>
        <div className="h-40 bg-muted/30 rounded-3xl w-full border border-border"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-muted/30 rounded-2xl w-full border border-border"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Study Plans</h1>
          <p className="text-muted-foreground mt-2">Personalized roadmaps to help you master any subject at your own pace.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedPlan && (
            <button 
              onClick={downloadPlan}
              className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          )}
          {selectedPlan && (
            <button 
              onClick={() => setSelectedPlan(null)}
              className="flex items-center space-x-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span>All Plans</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedPlan ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Generator Card */}
            <div className="glass p-8 rounded-3xl border border-border bg-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-all" />
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Sparkles size={20} className="text-primary" />
                  <span>Create New Roadmap</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What do you want to learn? (e.g. Machine Learning, Ancient History)"
                    className="flex-1 bg-background/50 border border-border rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !topic.trim()}
                    className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:neon-glow transition-all disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                    <span>{generating ? "Crafting..." : "Generate Plan"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generating && (
                <div className="glass p-6 rounded-2xl border border-primary/30 animate-pulse space-y-4 shadow-lg shadow-primary/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl" />
                    <div className="w-16 h-6 bg-muted/60 rounded" />
                  </div>
                  <div className="h-6 bg-muted/60 rounded-md w-3/4 mb-2" />
                  <div className="h-4 bg-muted/60 rounded-md w-full" />
                  <div className="h-4 bg-muted/60 rounded-md w-5/6" />
                  <div className="mt-6 flex justify-between items-center">
                    <div className="h-3 bg-muted/60 rounded-md w-24" />
                    <div className="h-3 bg-muted/60 rounded-md w-24" />
                  </div>
                </div>
              )}
              {plans.length === 0 && !generating ? (
                <div className="md:col-span-2 text-center py-20 opacity-50">
                  <Layout size={48} className="mx-auto mb-4" />
                  <p>Your generated study plans will appear here.</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    layoutId={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className="glass p-6 rounded-2xl border border-border hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <BookOpen size={24} />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">
                        {plan.content.weeks.length} Weeks
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{plan.topic}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.content.description}</p>
                    <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-primary font-bold">
                        <span>View Roadmap</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-3xl border border-border">
              <div className="mb-10">
                <div className="flex items-center space-x-3 text-primary mb-4">
                  <Target size={24} />
                  <span className="text-sm font-black uppercase tracking-widest">Mastery Roadmap</span>
                </div>
                <h2 className="text-3xl font-black mb-4">{selectedPlan.content.title}</h2>
                <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                  {selectedPlan.content.description}
                </p>
              </div>

              <div className="space-y-12">
                {selectedPlan.content.weeks.map((week, i) => (
                  <div key={i} className="relative pl-10">
                    {/* Vertical Line */}
                    {i < selectedPlan.content.weeks.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                    )}
                    
                    {/* Dot */}
                    <div className="absolute left-0 top-1 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/40 text-primary font-bold text-sm">
                      {week.weekNumber}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-foreground flex items-center space-x-3">
                        <span>Week {week.weekNumber}: {week.title}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {week.lessons.map((lesson, j) => (
                          <div key={j} className="bg-muted/30 p-4 rounded-xl border border-border/50 flex items-center space-x-3 group hover:bg-muted/50 transition-colors">
                            <div className="w-2 h-2 bg-primary/40 rounded-full group-hover:bg-primary transition-colors" />
                            <span className="text-sm font-medium">{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Generated by AI on {new Date(selectedPlan.createdAt).toLocaleDateString()}
                </p>
                <button 
                  onClick={downloadPlan}
                  className="bg-muted text-foreground px-6 py-2 rounded-xl font-bold text-sm hover:bg-muted/80 transition-all flex items-center gap-2"
                >
                  <Download size={16} />
                  Export Roadmap
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
