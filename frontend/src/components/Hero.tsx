"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Zap, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-md mb-10 shadow-2xl shadow-primary/5"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            V2.0 is now live with Gemini 1.5 Pro
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8"
        >
          Master Any Skill <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400 animate-gradient">
            Accelerated by AI.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
        >
          Stop struggling with generic courses. Our platform builds a unique learning path 
          around your goals, solving doubts in real-time with an AI tutor that knows your progress.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          <Link
            href="/register"
            className="group w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <span>Start Learning</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            className="w-full sm:w-auto px-6 py-3 rounded-[2rem] bg-muted/50 border border-border/50 backdrop-blur-md font-black text-base flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-95"
          >
            <PlayCircle size={18} />
            <span>Watch Demo</span>
          </button>
        </motion.div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              icon: Brain, 
              title: "Adaptive Neural Path", 
              desc: "Algorithms that learn how you learn, restructuring curriculum on the fly for maximum retention.",
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            },
            { 
              icon: Zap, 
              title: "Zero-Latency Doubts", 
              desc: "No more waiting for office hours. Get precise, context-aware answers to your questions instantly.",
              color: "text-amber-500",
              bg: "bg-amber-500/10"
            },
            { 
              icon: Sparkles, 
              title: "AI Curriculum Gen", 
              desc: "Instructors use our AI to generate high-fidelity lessons, quizzes, and projects in seconds.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10"
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 backdrop-blur-sm text-left group hover:bg-muted/50 transition-colors"
            >
              <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
