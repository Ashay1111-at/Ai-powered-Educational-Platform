"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Play, Sparkles, Brain, Zap, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20"
            >
              <Play size={14} fill="currentColor" className="ml-1" />
              <span className="text-xs font-bold uppercase tracking-widest">Product Walkthrough</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">Next Frontier</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Witness how our AI-native ecosystem personalizes your learning journey in real-time.
            </p>
          </div>

          {/* Video Placeholder / Demo UI */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-5xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative glass rounded-[2rem] border border-white/10 aspect-video flex flex-col items-center justify-center overflow-hidden bg-black/20">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              
              {/* Fake UI Overlay */}
              <div className="absolute top-6 left-6 flex items-center space-x-2 z-20">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>

              <div className="relative z-20 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center neon-glow cursor-pointer shadow-2xl shadow-primary/40 group/play"
                >
                  <Play size={32} fill="currentColor" className="ml-1 transition-transform group-hover/play:scale-110" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Watch the Feature Reel</h3>
                  <p className="text-muted-foreground max-w-md">Adaptive quizzes, AI doubt solving, and personalized study roadmaps.</p>
                </div>
              </div>
              
              {/* Decorative background visual elements */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="grid grid-cols-12 gap-4 h-full p-4">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="h-full border-r border-white/10" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Highlight Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Brain, 
                title: "Cognitive Adapting", 
                desc: "Our engine analyzes your response patterns to calibrate lesson difficulty, ensuring you stay in the 'Goldilocks Zone' of learning.",
                color: "text-blue-400"
              },
              { 
                icon: Sparkles, 
                title: "Generative Content", 
                desc: "Instantly transform any lesson into structured notes, audio summaries, or flashcards using our custom-tuned LLMs.",
                color: "text-primary"
              },
              { 
                icon: Zap, 
                title: "Vision Doubt Solver", 
                desc: "Snap a photo of your textbook. Our AI identifies the context, explains the underlying concepts, and guides you to the solution.",
                color: "text-red-400"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-10 rounded-3xl border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-muted/30 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 p-12 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 text-center relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
             
            <h2 className="text-4xl font-bold mb-6">Ready to upgrade your intellect?</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Join 50,000+ students already using AI Smart to master complex subjects 3x faster than traditional methods.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:neon-glow transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                Get Started for Free
              </Link>
              <Link
                href="/courses"
                className="glass px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
