"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  X, 
  HelpCircle, 
  Brain, 
  Sparkles, 
  History as HistoryIcon,
  MessageSquare,
  ChevronRight,
  Clock,
  Layout
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface DoubtRecord {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export default function DoubtSolverPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [history, setHistory] = useState<DoubtRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/ai/doubts");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnswer(null); // Reset answer when new image picked
    }
  };

  const handleSolve = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }
    setLoading(true);
    setAnswer(null);

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("question", question);

    try {
      const response = await api.post("/ai/analyze-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAnswer(response.data.answer);
      fetchHistory(); // Refresh history
      toast.success("Solution generated!");
    } catch (error) {
      console.error("Failed to solve doubt", error);
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnswer(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Brain className="text-primary" size={40} />
            AI Doubt Solver
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Instant visual explanations for any problem or handwriting.</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
            showHistory 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-muted/50 border-border/50 hover:bg-muted"
          }`}
        >
          <HistoryIcon size={20} />
          <span>{showHistory ? "Back to Solver" : "Doubt History"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showHistory ? (
          <motion.div
            key="solver"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Left Side: Upload & Input */}
            <div className="space-y-6">
              <div className="relative group">
                <motion.div
                  className={`relative glass border-2 border-dashed rounded-[2.5rem] transition-all overflow-hidden ${
                    previewUrl ? "border-primary/50" : "border-border hover:border-primary/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {previewUrl ? (
                    <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-black/20">
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                      
                      {/* Scanning Animation */}
                      {loading && (
                        <motion.div 
                          initial={{ top: 0 }}
                          animate={{ top: "100%" }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)] z-20"
                        />
                      )}

                      <button
                        onClick={clearImage}
                        className="absolute top-6 right-6 p-2.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-md z-30"
                      >
                        <X size={20} />
                      </button>
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-xl hover:scale-105 transition-transform"
                        >
                          <ImageIcon size={20} />
                          <span>Change Image</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[4/3] flex flex-col items-center justify-center space-y-6 p-10 group"
                    >
                      <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <Upload size={40} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-2xl mb-2">Drop your problem here</p>
                        <p className="text-muted-foreground">Or click to browse from device</p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                          <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black tracking-widest uppercase">JPG</span>
                          <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black tracking-widest uppercase">PNG</span>
                          <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black tracking-widest uppercase">WEBP</span>
                        </div>
                      </div>
                    </button>
                  )}
                </motion.div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-border space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm font-bold text-primary uppercase tracking-widest">
                    <HelpCircle size={18} />
                    <span>Contextual Help (Optional)</span>
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. 'Solve this step by step' or 'Explain the third line'"
                    className="w-full bg-background/50 border border-border/50 rounded-[1.5rem] py-5 px-6 focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-none text-base transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <button
                  onClick={handleSolve}
                  disabled={loading || !selectedImage}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:neon-glow transition-all disabled:opacity-50 active:scale-[0.98] shadow-xl shadow-primary/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <Sparkles size={24} />
                  )}
                  <span>{loading ? "Analyzing Context..." : "Solve Instantly"}</span>
                </button>
              </div>
            </div>

            {/* Right Side: AI Answer */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-2xl font-black">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Sparkles size={24} />
                  </div>
                  <h2>Intelligence Report</h2>
                </div>
              </div>

              <div className="glass p-1 rounded-[2.5rem] border border-border min-h-[500px] flex flex-col relative overflow-hidden bg-muted/20">
                <AnimatePresence mode="wait">
                  {!answer && !loading ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6"
                    >
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center border border-border/50 shadow-inner">
                        <ImageIcon size={40} className="text-muted-foreground/30" />
                      </div>
                      <div className="max-w-xs">
                        <p className="font-bold text-xl mb-2 text-foreground/70">Awaiting Input</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Once you upload an image, our Vision AI will provide a detailed breakdown here.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 text-[10px] font-bold text-muted-foreground">MATH SOLVING</div>
                        <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 text-[10px] font-bold text-muted-foreground">CODE EXPLAINER</div>
                        <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 text-[10px] font-bold text-muted-foreground">HANDWRITTEN TEXT</div>
                        <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 text-[10px] font-bold text-muted-foreground">DIAGRAM ANALYSIS</div>
                      </div>
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center space-y-8 p-12"
                    >
                      <div className="relative">
                        <Loader2 className="animate-spin text-primary" size={64} />
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-black tracking-tight animate-pulse">Vision AI Active</p>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
                          Processing visual layers, performing OCR, and synthesizing solution patterns...
                        </p>
                      </div>
                      
                      {/* Loading Progress Simulation */}
                      <div className="w-full max-w-xs bg-muted/50 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 15 }}
                          className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="answer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 flex flex-col h-full overflow-hidden"
                    >
                      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                        <div className="prose prose-invert max-w-none">
                          <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg font-medium selection:bg-primary/30">
                            {answer}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-background/30 backdrop-blur-md border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                          <Clock size={14} />
                          <span>Generated Just Now</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(answer || "");
                            toast.success("Copied to clipboard!");
                          }}
                          className="text-primary font-black text-sm hover:underline flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Copy Solution
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {history.length === 0 ? (
              <div className="glass rounded-[3rem] p-20 text-center flex flex-col items-center justify-center space-y-6 border border-border/50">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <HistoryIcon size={40} className="text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">No History Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">Your visual queries and AI solutions will be archived here for your reference.</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold"
                >
                  Solve your first doubt
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((record) => (
                  <motion.div
                    key={record.id}
                    className="glass group p-6 rounded-[2rem] border border-border/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full bg-muted/10"
                    onClick={() => {
                      setAnswer(record.answer);
                      setQuestion(record.question);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <MessageSquare size={20} />
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors italic">
                      "{record.question || "Visual Query"}"
                    </h3>
                    <p className="text-sm text-muted-foreground/80 line-clamp-4 flex-1">
                      {record.answer}
                    </p>
                    <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                      <span className="text-xs font-bold text-primary flex items-center gap-2">
                        View Solution
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
