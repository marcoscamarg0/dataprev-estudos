"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  BookOpen,
  Zap,
  Target,
  Brain,
  RefreshCw,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatMinutes, getDaysUntil, EXAM_DATE } from "@/lib/utils";
import { DATAPREV_CURRICULUM } from "@/lib/curriculum";

// Auto-generated schedule based on weak subjects and days remaining
const SCHEDULE_TODAY = [
  {
    time: "07:00–08:30",
    subject: "DevOps e CI/CD",
    topic: "GitHub Actions e Pipelines",
    duration: 90,
    type: "study",
    priority: "alta",
    color: "#a855f7",
  },
  {
    time: "09:00–10:30",
    subject: "Redes e Protocolos",
    topic: "TCP/IP, HTTP/HTTPS, TLS",
    duration: 90,
    type: "study",
    priority: "alta",
    color: "#38bdf8",
  },
  {
    time: "10:45–11:30",
    subject: "Java",
    topic: "Revisão — Generics",
    duration: 45,
    type: "review",
    priority: "média",
    color: "#f59e0b",
  },
  {
    time: "14:00–15:30",
    subject: "Questões",
    topic: "20 questões de Docker/K8s",
    duration: 90,
    type: "practice",
    priority: "alta",
    color: "#0ea5e9",
  },
  {
    time: "16:00–16:30",
    subject: "Flashcards",
    topic: "Revisar 30 cards Spring/Java",
    duration: 30,
    type: "flashcard",
    priority: "média",
    color: "#6366f1",
  },
];

const WEEK_SUMMARY = [
  { day: "Seg", hours: 4, done: true },
  { day: "Ter", hours: 4, done: true },
  { day: "Qua", hours: 3.5, done: true },
  { day: "Qui", hours: 4, done: false, isToday: true },
  { day: "Sex", hours: 4, done: false },
  { day: "Sáb", hours: 5, done: false },
  { day: "Dom", hours: 2, done: false },
];

const TYPE_ICONS = {
  study: BookOpen,
  review: RefreshCw,
  practice: Zap,
  flashcard: Brain,
};

const TYPE_LABELS = {
  study: "Estudo",
  review: "Revisão",
  practice: "Questões",
  flashcard: "Flashcards",
};

export default function CronogramaPage() {
  const [view, setView] = useState<"hoje" | "semana" | "mes">("hoje");
  const daysLeft = getDaysUntil(EXAM_DATE);
  const todayTotal = SCHEDULE_TODAY.reduce((a, s) => a + s.duration, 0);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Cronograma Inteligente</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerado automaticamente baseado nos seus pontos fracos e {daysLeft} dias restantes
          </p>
        </div>
        <Button variant="indigo" size="sm">
          <Brain size={13} />
          Regenerar com IA
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Schedule */}
        <div className="col-span-8">
          {/* View toggle */}
          <div className="flex gap-1 mb-4 p-1 bg-muted rounded-md w-fit">
            {(["hoje", "semana", "mes"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-1.5 rounded text-xs font-medium capitalize transition-all",
                  view === v
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {view === "hoje" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">
                    {new Date().toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMinutes(todayTotal)} planejados
                  </p>
                </div>
                <Badge variant="indigo" className="text-[10px]">
                  Gerado por IA
                </Badge>
              </div>

              <div className="space-y-2">
                {SCHEDULE_TODAY.map((item, i) => {
                  const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || BookOpen;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Card className={cn("card-hover border-l-2")} style={{ borderLeftColor: item.color }}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="text-[11px] text-muted-foreground font-mono w-20 shrink-0">
                              {item.time}
                            </div>
                            <div
                              className="p-1.5 rounded-md shrink-0"
                              style={{ backgroundColor: `${item.color}20` }}
                            >
                              <Icon size={12} style={{ color: item.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">{item.topic}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subject}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-[10px]">
                                {formatMinutes(item.duration)}
                              </Badge>
                              <Badge
                                variant={item.priority === "alta" ? "danger" : "warning"}
                                className="text-[10px]"
                              >
                                {item.priority}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "semana" && (
            <div className="grid grid-cols-7 gap-2">
              {WEEK_SUMMARY.map((day) => (
                <Card
                  key={day.day}
                  className={cn(
                    "text-center",
                    day.isToday && "border-chart-1",
                    day.done && "opacity-60"
                  )}
                >
                  <CardContent className="p-3">
                    <p className={cn("text-xs font-medium mb-2", day.isToday && "text-chart-1")}>
                      {day.day}
                    </p>
                    <p className="text-lg font-bold text-foreground">{day.hours}h</p>
                    {day.done && (
                      <Badge variant="success" className="text-[9px] mt-1">
                        ✓
                      </Badge>
                    )}
                    {day.isToday && (
                      <Badge variant="indigo" className="text-[9px] mt-1">
                        hoje
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {view === "mes" && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  Visualização mensal disponível em breve. Use o modo "Semana" para ver sua programação semanal.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Stats & Plan */}
        <div className="col-span-4 space-y-4">
          {/* Daily progress */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Progresso de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold text-chart-2">2h 30min</span>
                <span className="text-xs text-muted-foreground mb-1">de {formatMinutes(todayTotal)}</span>
              </div>
              <Progress value={(150 / todayTotal) * 100} />
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label: "Concluídas", value: "2", color: "text-chart-2" },
                  { label: "Pendentes", value: `${SCHEDULE_TODAY.length - 2}`, color: "text-amber-500" },
                ].map((s) => (
                  <div key={s.label} className="p-2 bg-muted/30 rounded-md text-center">
                    <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority subjects */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Foco desta Semana</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              {[
                { name: "DevOps e CI/CD", progress: 35, color: "#a855f7" },
                { name: "Redes e Protocolos", progress: 40, color: "#38bdf8" },
                { name: "Docker/Kubernetes", progress: 48, color: "#0ea5e9" },
              ].map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{s.name}</span>
                    <span className="text-muted-foreground">{s.progress}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.progress}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Exam countdown */}
          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-chart-1" />
                <span className="text-xs font-semibold text-chart-1">Contagem Regressiva</span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{daysLeft} dias</p>
              <p className="text-[11px] text-muted-foreground">até a prova DATAPREV 2026</p>
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Horas planejadas restantes</span>
                  <span className="font-medium">{daysLeft * 4}h</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Questões por dia (meta)</span>
                  <span className="font-medium">40 questões</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
