"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  Clock,
  HelpCircle,
  TrendingUp,
  Zap,
  Target,
  Flame,
  Calendar,
  BookOpen,
  CheckCircle,
  Brain,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  RotateCw,
  Copy,
  Check,
  X,
  FileText,
  Lightbulb,
  ArrowRight,
  Loader2,
  Bookmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateApprovalProbability,
  getDaysUntil,
  EXAM_DATE,
  getXpLevel,
  getHeatmapIntensity,
  cn,
} from "@/lib/utils";
import Link from "next/link";
import { useAuthStore } from "@/store";
import {
  useCurriculumStore,
  useActiveCurriculum,
  useActiveEdital,
  useActiveEditalMaterials,
  StudySummary,
} from "@/store/curriculumStore";

const weeklyData = [
  { day: "Seg", hours: 2.5, questions: 15 },
  { day: "Ter", hours: 3.0, questions: 20 },
  { day: "Qua", hours: 1.5, questions: 10 },
  { day: "Qui", hours: 2.0, questions: 18 },
  { day: "Sex", hours: 3.5, questions: 25 },
  { day: "Sáb", hours: 4.0, questions: 30 },
  { day: "Dom", hours: 1.0, questions: 12 },
];

const heatmapData: any[] = [];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Curriculum & Edital State
  const { editais, activeEditalId, setActiveEdital, updateEdital, fetchEditais } = useCurriculumStore();
  const activeCurriculum = useActiveCurriculum();
  const activeEdital = useActiveEdital();
  const studyMaterials = useActiveEditalMaterials();

  // Interactive Materials State
  const [selectedSummary, setSelectedSummary] = useState<StudySummary | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [isGeneratingMaterials, setIsGeneratingMaterials] = useState(false);
  const [activeMaterialTab, setActiveMaterialTab] = useState<"apostilas" | "flashcards" | "cronograma">("apostilas");

  useEffect(() => {
    setMounted(true);
    fetchEditais();
  }, [fetchEditais]);

  const daysLeft = getDaysUntil(EXAM_DATE);
  const approvalProbability = 68;
  const xpInfo = getXpLevel(user?.totalXp || 350);

  // Compute dynamic radar data from active edital's actual subjects
  const topSubjects = activeCurriculum.slice(0, 8);
  const radarData = topSubjects.map((s, idx) => ({
    subject: s.name.length > 14 ? s.name.slice(0, 12) + "..." : s.name,
    value: [75, 60, 85, 50, 70, 65, 80, 55][idx % 8] || 60,
  }));

  // Total topics count in active edital
  const totalTopics = activeCurriculum.reduce((acc, s) => acc + (s.topics?.length || 0), 0);

  const STATS = [
    {
      label: "Disciplinas no Edital",
      value: `${activeCurriculum.length}`,
      sub: `${totalTopics} tópicos cadastrados`,
      icon: Layers,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      trend: "Ativo",
      trendUp: true,
    },
    {
      label: "Apostilas & Resumos IA",
      value: `${studyMaterials?.summaries?.length || 0}`,
      sub: "Prontos para leitura",
      icon: BookOpen,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      trend: "IA",
      trendUp: true,
    },
    {
      label: "Flashcards do Edital",
      value: `${studyMaterials?.flashcards?.length || 0}`,
      sub: "Fixação e memorização",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      trend: "Revisão",
      trendUp: true,
    },
    {
      label: "Meta Diária Sugerida",
      value: "2h30",
      sub: "Baseado no cronograma",
      icon: Clock,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
      trend: "Foco",
      trendUp: true,
    },
  ];

  const handleGenerateMaterials = async () => {
    if (isGeneratingMaterials) return;
    setIsGeneratingMaterials(true);
    try {
      const res = await fetch("/api/ai/generate-study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editalTitle: activeEdital.title,
          role: activeEdital.role,
          banca: activeEdital.banca || "FGV",
          subjects: activeCurriculum,
        }),
      });
      const data = await res.json();
      if (data.materials) {
        updateEdital(activeEdital.id, { studyMaterials: data.materials });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingMaterials(false);
    }
  };

  const handleCopySummary = () => {
    if (!selectedSummary) return;
    const textToCopy = `# ${selectedSummary.title}\nDisciplina: ${selectedSummary.subjectName}\n\n## Pontos Essenciais:\n${selectedSummary.keyPoints.map((p) => `- ${p}`).join("\n")}\n\n## Resumo Teórico:\n${selectedSummary.theorySummary}\n\n## Dica de Prova da Banca:\n${selectedSummary.examTips}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  if (!mounted) return null;

  const currentCard = studyMaterials?.flashcards?.[currentFlashcardIndex];

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* 🌟 HERO: EDITAL EM FOCO & SELETOR INTELIGENTE */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/20 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles size={12} className="text-indigo-400" />
                Edital em Foco
              </span>
              <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-400 bg-amber-500/10">
                🏛️ Banca: {activeEdital.banca || "FGV"}
              </Badge>
              {activeEdital.role && (
                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300 font-normal">
                  Cargo: {activeEdital.role}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {activeCurriculum.length} disciplinas cadastradas
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {activeEdital.title}
            </h1>

            <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {activeEdital.overview ||
                studyMaterials?.overview ||
                "Seu edital está configurado. A IA estruturou o conteúdo programático e gerou materiais personalizados para sua rotina de estudos."}
            </p>
          </div>

          {/* Right Side: Switcher & AI Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Edital Switcher */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <span className="text-xs text-zinc-400 pl-2 pr-1 font-mono">Concurso:</span>
              <select
                value={activeEditalId}
                onChange={(e) => setActiveEdital(e.target.value)}
                className="bg-zinc-800 text-zinc-200 text-xs rounded px-2.5 py-1.5 border-none focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer max-w-[210px] truncate"
              >
                {editais.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.title}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateMaterials}
              disabled={isGeneratingMaterials}
              className="gap-2 border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs h-9"
            >
              {isGeneratingMaterials ? (
                <Loader2 size={14} className="animate-spin text-indigo-400" />
              ) : (
                <Sparkles size={14} className="text-indigo-400" />
              )}
              <span>{isGeneratingMaterials ? "Gerando Materiais..." : "Atualizar Materiais com IA"}</span>
            </Button>

            <Link href="/concursos">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white h-9">
                <Layers size={14} />
                <span>Gerenciar</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 📊 STATS ROW */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-12 gap-4">
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={item} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="card-hover border-zinc-800 bg-zinc-900/60 backdrop-blur">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-indigo-400 mt-1 font-medium">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 📚 SEÇÃO PRINCIPAL: MATERIAIS DE ESTUDO GERADOS POR IA */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BookOpen size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Materiais de Estudo do Edital
                <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 bg-indigo-500/10 text-[10px]">
                  Gerado por IA
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Conteúdos teóricos, flashcards e cronograma montados especificamente para seu edital.
              </p>
            </div>
          </div>

          {/* Material Navigation Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveMaterialTab("apostilas")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                activeMaterialTab === "apostilas"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <FileText size={12} />
              Apostilas & Resumos ({studyMaterials?.summaries?.length || 0})
            </button>
            <button
              onClick={() => setActiveMaterialTab("flashcards")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                activeMaterialTab === "flashcards"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Zap size={12} />
              Flashcards ({studyMaterials?.flashcards?.length || 0})
            </button>
            <button
              onClick={() => setActiveMaterialTab("cronograma")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                activeMaterialTab === "cronograma"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Calendar size={12} />
              Cronograma Semanal
            </button>
          </div>
        </div>

        {/* TAB 1: APOSTILAS & RESUMOS TEÓRICOS */}
        {activeMaterialTab === "apostilas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {studyMaterials?.summaries && studyMaterials.summaries.length > 0 ? (
              studyMaterials.summaries.map((summary) => (
                <Card
                  key={summary.id}
                  className="border-zinc-800 bg-zinc-900/50 hover:border-indigo-500/40 hover:bg-zinc-900/90 transition-all flex flex-col justify-between group"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                        {summary.subjectName}
                      </Badge>
                      <Sparkles size={12} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-white line-clamp-2">
                      {summary.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-zinc-400">Pontos essenciais:</p>
                      <ul className="space-y-1">
                        {summary.keyPoints.slice(0, 3).map((pt, i) => (
                          <li key={i} className="text-[11px] text-zinc-300 flex items-start gap-1.5 line-clamp-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80">
                      <Button
                        variant="indigo"
                        size="sm"
                        className="w-full text-xs h-8 gap-1.5 shadow-sm"
                        onClick={() => setSelectedSummary(summary)}
                      >
                        <BookOpen size={12} />
                        <span>Ler Apostila Completa</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-zinc-900/30 rounded-xl border border-zinc-800">
                <BookOpen size={32} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-300">Nenhum resumo gerado ainda.</p>
                <p className="text-xs text-zinc-500 mt-1 mb-4">Clique abaixo para a IA gerar apostilas com base no edital.</p>
                <Button variant="indigo" size="sm" onClick={handleGenerateMaterials} disabled={isGeneratingMaterials}>
                  <Sparkles size={14} className="mr-1.5" /> Gerar Apostilas com IA
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FLASHCARDS INTERATIVOS DO EDITAL */}
        {activeMaterialTab === "flashcards" && (
          <div className="max-w-2xl mx-auto py-2">
            {currentCard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                      {currentCard.subjectName}
                    </Badge>
                    {currentCard.difficulty && (
                      <span className="text-[11px] text-zinc-500">Dificuldade: {currentCard.difficulty}</span>
                    )}
                  </div>
                  <span className="font-mono text-zinc-400">
                    Card {currentFlashcardIndex + 1} de {studyMaterials?.flashcards?.length}
                  </span>
                </div>

                {/* Flip Card */}
                <div
                  onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                  className="min-h-[220px] rounded-2xl border border-indigo-500/30 bg-zinc-900/90 p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-indigo-500/60 transition-all select-none relative group"
                >
                  <span className="absolute top-4 right-4 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    {isFlashcardFlipped ? "Resposta" : "Pergunta (Clique para virar)"}
                  </span>

                  <p className="text-base sm:text-lg font-medium text-white leading-relaxed max-w-lg">
                    {isFlashcardFlipped ? currentCard.back : currentCard.front}
                  </p>

                  <span className="mt-6 text-xs text-indigo-400 flex items-center gap-1 group-hover:underline">
                    <RotateCw size={12} />
                    {isFlashcardFlipped ? "Ver pergunta original" : "Virar e ver resposta explicada"}
                  </span>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentFlashcardIndex === 0}
                    onClick={() => {
                      setCurrentFlashcardIndex((i) => Math.max(0, i - 1));
                      setIsFlashcardFlipped(false);
                    }}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </Button>

                  <Link href="/flashcards">
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white">
                      Abrir modo revisão completo
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      !studyMaterials?.flashcards ||
                      currentFlashcardIndex >= studyMaterials.flashcards.length - 1
                    }
                    onClick={() => {
                      setCurrentFlashcardIndex((i) => i + 1);
                      setIsFlashcardFlipped(false);
                    }}
                    className="gap-1 text-xs"
                  >
                    Próximo <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-zinc-900/30 rounded-xl border border-zinc-800">
                <Zap size={32} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-300">Nenhum flashcard gerado ainda.</p>
                <Button variant="indigo" size="sm" className="mt-4" onClick={handleGenerateMaterials} disabled={isGeneratingMaterials}>
                  <Sparkles size={14} className="mr-1.5" /> Gerar Flashcards com IA
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CRONOGRAMA SEMANAL SUGERIDO */}
        {activeMaterialTab === "cronograma" && (
          <div className="space-y-4">
            {studyMaterials?.studyPlan ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target size={18} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Meta da Semana:</p>
                      <p className="text-sm font-medium text-white">{studyMaterials.studyPlan.weekGoal}</p>
                    </div>
                  </div>
                  <Link href="/cronograma">
                    <Button variant="outline" size="sm" className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20">
                      Ver no Calendário
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                  {studyMaterials.studyPlan.dailySchedule?.map((dayPlan, i) => (
                    <Card key={i} className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
                      <CardContent className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{dayPlan.day.split("-")[0]}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{dayPlan.estimatedMinutes}min</span>
                        </div>
                        <div className="space-y-1">
                          {dayPlan.subjects.map((s, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-800 text-indigo-300 font-normal truncate block max-w-full">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-3 leading-snug">
                          {dayPlan.focus}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-zinc-900/30 rounded-xl border border-zinc-800">
                <Calendar size={32} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-300">Cronograma não gerado.</p>
                <Button variant="indigo" size="sm" className="mt-4" onClick={handleGenerateMaterials} disabled={isGeneratingMaterials}>
                  <Sparkles size={14} className="mr-1.5" /> Montar Cronograma com IA
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* 📊 SEÇÃO DE DESEMPENHO E COBERTURA DO EDITAL */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-12 gap-4">
        {/* Dynamic Radar Chart from Active Edital Subjects */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <Card className="card-hover h-full border-zinc-800 bg-zinc-900/60">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">Radar de Disciplinas</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Top disciplinas do seu edital ativo</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                {activeCurriculum.length} Matérias
              </Badge>
            </CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={230}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    name="Nível Atual"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Subjects Progress in Active Edital */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <Card className="card-hover h-full border-zinc-800 bg-zinc-900/60">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">Disciplinas do Edital</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Categorias e tópicos cadastrados</p>
              </div>
              <Link href="/edital">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-indigo-400 hover:text-white">
                  Ver tudo
                  <ChevronRight size={11} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2.5 max-h-[250px] overflow-y-auto">
              {activeCurriculum.map((subj) => (
                <div key={subj.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color || "#6366f1" }}
                    />
                    <div>
                      <p className="text-xs font-medium text-white">{subj.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {subj.category === "specific" ? "Conhecimentos Específicos" : "Conhecimentos Gerais"} · {subj.topics?.length || 0} tópicos
                      </p>
                    </div>
                  </div>
                  <Link href={`/questoes?subject=${encodeURIComponent(subj.name)}`}>
                    <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2 text-zinc-400 hover:text-indigo-400">
                      Treinar
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prioridades Estratégicas da Banca */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <Card className="card-hover h-full border-zinc-800 bg-zinc-900/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-400" />
                Prioridades da Banca
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Disciplinas com maior peso para o cargo</p>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              {(studyMaterials?.keyTopicsPriority && studyMaterials.keyTopicsPriority.length > 0
                ? studyMaterials.keyTopicsPriority
                : activeCurriculum.slice(0, 5).map((s) => ({ subject: s.name, relevance: "Alta", weight: 3 }))
              ).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 border border-zinc-800">
                  <span className="text-xs font-medium text-zinc-200">{item.subject}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      item.relevance === "Alta"
                        ? "text-red-400 border-red-500/30 bg-red-500/10"
                        : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                    )}
                  >
                    Prioridade {item.relevance}
                  </Badge>
                </div>
              ))}

              <div className="pt-2">
                <Link href="/questoes">
                  <Button variant="indigo" size="sm" className="w-full text-xs h-8 gap-1.5 shadow-sm">
                    <Zap size={12} />
                    <span>Iniciar Simulado das Prioridades</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* 📖 MODAL: LEITOR DE APOSTILA / RESUMO TEÓRICO COMPLETO */}
      <AnimatePresence>
        {selectedSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-900/60">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/30 mb-1">
                    {selectedSummary.subjectName}
                  </Badge>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {selectedSummary.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => setSelectedSummary(null)}
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 font-sans text-sm text-zinc-300 leading-relaxed">
                {/* Key Points */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={14} /> Pontos Essenciais para Memorizar
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-200">
                    {selectedSummary.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Theory Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Resumo Teórico Aprofundado
                  </h4>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {selectedSummary.theorySummary}
                  </div>
                </div>

                {/* Exam Tips Callout */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                    <Lightbulb size={14} /> Dica de Ouro da Banca Examinadora
                  </p>
                  <p className="leading-relaxed">{selectedSummary.examTips}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="gap-1.5 text-xs border-zinc-700"
                >
                  {copiedSummary ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedSummary ? "Copiado!" : "Copiar Resumo"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Link href={`/questoes?subject=${encodeURIComponent(selectedSummary.subjectName)}`}>
                    <Button variant="indigo" size="sm" className="gap-1.5 text-xs">
                      <Zap size={14} />
                      <span>Fazer Questões Deste Tema</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSummary(null)} className="text-xs">
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
