import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Zap, Brain, Users, Target, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-6">About Us</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              We&apos;re Building the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                Future of Education
              </span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              AI Smart Learning was founded on the belief that every student deserves a world-class, 
              personalized education — not just those who can afford private tutors or elite institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We combine cutting-edge AI with research-backed pedagogy to create learning experiences 
              that are adaptive, engaging, and truly effective. Our platform doesn&apos;t just deliver content — 
              it understands each student&apos;s unique learning pattern and responds accordingly.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Whether you&apos;re a self-taught developer, a university student, or a working professional 
              upskilling for the future, AI Smart Learning meets you exactly where you are.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Users, value: "10,000+", label: "Active Learners" },
              { icon: BookOpen, value: "500+", label: "Courses Available" },
              { icon: Globe, value: "50+", label: "Countries Reached" },
              { icon: Target, value: "92%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label} className="glass p-6 rounded-2xl border border-border text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-3">
                  <stat.icon size={22} />
                </div>
                <p className="text-3xl font-black mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold mb-12 text-center">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Intelligence First", desc: "Every feature is AI-native. We don't bolt on AI — it's the foundation everything is built on." },
              { icon: Users, title: "Student Obsessed", desc: "Every decision we make starts with the question: does this make learning better for the student?" },
              { icon: Zap, title: "Radical Accessibility", desc: "World-class education should be free. We charge for advanced features, never for basic learning." },
            ].map((v) => (
              <div key={v.title} className="glass p-8 rounded-3xl border border-border hover:border-primary/20 transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <v.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
