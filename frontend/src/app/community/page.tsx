"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, MessageSquare, TrendingUp, Sparkles, BookOpen, Search, Award, Eye, Plus, X } from "lucide-react";
import Link from "next/link";
import { getAuth } from "firebase/auth";

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
  _count: {
    replies: number;
  };
}

interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  discussions: number;
  replies: number;
  rank: number;
}

const categories = ["All", "AI Skills", "Development", "Soft Skills", "Showcase"];

const rankBadges: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-600",
};

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Post discussion state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Development");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussions();
    fetchContributors();
    fetchStats();
  }, []);

  const fetchContributors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/community/top-contributors`);
      if (res.ok) {
        const data = await res.json();
        setContributors(data);
      }
    } catch (error) {
      console.error("Error fetching contributors:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/community/stats`);
      if (res.ok) {
        const data = await res.json();
        setTotalUsers(data.totalUsers);
        setTotalDiscussions(data.totalDiscussions);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/community/discussions`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data);
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("Please login to post a discussion");
        window.location.href = '/login';
        return;
      }
      
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/community/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setDiscussions([data, ...discussions]);
        setShowModal(false);
        setNewTitle("");
        setNewContent("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post discussion");
      }
    } catch (error) {
      console.error("Error posting discussion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (discussion.author?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || discussion.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen relative">
      <Navbar />
      
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Users size={16} />
              <span>{totalUsers.toLocaleString()}+ Active Learners</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              AI SMART <span className="text-primary">Community</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join the conversation, share your progress, and learn together with thousands of students worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Action Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search discussions, topics, or members..."
                    className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground font-bold py-4 px-6 rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus size={20} />
                  New Post
                </button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      activeCategory === category
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-primary" size={24} />
                    {activeCategory === "All" ? "Trending Discussions" : `${activeCategory} Discussions`}
                  </h2>
                  <span className="text-sm text-muted-foreground font-medium">
                    {filteredDiscussions.length} results
                  </span>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading discussions...</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredDiscussions.length > 0 ? (
                      filteredDiscussions.map((discussion, i) => (
                        <Link
                          href={`/community/${discussion.id}`}
                          key={discussion.id}
                        >
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass border border-border p-6 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                                {discussion.category}
                              </span>
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {discussion.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mt-2 line-clamp-2 pr-4">
                                {discussion.content}
                              </p>
                              <div className="flex items-center space-x-4 mt-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium">
                                  <Users size={14} /> {discussion.author?.name || 'Anonymous'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={14} /> {discussion._count?.replies || 0} replies
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye size={14} /> {discussion.views} views
                                </span>
                                <span className="flex items-center gap-1">
                                  {new Date(discussion.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0 ml-4">
                              <TrendingUp size={18} />
                            </div>
                          </div>
                        </motion.div>
                        </Link>
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 glass rounded-2xl border border-border"
                      >
                        <Search className="mx-auto text-muted-foreground mb-4 opacity-50" size={48} />
                        <p className="text-muted-foreground text-lg mb-4">No discussions found matching your criteria.</p>
                        <button 
                          onClick={() => setShowModal(true)}
                          className="text-primary font-bold hover:underline"
                        >
                          Be the first to start a discussion!
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="glass border border-border p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
                <Sparkles className="text-primary mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Showcase Your Work</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Completed a project using AI SMART? Share it with the community and get feedback from top instructors.
                </p>
                <button 
                  onClick={() => {
                    setNewCategory("Showcase");
                    setShowModal(true);
                  }}
                  className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  Post a Showcase
                </button>
              </div>

              {/* Top Contributors */}
              <div className="glass border border-border p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Award size={20} className="text-primary" />
                  Top Contributors
                </h3>
                <div className="space-y-4">
                  {contributors.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.points} pts</p>
                        </div>
                      </div>
                      {rankBadges[user.rank] && <Award size={18} className={rankBadges[user.rank]} />}
                    </div>
                  ))}
                  {contributors.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No contributors yet</p>
                  )}
                </div>
              </div>

              <div className="glass border border-border p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  Community Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                    <span className="text-sm font-medium">Total Discussions</span>
                    <span className="text-lg font-black text-primary">{totalDiscussions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                    <span className="text-sm font-medium">Active Members</span>
                    <span className="text-lg font-black text-primary">{totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                    <span className="text-sm font-medium">Contributors</span>
                    <span className="text-lg font-black text-primary">{contributors.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Start a Discussion</h2>
              
              <form onSubmit={handlePostDiscussion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., How to implement RAG with Next.js?"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Details (Optional)</label>
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share more details, code snippets, or context..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all h-32 resize-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : "Post Discussion"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
