"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, MessageSquare, Eye, ArrowLeft, Send } from "lucide-react";
import { getAuth } from "firebase/auth";

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
}

interface DiscussionDetail {
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
  replies: Reply[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussion();
  }, []);

  const fetchDiscussion = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/community/discussions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDiscussion(data);
      }
    } catch (error) {
      console.error("Error fetching discussion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/community/discussions/${params.id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (res.ok) {
        const newReply = await res.json();
        setDiscussion(prev => prev ? { ...prev, replies: [...prev.replies, newReply] } : prev);
        setReplyContent("");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading discussion...</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!discussion) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-muted-foreground text-lg">Discussion not found.</p>
            <button onClick={() => router.push('/community')} className="text-primary font-bold hover:underline mt-4 inline-block">
              Back to Community
            </button>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/community')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Community
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border p-8 rounded-3xl mb-8"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md mb-4 inline-block">
              {discussion.category}
            </span>
            <h1 className="text-3xl font-black mb-4">{discussion.title}</h1>
            {discussion.content && (
              <p className="text-muted-foreground mb-6 leading-relaxed">{discussion.content}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground border-t border-border pt-4">
              <span className="flex items-center gap-1 font-medium">
                <Users size={14} /> {discussion.author?.name || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} /> {discussion.replies.length} replies
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {discussion.views} views
              </span>
              <span className="flex items-center gap-1">
                {new Date(discussion.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>

          {/* Replies */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold mb-6">Replies ({discussion.replies.length})</h2>
            {discussion.replies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 glass rounded-2xl border border-border">
                No replies yet. Be the first to respond!
              </p>
            ) : (
              discussion.replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass border border-border p-6 rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {reply.author?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{reply.author?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
                </motion.div>
              ))
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleReply} className="glass border border-border p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Post a Reply</h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all h-28 resize-none mb-4"
            />
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Reply
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
