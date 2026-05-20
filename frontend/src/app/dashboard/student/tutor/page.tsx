"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Copy, Check, Sparkles, Trash2, Plus, MessageSquare, History, Loader2 } from "lucide-react";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "tutor";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const response = await api.get("/ai/conversations");
      setConversations(response.data);
      if (response.data.length > 0 && !activeId) {
        loadConversation(response.data[0].id);
      } else if (response.data.length === 0) {
        setMessages([{ 
          role: "tutor", 
          content: "Hello! I'm your **AI Smart Tutor**. Start a new chat or pick one from the history to begin.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      toast.error("Failed to load chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (id: string) => {
    setLoading(true);
    setActiveId(id);
    try {
      const response = await api.get(`/ai/conversations/${id}`);
      const history = response.data.messages.map((m: any) => ({
        role: m.role === "assistant" ? "tutor" : "user",
        content: m.content,
        timestamp: new Date(m.createdAt)
      }));
      setMessages(history.length > 0 ? history : [{
        role: "tutor",
        content: "Starting conversation...",
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async () => {
    try {
      const response = await api.post("/ai/conversations", { title: "New Conversation" });
      setConversations(prev => [response.data, ...prev]);
      setActiveId(response.data.id);
      setMessages([{ 
        role: "tutor", 
        content: "New chat started! How can I help you today?",
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error("Failed to start new chat");
    }
  };

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await api.delete(`/ai/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Auto-create conversation if none active
    let currentId = activeId;
    if (!currentId) {
      try {
        const resp = await api.post("/ai/conversations", { title: input.substring(0, 30) + "..." });
        currentId = resp.data.id;
        setActiveId(currentId);
        setConversations(prev => [resp.data, ...prev]);
      } catch (e) {
        toast.error("Failed to initialize chat persistence");
        return;
      }
    }

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/ai/tutor", {
        question: input,
        conversationId: currentId,
        history: messages.map(m => ({ 
          role: m.role === "tutor" ? "assistant" : "user", 
          content: m.content 
        }))
      });

      const tutorReply: Message = { 
        role: "tutor", 
        content: response.data.answer, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, tutorReply]);
      
      if (autoSpeak) {
        speakText(tutorReply.content);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("AI is currently busy due to high demand. Please try again later.");
      } else {
        toast.error(error.response?.data?.error || "Failed to connect to AI Tutor");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 max-w-7xl mx-auto overflow-hidden">
      {/* Sidebar History */}
      <div className={`glass rounded-3xl border border-border flex flex-col w-80 flex-shrink-0 transition-all ${sidebarOpen ? "ml-0" : "-ml-80"}`}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-lg">
            <History size={20} className="text-primary" />
            <span>Chat History</span>
          </div>
          <button 
            onClick={startNewChat}
            className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
            title="New Chat"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {loadingHistory ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm italic">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full group text-left p-4 rounded-2xl transition-all border cursor-pointer ${
                  activeId === conv.id 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "hover:bg-muted border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <MessageSquare size={16} className={`mt-1 flex-shrink-0 ${activeId === conv.id ? "text-white" : "text-primary"}`} />
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{conv.title}</p>
                      <p className={`text-[10px] mt-1 ${activeId === conv.id ? "text-white/70" : "text-muted-foreground"}`}>
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteConversation(e, conv.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded-md transition-all ${activeId === conv.id ? "text-white hover:bg-white/20" : "text-destructive"}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-muted rounded-xl lg:hidden"
            >
              <History size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Bot className="text-primary" size={28} />
                </div>
                <span>AI Tutor</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-3 rounded-xl transition-all ${autoSpeak ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              title="Toggle Auto-Speak"
            >
              {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        <div className="flex-1 glass rounded-3xl border border-border flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

          {/* Chat Messages */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-primary/20">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 && !loading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 text-primary">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-2xl font-bold">Start Learning!</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    Ask me anything about your courses, programming, or complex academic topics.
                  </p>
                </motion.div>
              )}
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-start space-x-4 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    msg.role === "tutor" ? "bg-primary text-white" : "bg-zinc-800 text-white"
                  }`}>
                    {msg.role === "tutor" ? <Bot size={22} /> : <User size={22} />}
                  </div>
                  <div className={`group relative max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-sm ${
                    msg.role === "tutor" 
                      ? "bg-muted/50 border border-border text-foreground" 
                      : "bg-primary text-white"
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <div className="relative group/code mt-4 mb-4">
                                <div className="absolute right-3 top-3 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => copyToClipboard(String(children))}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-all"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={atomDark}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-xl !bg-zinc-950 !p-6 border border-white/10 shadow-inner"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className={`${className} bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-mono text-xs`} {...props}>
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => <p className="mb-0 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    
                    <div className={`absolute top-2 ${msg.role === "tutor" ? "-right-12" : "-left-12"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {msg.role === "tutor" && (
                        <button 
                          onClick={() => speakText(msg.content)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                      )}
                    </div>
                    
                    <span className={`text-[10px] mt-2 block opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center animate-pulse">
                  <Bot size={22} />
                </div>
                <div className="p-5 rounded-2xl bg-muted/50 border border-border flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-border">
            <div className="relative flex items-center group/input">
              <div className="absolute left-4 z-10">
                <Sparkles className="text-primary/40 group-focus-within/input:text-primary transition-colors" size={18} />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isListening ? "I'm listening..." : "Type your message..."}
                className={`w-full bg-muted border border-border rounded-2xl py-5 pl-12 pr-32 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all ${
                  isListening ? "border-primary shadow-[0_0_15px_rgba(239,68,68,0.2)]" : ""
                }`}
              />
              <div className="absolute right-3 flex items-center space-x-2">
                <button
                  onClick={toggleSpeech}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted-foreground/10"
                  }`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-primary text-white rounded-xl hover:neon-glow disabled:opacity-30 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
