"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Copy, Check, Sparkles, Download, Save, History, Trash2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SavedNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotesGeneratorPage() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"generator" | "history">("generator");
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (view === "history") {
      fetchNotes();
    }
  }, [view]);

  async function fetchNotes() {
    setFetching(true);
    try {
      const res = await api.get("/ai/notes");
      setSavedNotes(res.data);
    } catch (err) {
      toast.error("Failed to load saved notes");
    } finally {
      setFetching(false);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/ai/summarize", { 
        text, 
        title: title.trim() || null 
      });
      setSummary(response.data.summary);
      if (title.trim()) {
        toast.success("Notes generated and saved to history!");
        setTitle("");
      } else {
        toast.success("Notes generated!");
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("AI is currently busy due to high demand. Please try again later.");
      } else {
        toast.error(error.response?.data?.error || "Failed to generate notes");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/ai/notes/${id}`);
      setSavedNotes(savedNotes.filter(n => n.id !== id));
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadNotes = (content: string, name: string = "ai_smart_notes") => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${name.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Smart Notes</h1>
          <p className="text-muted-foreground mt-2">Transform long content into structured, high-retention notes.</p>
        </div>
        <button
          onClick={() => setView(view === "generator" ? "history" : "generator")}
          className="flex items-center space-x-2 bg-muted hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          {view === "generator" ? (
            <>
              <History size={18} />
              <span>Saved Notes</span>
            </>
          ) : (
            <>
              <ArrowLeft size={18} />
              <span>Back to Generator</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "generator" ? (
          <motion.div
            key="gen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Area */}
            <div className="glass p-8 rounded-[2.5rem] border border-border flex flex-col space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-primary">
                  <FileText size={16} />
                  <span>Input Source</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title (Optional - saves to history)"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-bold"
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your content here (Transcripts, articles, long text)..."
                  className="w-full min-h-[350px] bg-background/50 border border-border rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none resize-none text-sm leading-relaxed"
                />
              </div>

              <button
                onClick={handleSummarize}
                disabled={loading || !text.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-3 hover:neon-glow transition-all disabled:opacity-50 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                <span>{loading ? "Generating..." : "Generate Smart Notes"}</span>
              </button>
            </div>

            {/* Output Area */}
            <div className="glass p-8 rounded-[2.5rem] border border-border flex flex-col space-y-6 bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-emerald-500">
                  <Sparkles size={16} />
                  <span>AI Distillation</span>
                </div>
                {summary && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(summary)}
                      className="p-2.5 bg-background border border-border hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-primary"
                      title="Copy"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button
                      onClick={() => downloadNotes(summary)}
                      className="p-2.5 bg-background border border-border hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-primary"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-background/40 border border-border/50 rounded-2xl p-6 overflow-y-auto min-h-[400px]">
                {!summary && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <FileText size={64} />
                    <p className="font-bold">Your smart notes will appear here.</p>
                  </div>
                )}
                
                {loading && (
                  <div className="space-y-4 w-full h-full p-4">
                    <div className="flex items-center space-x-3 mb-8">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <p className="text-sm font-black uppercase tracking-tighter text-primary animate-pulse">Analyzing & Distilling Content...</p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted/60 rounded-md w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-muted/60 rounded-md w-full animate-pulse"></div>
                      <div className="h-4 bg-muted/60 rounded-md w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-muted/60 rounded-md w-full animate-pulse"></div>
                      <div className="h-4 bg-muted/60 rounded-md w-2/3 animate-pulse"></div>
                      <div className="h-4 bg-muted/60 rounded-md w-4/5 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {summary && (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium">
                      {summary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {fetching ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : savedNotes.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl border border-border opacity-50">
                <History size={48} className="mx-auto mb-4" />
                <p className="font-bold">No saved notes found.</p>
                <p className="text-sm">Give your notes a title to save them to your history.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedNotes.map((note) => (
                  <div key={note.id} className="glass p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <FileText size={24} />
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => copyToClipboard(note.content)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => downloadNotes(note.content, note.title)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(note.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{note.content}</p>
                    <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">
                      {new Date(note.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
