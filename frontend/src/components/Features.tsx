"use client";

import { motion } from "framer-motion";
import { Brain, Zap, BookOpen, MessageSquare, Target, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutoring",
    description: "Get instant, personalized explanations from our AI that adapts to your learning style and pace.",
  },
  {
    icon: Zap,
    title: "Instant Doubt Solving",
    description: "Snap a photo of any problem — handwritten or printed — and get step-by-step solutions in seconds.",
  },
  {
    icon: BookOpen,
    title: "Auto Course Generation",
    description: "Instructors can generate entire course curricula with AI, complete with lesson plans and quizzes.",
  },
  {
    icon: MessageSquare,
    title: "Voice-Enabled Chat",
    description: "Talk to your AI tutor naturally with speech-to-text. Learn hands-free, like having a private teacher.",
  },
  {
    icon: Target,
    title: "Adaptive Learning Paths",
    description: "Our system tracks your progress and dynamically adjusts difficulty to keep you in the optimal learning zone.",
  },
  {
    icon: Shield,
    title: "Smart Assessment",
    description: "AI-generated quizzes with instant grading, detailed explanations, and performance analytics.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Everything You Need to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
              Learn Smarter
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with proven pedagogical methods
            to deliver a learning experience that&apos;s truly next-generation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative glass p-8 rounded-3xl border border-border hover:border-primary/30 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
