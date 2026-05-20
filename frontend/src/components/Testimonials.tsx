"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science Student, Stanford",
    content: "The AI tutor is incredible. It explains concepts better than most textbooks and adapts to exactly where I'm struggling. My GPA went up a full point.",
    rating: 5,
  },
  {
    name: "Prof. James Mitchell",
    role: "Physics Instructor, MIT",
    content: "The course builder saved me weeks of preparation time. I generated a complete quantum mechanics curriculum in minutes and just refined it.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Medical Student, AIIMS",
    content: "The doubt solver is a game-changer. I photograph complex diagrams and get instant breakdowns. It's like having a study partner available 24/7.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Self-taught Developer",
    content: "I switched from traditional courses to this platform and learned React in half the time. The adaptive quizzes keep me challenged but never overwhelmed.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Loved by Learners & Educators
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of students and instructors who transformed their learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl border border-border hover:border-primary/20 transition-all relative"
            >
              <Quote className="absolute top-6 right-6 text-primary/10" size={48} />
              <div className="flex items-center space-x-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6 text-lg italic">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
