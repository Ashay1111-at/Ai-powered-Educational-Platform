import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Social Proof / Trust Bar */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground mb-10">
            Trusted by learners from top institutions
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 hover:opacity-60 transition-opacity">
            {["Stanford", "MIT", "Harvard", "Oxford", "IIT Delhi", "BITS Pilani"].map((name) => (
              <span key={name} className="text-xl font-black tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Features />

      {/* How It Works */}
      <section className="py-24 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Your Journey to Mastery
            </h2>
            <p className="text-muted-foreground text-lg mt-4 max-w-xl mx-auto">
              Four simple steps to unlock your full learning potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {[
              { step: "01", title: "Sign Up Free", desc: "Create your account with Google in under 10 seconds." },
              { step: "02", title: "Take Assessment", desc: "Our AI evaluates your current knowledge and goals." },
              { step: "03", title: "Get Your Path", desc: "Receive a custom roadmap built around your schedule." },
              { step: "04", title: "Learn & Level Up", desc: "Engage with AI content, get feedback, and master topics." },
            ].map((item, i) => (
              <div key={i} className="relative group text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 relative z-10">
                  <span className="text-2xl font-black">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
