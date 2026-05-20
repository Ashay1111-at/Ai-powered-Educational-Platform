"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap, Brain, Users, ChevronDown } from "lucide-react";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";

const faqs = [
  {
    question: "How does the 7-day free trial work?",
    answer: "When you start your Pro or Instructor trial, you get full access to all features for 7 days. You can cancel anytime before the trial ends and you won't be charged."
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your account settings. If you upgrade, we'll prorate the difference."
  },
  {
    question: "Do you offer discounts for students?",
    answer: "Yes, we offer a 50% discount for students with a valid .edu email address. Contact our support team after creating your free account to apply the discount."
  },
  {
    question: "What happens if I exceed my AI usage limits on the Free plan?",
    answer: "If you hit your daily limit on the Free plan, you'll need to wait until the next day to use AI features again, or upgrade to Pro for unlimited access."
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Everything you need to start learning.",
      icon: Zap,
      features: [
        "Access to all free courses",
        "AI Tutor (20 messages/day)",
        "Quiz Generator (5 quizzes/day)",
        "Smart Notes (3 summaries/day)",
        "Doubt Solver (2 images/day)",
        "Streak tracking & activity heatmap",
      ],
      cta: "Get Started Free",
      href: "/login",
      highlighted: false,
    },
    {
      name: "Pro",
      price: isYearly ? "$9" : "$12",
      period: "per month",
      description: "Unlimited AI for serious learners.",
      icon: Brain,
      features: [
        "Everything in Free",
        "Unlimited AI Tutor messages",
        "Unlimited Quiz Generation",
        "Unlimited Smart Notes",
        "Unlimited Doubt Solving",
        "Priority AI response speed",
        "Advanced analytics & insights",
        "Downloadable certificates",
      ],
      cta: "Start Pro — 7 Days Free",
      href: "/login",
      highlighted: true,
    },
    {
      name: "Instructor",
      price: isYearly ? "$22" : "$29",
      period: "per month",
      description: "Build and monetize your courses with AI.",
      icon: Users,
      features: [
        "Everything in Pro",
        "AI Course Builder (unlimited)",
        "Student analytics dashboard",
        "Auto-grading for assignments",
        "Custom branding",
        "Revenue sharing program",
        "Dedicated support",
      ],
      cta: "Start Teaching",
      href: "/login",
      highlighted: false,
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-4">Pricing</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
              Start free and upgrade when you&apos;re ready. No hidden fees, no credit card required to begin.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-bold transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-16 h-8 bg-muted rounded-full p-1 transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <motion.div 
                  className="w-6 h-6 bg-primary rounded-full shadow-md"
                  animate={{ x: isYearly ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
                Yearly <span className="bg-primary/10 text-primary text-[10px] uppercase px-2 py-0.5 rounded-full">Save up to 25%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <motion.div
                layout
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground border-2 border-primary shadow-2xl shadow-primary/30 md:scale-105"
                    : "glass border border-border"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background text-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-border">
                    MOST POPULAR
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.highlighted ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <plan.icon size={24} />
                </div>
                <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.description}</p>
                <div className="mb-8">
                  <motion.span 
                    key={plan.price}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black"
                  >
                    {plan.price}
                  </motion.span>
                  <span className={`text-sm ml-2 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>/{plan.period}</span>
                  {isYearly && plan.name !== "Free" && (
                    <div className={`text-xs mt-2 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Billed ${plan.price === "$9" ? "108" : "264"} annually
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start space-x-3">
                      <Check size={18} className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                      <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === 'Free' ? (
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${
                      plan.highlighted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <CheckoutButton
                    planName={plan.name}
                    ctaText={plan.cta}
                    className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${
                      plan.highlighted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-32 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="glass border border-border rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                  >
                    <span className="font-bold">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaqIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-4 pt-2 text-muted-foreground text-sm border-t border-border/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground text-sm">
              Still have questions?{" "}
              <a href="#" className="text-primary hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
