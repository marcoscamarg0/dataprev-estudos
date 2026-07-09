"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
  Flame,
  CheckCircle2,
  XCircle,
  Minus,
  BookOpen,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DATAPREV_CURRICULUM } from "@/lib/curriculum";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  topicId?: string;
  topicName?: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  isNew?: boolean;
}

const MOCK_FLASHCARDS: Flashcard[] = [];

type ViewMode = "deck" | "study" | "create";

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("deck");
  const [flashcards, setFlashcards] = useState<Flashcard[]>(MOCK_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [search, setSearch] = useState("");
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [sessionResults, setSessionResults] = useState<Record<string, number>>({});
  const [newCard, setNewCard] = useState({ front: "", back: "", tags: "" });

  const dueToday = flashcards.filter((f) => new Date(f.nextReview) <= new Date());
  const newCards = flashcards.filter((f) => f.isNew);

  const startStudySession = () => {
    const due = flashcards.filter((f) => new Date(f.nextReview) <= new Date());
    setSessionCards(due.length > 0 ? due : flashcards.slice(0, 5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode("study");
  };

  const handleRating = (quality: number) => {
    const card = sessionCards[currentIndex];
    setSessionResults((prev) => ({ ...prev, [card.id]: quality }));

    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      setViewMode("deck");
    }
  };

  const filteredCards = flashcards.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.front.toLowerCase().includes(q) ||
      f.back.toLowerCase().includes(q) ||
      f.tags.some((t) => t.includes(q))
    );
  });

  const addCard = () => {
    if (!newCard.front || !newCard.back) return;
    const card: Flashcard = {
      id: `fc${Date.now()}`,
      front: newCard.front,
      back: newCard.back,
      tags: newCard.tags.split(",").map((t) => t.trim()).filter(Boolean),
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date(),
      isNew: true,
    };
    setFlashcards((prev) => [...prev, card]);
    setNewCard({ front: "", back: "", tags: "" });
    setViewMode("deck");
  };

  if (viewMode === "study" && sessionCards.length > 0) {
    const card = sessionCards[currentIndex];
    const progress = ((currentIndex) / sessionCards.length) * 100;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("deck")}>
            <ChevronLeft size={14} />
            Parar sessão
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {sessionCards.length}
          </span>
        </div>
        <Progress value={progress} className="mb-8" />

        {/* Flashcard */}
        <div
          className="flashcard-container cursor-pointer select-none"
          onClick={() => setIsFlipped((f) => !f)}
          style={{ height: 320 }}
        >
          <div className={cn("flashcard-inner relative w-full h-full", isFlipped && "flipped")}>
            {/* Front */}
            <div className="flashcard-front absolute inset-0">
              <Card className="h-full border-2 border-border hover:border-chart-1/50 transition-colors">
                <CardContent className="h-full flex flex-col items-center justify-center p-8">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4 font-semibold">
                    Pergunta
                  </p>
                  <p className="text-base text-center text-foreground leading-relaxed font-medium">
                    {card.front}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-6">
                    Clique para revelar a resposta
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Back */}
            <div className="flashcard-back absolute inset-0">
              <Card className="h-full border-2 border-chart-1/30 bg-chart-1/5">
                <CardContent className="h-full flex flex-col items-center justify-center p-8">
                  <p className="text-[10px] uppercase tracking-wider text-chart-1 mb-4 font-semibold">
                    Resposta
                  </p>
                  <p className="text-sm text-center text-foreground leading-relaxed whitespace-pre-line">
                    {card.back}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="text-xs text-center text-muted-foreground mb-3">
                Como foi sua resposta?
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { quality: 1, label: "Errei", color: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20", next: "1 dia" },
                  { quality: 2, label: "Difícil", color: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20", next: "3 dias" },
                  { quality: 3, label: "Bom", color: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20", next: "7 dias" },
                  { quality: 4, label: "Fácil", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20", next: "14 dias" },
                ].map((r) => (
                  <button
                    key={r.quality}
                    onClick={() => handleRating(r.quality)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all active:scale-95",
                      r.color
                    )}
                  >
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[10px] opacity-70">{r.next}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <div className="flex gap-1.5 mt-4 justify-center">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === "create") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("deck")}>
            <ChevronLeft size={14} />
            Voltar
          </Button>
          <h1 className="text-xl font-semibold">Novo Flashcard</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Frente (Pergunta)
              </label>
              <textarea
                value={newCard.front}
                onChange={(e) => setNewCard((p) => ({ ...p, front: e.target.value }))}
                placeholder="Digite a pergunta ou conceito..."
                className="w-full min-h-[120px] p-3 rounded-md border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Verso (Resposta)
              </label>
              <textarea
                value={newCard.back}
                onChange={(e) => setNewCard((p) => ({ ...p, back: e.target.value }))}
                placeholder="Digite a resposta, explicação ou conceito..."
                className="w-full min-h-[120px] p-3 rounded-md border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Tags (separadas por vírgula)
              </label>
              <Input
                value={newCard.tags}
                onChange={(e) => setNewCard((p) => ({ ...p, tags: e.target.value }))}
                placeholder="java, spring, conceito..."
                className="h-8 text-xs"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={addCard} variant="indigo" className="flex-1">
                Criar Flashcard
              </Button>
              <Button variant="outline" onClick={() => setViewMode("deck")}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Flashcards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sistema de repetição espaçada (SM-2) · {flashcards.length} cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startStudySession}>
            <BookOpen size={13} />
            Revisar ({dueToday.length})
          </Button>
          <Button variant="indigo" size="sm" onClick={() => setViewMode("create")}>
            <Plus size={13} />
            Novo Card
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total de cards", value: flashcards.length, color: "text-foreground" },
          { label: "Para revisar hoje", value: dueToday.length, color: "text-red-500" },
          { label: "Novos", value: newCards.length, color: "text-chart-1" },
          { label: "Dominados", value: flashcards.filter((f) => f.repetitions >= 3).length, color: "text-chart-2" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Due today banner */}
      {dueToday.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-chart-1/10 border border-chart-1/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-chart-1" />
            <span className="text-sm font-medium text-chart-1">
              {dueToday.length} cards para revisar hoje
            </span>
          </div>
          <Button variant="indigo" size="sm" onClick={startStudySession}>
            Iniciar Revisão →
          </Button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar flashcards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredCards.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <BookOpen size={32} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Nenhum flashcard disponível ainda.</p>
          </div>
        )}
        {filteredCards.map((card) => {
          const isDue = new Date(card.nextReview) <= new Date();
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={cn("card-hover", isDue && "border-chart-1/30")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {isDue && (
                      <Badge variant="danger" className="text-[10px] shrink-0">
                        Revisar
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1 line-clamp-2">
                    {card.front}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{card.back}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-[10px] text-muted-foreground">
                      Intervalo: {card.interval}d · EF: {card.easeFactor.toFixed(1)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm">
                        <Pencil size={11} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setFlashcards((prev) => prev.filter((f) => f.id !== card.id))
                        }
                      >
                        <Trash2 size={11} className="text-red-500" />
                      </Button>
                    </div>
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
