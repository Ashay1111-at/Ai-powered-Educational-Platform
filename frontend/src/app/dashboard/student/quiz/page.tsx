"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Loader2, CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [pastQuizzes, setPastQuizzes] = useState<any[]>([]);
  const [viewingPast, setViewingPast] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/ai/generate-quiz", { topic });
      setActiveQuizId(response.data.id);
      setQuestions(response.data.questions);
      setCurrentStep(0);
      setScore(0);
      setQuizFinished(false);
      setViewingPast(false);
    } catch (error: any) {
      console.error("Failed to generate quiz", error);
      toast.error(error.response?.data?.error || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastQuizzes = async () => {
    try {
      const res = await api.get("/ai/personal-quizzes");
      setPastQuizzes(res.data);
      setViewingPast(true);
    } catch (error) {
      console.error("Failed to fetch past quizzes", error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === questions![currentStep].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentStep + 1 < questions!.length) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      // Update score in backend
      if (activeQuizId) {
        api.post(`/ai/personal-quizzes/${activeQuizId}/score`, { 
          score: Math.round((score / questions!.length) * 100) 
        }).catch(console.error);
      }
      // Record activity
      api.post('/users/record-activity', { type: 'QUIZ_COMPLETED', points: 20 }).catch(console.error);
    }
  };

  const resetQuiz = () => {
    setQuestions(null);
    setTopic("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Quiz Generator</h1>
          <p className="text-muted-foreground mt-2">Generate instant practice tests on any topic to test your knowledge.</p>
        </div>
        {!questions && (
          <button 
            onClick={viewingPast ? () => setViewingPast(false) : fetchPastQuizzes}
            className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all"
          >
            {viewingPast ? "Back to Generator" : "View Recent Quizzes"}
          </button>
        )}
      </div>

      {!questions && viewingPast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 gap-4"
        >
          {pastQuizzes.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-border opacity-50">
              <Trophy size={48} className="mx-auto mb-4" />
              <p>No quizzes taken yet.</p>
            </div>
          ) : (
            pastQuizzes.map((quiz) => (
              <div 
                key={quiz.id}
                onClick={() => {
                  setQuestions(quiz.questions);
                  setActiveQuizId(quiz.id);
                  setQuizFinished(true);
                  setScore(Math.round((quiz.score / 100) * quiz.questions.length));
                }}
                className="glass p-6 rounded-2xl border border-border flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">{quiz.topic}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-primary">{quiz.score || 0}%</div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Score</p>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {!questions && !viewingPast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl border border-border space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">What do you want to be tested on?</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, The French Revolution, or paste a summary from your lesson..."
              className="w-full bg-muted border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            <span>{loading ? "Generating Quiz..." : "Create Quiz"}</span>
          </button>
        </motion.div>
      )}

      {questions && !quizFinished && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-3xl border border-border space-y-8"
        >
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <div className="w-32 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-xl font-bold">{questions[currentStep].question}</h3>

          <div className="grid grid-cols-1 gap-4">
            {questions[currentStep].options.map((option, i) => {
              const isCorrect = option === questions[currentStep].correctAnswer;
              const isSelected = option === selectedAnswer;
              
              let style = "bg-muted/50 border-transparent hover:bg-muted";
              if (selectedAnswer) {
                if (isCorrect) style = "bg-green-500/10 border-green-500 text-green-500";
                else if (isSelected) style = "bg-red-500/10 border-red-500 text-red-500";
                else style = "opacity-50 cursor-default";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={!!selectedAnswer}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${style}`}
                >
                  <span className="font-medium">{option}</span>
                  {selectedAnswer && isCorrect && <CheckCircle2 size={20} />}
                  {selectedAnswer && isSelected && !isCorrect && <XCircle size={20} />}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-primary/5 p-6 rounded-2xl border border-primary/20 space-y-2"
            >
              <h4 className="font-bold text-primary">Explanation:</h4>
              <p className="text-sm leading-relaxed">{questions[currentStep].explanation}</p>
              
              <button
                onClick={nextQuestion}
                className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                <span>{currentStep + 1 === questions.length ? "View Results" : "Next Question"}</span>
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {questions && quizFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-3xl border border-border text-center space-y-8"
        >
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={48} />
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground text-lg">You scored {score} out of {questions.length}</p>
          </div>
          
          <div className="text-6xl font-black text-primary">
            {Math.round((score / questions.length) * 100)}%
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleGenerate}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:neon-glow transition-all"
            >
              <RotateCcw size={20} />
              <span>Try Another</span>
            </button>
            <button
              onClick={resetQuiz}
              className="px-8 bg-muted text-foreground py-4 rounded-xl font-bold hover:bg-muted/80 transition-all"
            >
              Home
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

