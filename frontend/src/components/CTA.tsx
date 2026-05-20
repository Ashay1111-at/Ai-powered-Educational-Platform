"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass border border-primary/20 rounded-3xl p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 text-primary/10">
            <Sparkles size={80} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            <span>Start Free — No Credit Card Required</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Transform <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
              Your Learning?
            </span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Join over 10,000 students and educators already using AI Smart Learning.
            Start your personalized journey today — completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all active:scale-95 shadow-2xl shadow-primary/30"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto glass px-8 py-3 rounded-2xl font-bold text-base hover:bg-white/10 transition-all border border-border"
            >
              See All Features
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
