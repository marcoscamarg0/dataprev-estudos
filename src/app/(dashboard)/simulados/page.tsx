"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  Zap,
  Settings,
  CheckCircle2,
  XCircle,
  BarChart2,
  ChevronRight,
  Timer,
  Target,
  RefreshCw,
  ChevronLeft,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useActiveCurriculum, useActiveEditalTitle } from "@/store/curriculumStore";
import { cn, formatTime } from "@/lib/utils";

const SIMULADO_TYPES = [
  {
    id: "full",
    title: "Simulado Completo",
    description: "90 questões · 4h · Todas as disciplinas",
    icon: "📋",
    color: "border-chart-1/30 bg-chart-1/5",
    badgeColor: "indigo",
    questions: 90,
    duration: 240,
  },
  {
    id: "quick",
    title: "Simulado Rápido",
    description: "20 questões · 30min · Mix de disciplinas",
    icon: "⚡",
    color: "border-chart-2/30 bg-chart-2/5",
    badgeColor: "success",
    questions: 20,
    duration: 30,
  },
  {
    id: "custom",
    title: "Simulado Personalizado",
    description: "Escolha disciplinas, quantidade e tempo",
    icon: "🎯",
    color: "border-chart-3/30 bg-chart-3/5",
    badgeColor: "warning",
    questions: null,
    duration: null,
  },
  {
    id: "adaptive",
    title: "Simulado Adaptativo (IA)",
    description: "Foca nos seus pontos fracos automaticamente",
    icon: "🤖",
    color: "border-chart-5/30 bg-chart-5/5",
    badgeColor: "info",
    questions: 30,
    duration: 45,
  },
];

const MOCK_RESULTS: any[] = [];

export default function SimuladosPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const activeCurriculum = useActiveCurriculum();
  const activeTitle = useActiveEditalTitle();

  const [examMode, setExamMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const startSimulado = async () => {
    setIsGenerating(true);
    try {
      const type = SIMULADO_TYPES.find(t => t.id === selectedType);
      const qCount = type?.questions || 10;
      
      const shuffledSubjects = [...activeCurriculum].sort(() => 0.5 - Math.random());
      const selectedSubjects = shuffledSubjects.slice(0, 3); // Max 3 subjects to keep API fast

      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editalTitle: activeTitle,
          subjects: selectedSubjects,
          count: Math.min(qCount, 5) // Limit max questions for the demo to prevent timeouts
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar simulado");
      const data = await res.json();
      
      if (data.questions && data.questions.length > 0) {
        const processedQuestions = data.questions.map((q: any, i: number) => ({
          ...q,
          id: q.id || `gen-${Date.now()}-${i}`
        }));
        setQuestions(processedQuestions);
        setAnswers({});
        setCurrentIndex(0);
        setFinished(false);
        setExamMode(true);
      } else {
        throw new Error("Formato de questões vazio ou inválido.");
      }
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar simulado com IA. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (qId: string, letter: string) => {
    if (finished) return;
    setAnswers(prev => ({ ...prev, [qId]: letter }));
  };

  const finishExam = () => {
    setFinished(true);
  };

  if (examMode) {
    const currentQuestion = questions[currentIndex];
    const answered = answers[currentQuestion.id];
    
    // Calcula acertos se finalizado
    let correctCount = 0;
    if (finished) {
      questions.forEach(q => {
        const ans = answers[q.id];
        if (ans && q.alternatives.find((a:any) => a.letter === ans)?.isCorrect) correctCount++;
      });
    }

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => setExamMode(false)}>
            <ChevronLeft size={14} /> Sair
          </Button>
          <div className="text-sm font-semibold">
            {finished ? "Resultado Final" : `Questão ${currentIndex + 1} de ${questions.length}`}
          </div>
        </div>

        {finished ? (
          <Card>
            <CardContent className="p-10 text-center">
              <h2 className="text-2xl font-bold mb-2">Simulado Concluído!</h2>
              <div className="text-4xl font-black text-indigo-500 mb-6">
                {Math.round((correctCount / questions.length) * 100)}%
              </div>
              <p className="text-muted-foreground mb-6">
                Você acertou {correctCount} de {questions.length} questões.
              </p>
              <Button onClick={() => setExamMode(false)}>Voltar aos Simulados</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-6 h-1" />
            
            <Card className="mb-6">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">
                    {currentQuestion.subject} - {currentQuestion.topic}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-sm leading-relaxed font-normal whitespace-pre-wrap">
                  {currentQuestion.statement}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {currentQuestion.alternatives.map((alt: any) => (
                    <button
                      key={alt.letter}
                      onClick={() => handleAnswer(currentQuestion.id, alt.letter)}
                      className={cn(
                        "w-full text-left flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors",
                        answered === alt.letter ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 mt-0.5",
                          answered === alt.letter
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {alt.letter}
                      </div>
                      <span className="text-sm pt-1">{alt.text}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                Anterior
              </Button>
              <Button
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex(i => i + 1);
                  } else {
                    finishExam();
                  }
                }}
              >
                {currentIndex < questions.length - 1 ? "Próxima" : "Finalizar Simulado"}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Simulados</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Teste seus conhecimentos com simulados focados no edital: <strong className="font-medium text-foreground">{activeTitle}</strong>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Simulados feitos", value: "0", icon: "📋", color: "text-foreground" },
          { label: "Média de pontuação", value: "0%", icon: "📊", color: "text-chart-2" },
          { label: "Melhor resultado", value: "0%", icon: "🏆", color: "text-amber-500" },
          { label: "Questões respondidas", value: "0", icon: "✅", color: "text-chart-1" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className={cn("text-xl font-bold", s.color)}>{s.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Exam types */}
        <div className="col-span-12 lg:col-span-7">
          <h2 className="text-sm font-semibold mb-3">Iniciar Simulado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SIMULADO_TYPES.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer border-2 transition-all duration-150",
                    type.color,
                    selectedType === type.id ? "ring-2 ring-chart-1" : ""
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{type.icon}</span>
                      <Badge variant={type.badgeColor as "indigo" | "success" | "warning" | "info"} className="text-[10px]">
                        {type.questions ? `${type.questions}Q` : "Custom"}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{type.title}</h3>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      {type.duration && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock size={10} />
                          {type.duration >= 60 ? `${type.duration / 60}h` : `${type.duration}min`}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg border border-chart-1/20 bg-chart-1/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {SIMULADO_TYPES.find((t) => t.id === selectedType)?.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pronto para começar? O timer inicia automaticamente.
                  </p>
                </div>
                <Button variant="indigo" size="sm" onClick={startSimulado} disabled={isGenerating}>
                  {isGenerating ? (
                    <><Bot className="animate-pulse mr-2" size={13} /> Gerando com IA...</>
                  ) : (
                    <><Play className="mr-2" size={13} /> Iniciar Agora</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent results */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-sm font-semibold mb-3">Resultados Recentes</h2>
          <div className="space-y-3">
            {MOCK_RESULTS.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhum simulado realizado ainda.</p>
              </div>
            )}
            {MOCK_RESULTS.map((result) => (
              <Card key={result.id} className="card-hover cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{result.title}</p>
                      <p className="text-[10px] text-muted-foreground">{result.date} · {result.time}</p>
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold",
                        result.score >= 70 ? "text-chart-2" : result.score >= 50 ? "text-amber-500" : "text-red-500"
                      )}
                    >
                      {result.score}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-[10px] text-chart-2">
                      <CheckCircle2 size={10} />
                      {result.correct} corretas
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-red-500">
                      <XCircle size={10} />
                      {result.total - result.correct} erradas
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      de {result.total}
                    </span>
                  </div>
                  <Progress
                    value={result.score}
                    indicatorClassName={result.score >= 70 ? "bg-chart-2" : result.score >= 50 ? "bg-amber-500" : "bg-red-500"}
                  />
                  <div className="flex gap-1.5 mt-2">
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2">
                      <BarChart2 size={10} />
                      Ver análise
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2">
                      <RefreshCw size={10} />
                      Refazer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Approval progress */}
          <Card className="mt-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={13} className="text-chart-1" />
                <span className="text-xs font-semibold">Nota de Corte Estimada</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Conhecimentos Gerais", note: 0, goal: 60 },
                  { label: "Conhecimentos Específicos", note: 0, goal: 70 },
                  { label: "Média Geral", note: 0, goal: 65 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{item.label}</span>
                      <span className={item.note >= item.goal ? "text-chart-2" : "text-amber-500"}>
                        {item.note} / {item.goal} pontos
                      </span>
                    </div>
                    <Progress
                      value={(item.note / 100) * 100}
                      className="h-1"
                      indicatorClassName={item.note >= item.goal ? "bg-chart-2" : "bg-amber-500"}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
