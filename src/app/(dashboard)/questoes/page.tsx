"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Heart,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Flag,
  Timer,
  Shuffle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DATAPREV_CURRICULUM } from "@/lib/curriculum";

// Mock question bank
const MOCK_QUESTIONS: any[] = [];

type FilterState = {
  subject: string;
  difficulty: string;
  banca: string;
  search: string;
};

type AnswerState = Record<string, string>;

export default function QuestoesPage() {
  const [mode, setMode] = useState<"list" | "solving">("list");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [doubts, setDoubts] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    subject: "all",
    difficulty: "all",
    banca: "all",
    search: "",
  });

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    if (filters.difficulty !== "all" && q.difficulty !== filters.difficulty) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return q.statement.toLowerCase().includes(s) || q.tags.some((t: string) => t.includes(s));
    }
    return true;
  });

  const currentQuestion = filteredQuestions[currentIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id];
  const isRevealed = currentQuestion && revealed.has(currentQuestion.id);

  const handleAnswer = (questionId: string, letter: string) => {
    if (revealed.has(questionId)) return;
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
    setRevealed((prev) => new Set([...prev, questionId]));
  };

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = MOCK_QUESTIONS.filter((q) => {
    const answer = answers[q.id];
    if (!answer) return false;
    return q.alternatives.find((a: any) => a.letter === answer)?.isCorrect;
  }).length;

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  if (mode === "solving" && currentQuestion) {
    const answered = answers[currentQuestion.id];
    const isCorrect =
      answered &&
      currentQuestion.alternatives.find((a: any) => a.letter === answered)?.isCorrect;

    return (
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => setMode("list")}>
            <ChevronLeft size={14} />
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setFavorites((prev) => {
                    const next = new Set(prev);
                    next.has(currentQuestion.id)
                      ? next.delete(currentQuestion.id)
                      : next.add(currentQuestion.id);
                    return next;
                  })
                }
              >
                <Heart
                  size={14}
                  className={favorites.has(currentQuestion.id) ? "fill-red-500 text-red-500" : ""}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setDoubts((prev) => {
                    const next = new Set(prev);
                    next.has(currentQuestion.id)
                      ? next.delete(currentQuestion.id)
                      : next.add(currentQuestion.id);
                    return next;
                  })
                }
              >
                <Flag
                  size={14}
                  className={doubts.has(currentQuestion.id) ? "text-amber-500" : ""}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress
          value={((currentIndex + 1) / filteredQuestions.length) * 100}
          className="mb-6 h-1"
        />

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="mb-4">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-[10px]">{currentQuestion.banca}</Badge>
                  <Badge variant="outline" className="text-[10px]">{currentQuestion.year}</Badge>
                  <Badge
                    className={cn(
                      "text-[10px]",
                      currentQuestion.difficulty === "easy" && "difficulty-easy",
                      currentQuestion.difficulty === "medium" && "difficulty-medium",
                      currentQuestion.difficulty === "hard" && "difficulty-hard"
                    )}
                  >
                    {currentQuestion.difficulty === "easy" ? "Fácil" : currentQuestion.difficulty === "medium" ? "Médio" : "Difícil"}
                  </Badge>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{currentQuestion.statement}</p>
              </CardContent>
            </Card>

            {/* Alternatives */}
            <div className="space-y-2 mb-4">
              {currentQuestion.alternatives.map((alt: any) => {
                const isSelected = answered === alt.letter;
                const isRevealedNow = revealed.has(currentQuestion.id);
                const isCorrectAlt = alt.isCorrect;

                let altClass = "border-border bg-card hover:bg-muted/50 cursor-pointer";
                if (isRevealedNow) {
                  if (isCorrectAlt) altClass = "border-emerald-500/50 bg-emerald-500/10 cursor-default";
                  else if (isSelected) altClass = "border-red-500/50 bg-red-500/10 cursor-default";
                  else altClass = "border-border bg-card opacity-60 cursor-default";
                }

                return (
                  <button
                    key={alt.letter}
                    onClick={() => handleAnswer(currentQuestion.id, alt.letter)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all duration-150",
                      altClass
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                        isRevealedNow && isCorrectAlt
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isRevealedNow && isSelected && !isCorrectAlt
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-border"
                      )}
                    >
                      {alt.letter}
                    </span>
                    <span className="text-sm text-foreground">{alt.text}</span>
                    {isRevealedNow && isCorrectAlt && (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5 ml-auto" />
                    )}
                    {isRevealedNow && isSelected && !isCorrectAlt && (
                      <XCircle size={14} className="text-red-500 shrink-0 mt-0.5 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result */}
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "p-4 rounded-lg mb-4 border",
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isCorrect ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {isCorrect ? "Resposta Correta!" : "Resposta Incorreta"}
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={14} />
                Anterior
              </Button>
              <Button
                variant={isRevealed ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (currentIndex < filteredQuestions.length - 1) {
                    setCurrentIndex((i) => i + 1);
                  } else {
                    setMode("list");
                  }
                }}
              >
                {currentIndex < filteredQuestions.length - 1 ? "Próxima" : "Finalizar"}
                <ChevronRight size={14} />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Banco de Questões</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {MOCK_QUESTIONS.length} questões · FGV DATAPREV 2026
          </p>
        </div>
        <Button
          variant="indigo"
          size="sm"
          onClick={() => { setCurrentIndex(0); setMode("solving"); }}
        >
          <BookOpen size={13} />
          Resolver Questões
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Respondidas", value: totalAnswered, color: "text-chart-1" },
          { label: "Corretas", value: totalCorrect, color: "text-chart-2" },
          { label: "Erradas", value: totalAnswered - totalCorrect, color: "text-red-500" },
          { label: "Taxa de Acerto", value: `${accuracy}%`, color: accuracy >= 70 ? "text-chart-2" : "text-amber-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar questões..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: "all", label: "Todas" },
            { key: "easy", label: "Fácil" },
            { key: "medium", label: "Médio" },
            { key: "hard", label: "Difícil" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filters.difficulty === key ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilters((f) => ({ ...f, difficulty: key }))}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle size={32} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Nenhuma questão disponível ainda.</p>
          </div>
        )}
        {filteredQuestions.map((q, idx) => {
          const answered = answers[q.id];
          const isCorrect =
            answered &&
            q.alternatives.find((a: any) => a.letter === answered)?.isCorrect;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card
                className="card-hover cursor-pointer"
                onClick={() => { setCurrentIndex(idx); setMode("solving"); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {answered ? (
                        isCorrect ? (
                          <CheckCircle2 size={16} className="text-chart-2" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )
                      ) : (
                        <Circle size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{q.statement}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{q.banca} {q.year}</Badge>
                        <Badge
                          className={cn(
                            "text-[10px]",
                            q.difficulty === "easy" && "difficulty-easy",
                            q.difficulty === "medium" && "difficulty-medium",
                            q.difficulty === "hard" && "difficulty-hard"
                          )}
                        >
                          {q.difficulty === "easy" ? "Fácil" : q.difficulty === "medium" ? "Médio" : "Difícil"}
                        </Badge>
                        {q.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Circle({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size || 16}
      height={size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
