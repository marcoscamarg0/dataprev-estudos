"use client";

import { motion } from "framer-motion";
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
  XCircle,
  Brain,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  generateHeatmapData,
  getHeatmapIntensity,
  calculateApprovalProbability,
  getDaysUntil,
  EXAM_DATE,
  formatMinutes,
  getXpLevel,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock data — será substituído por dados reais da API
const weeklyData = [
  { day: "Seg", hours: 0, questions: 0 },
  { day: "Ter", hours: 0, questions: 0 },
  { day: "Qua", hours: 0, questions: 0 },
  { day: "Qui", hours: 0, questions: 0 },
  { day: "Sex", hours: 0, questions: 0 },
  { day: "Sáb", hours: 0, questions: 0 },
  { day: "Dom", hours: 0, questions: 0 },
];

const radarData = [
  { subject: "Java", value: 0 },
  { subject: "Spring", value: 0 },
  { subject: "REST", value: 0 },
  { subject: "Docker", value: 0 },
  { subject: "BD", value: 0 },
  { subject: "Redes", value: 0 },
  { subject: "DevOps", value: 0 },
  { subject: "Testes", value: 0 },
];

const upcomingRevisions: any[] = [];
const recentActivity: any[] = [];
const heatmapData: any[] = [];

const STATS = [
  {
    label: "Horas Estudadas",
    value: "0h",
    sub: "Nenhuma hoje",
    icon: Clock,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    trend: "-",
    trendUp: true,
  },
  {
    label: "Questões Respondidas",
    value: "0",
    sub: "0% de acerto",
    icon: HelpCircle,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    trend: "-",
    trendUp: true,
  },
  {
    label: "Simulados Feitos",
    value: "0",
    sub: "Média: 0 pts",
    icon: Zap,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    trend: "-",
    trendUp: true,
  },
  {
    label: "Flashcards Revisados",
    value: "0",
    sub: "0 pendentes",
    icon: BookOpen,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    trend: "-",
    trendUp: true,
  },
];

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const daysLeft = getDaysUntil(EXAM_DATE);
  const approvalProbability = 0; // Usuário zerado
  const xpInfo = getXpLevel(0);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Bom dia, {user?.name ? user.name.split(" ")[0] : "Estudante"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {" · "}
              <span className="text-chart-1 font-medium">
                {daysLeft} dias para a prova
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border">
              <Flame size={14} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">0 dias</span>
              <span className="text-xs text-muted-foreground">de sequência</span>
            </div>
            <Link href="/simulados">
              <Button variant="indigo" size="sm">
                <Zap size={13} />
                Iniciar Simulado
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-4"
      >
        {/* Stats row */}
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={item} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="card-hover">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-md", stat.bg)}>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    <TrendingUp
                      size={9}
                      className={stat.trendUp ? "text-chart-2" : "text-red-500"}
                    />
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-chart-2 mt-1 font-medium">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Weekly chart */}
        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <Card className="card-hover">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Horas de Estudo — Semana</CardTitle>
                <div className="flex gap-3">
                  {["Semana", "Mês", "Ano"].map((p) => (
                    <button
                      key={p}
                      className={cn(
                        "text-xs font-medium transition-colors",
                        p === "Semana"
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    formatter={(v: unknown) => [`${Number(v)}h`, "Horas"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(243, 75%, 59%)"
                    strokeWidth={2}
                    fill="url(#hoursGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Approval probability */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <Card className="card-hover h-full">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={14} className="text-chart-5" />
                <span className="text-sm font-semibold">Probabilidade de Aprovação</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke={approvalProbability >= 70 ? "hsl(142, 76%, 36%)" : approvalProbability >= 50 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"}
                      strokeWidth="8"
                      strokeDasharray={`${(approvalProbability / 100) * 314} 314`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{approvalProbability}%</span>
                    <span className="text-[10px] text-muted-foreground">chance</span>
                  </div>
                </div>
                <Badge
                  variant={approvalProbability >= 70 ? "success" : approvalProbability >= 50 ? "warning" : "danger"}
                  className="mt-3"
                >
                  {approvalProbability >= 70 ? "Bom ritmo! 🎯" : approvalProbability >= 50 ? "Acelere o ritmo ⚡" : "Precisa de mais foco 🔥"}
                </Badge>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Baseado na sua taxa de acerto, horas estudadas e tempo restante
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Heatmap */}
        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <Card className="card-hover">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Atividade de Estudos</CardTitle>
                <span className="text-xs text-muted-foreground">Últimos 12 meses</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <HeatmapCalendar data={heatmapData} />
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-muted-foreground">Menos</span>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn("heatmap-cell w-3 h-3", `heatmap-${i}`)}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground">Mais</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radar chart */}
        <motion.div variants={item} className="col-span-12 sm:col-span-6 lg:col-span-4">
          <Card className="card-hover h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Radar de Desempenho</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    name="Desempenho"
                    dataKey="value"
                    stroke="hsl(243, 75%, 59%)"
                    fill="hsl(243, 75%, 59%)"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress by subject */}
        <motion.div variants={item} className="col-span-12 sm:col-span-6 lg:col-span-4">
          <Card className="card-hover h-full">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Progresso do Edital</CardTitle>
                <Link href="/edital">
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                    Ver tudo
                    <ChevronRight size={11} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {[
                { name: "Java", progress: 0, color: "#f59e0b" },
                { name: "Spring", progress: 0, color: "#22c55e" },
                { name: "Docker/K8s", progress: 0, color: "#0ea5e9" },
                { name: "Banco de Dados", progress: 0, color: "#84cc16" },
                { name: "REST / APIs", progress: 0, color: "#06b6d4" },
                { name: "DevOps", progress: 0, color: "#a855f7" },
                { name: "Português", progress: 0, color: "#6366f1" },
              ].map((subj) => (
                <div key={subj.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{subj.name}</span>
                    <span className="text-xs text-muted-foreground">{subj.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subj.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: subj.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming revisions */}
        <motion.div variants={item} className="col-span-12 sm:col-span-6 lg:col-span-4">
          <Card className="card-hover h-full">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Próximas Revisões</CardTitle>
                <Link href="/revisoes">
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                    Ver todas
                    <ChevronRight size={11} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              {upcomingRevisions.length > 0 ? (
                upcomingRevisions.map((rev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{rev.topic}</p>
                      <p className="text-[10px] text-muted-foreground">{rev.interval}</p>
                    </div>
                    <Badge variant={i === 0 ? "danger" : "warning"} className="text-[10px]">
                      {rev.date}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BookOpen size={24} className="text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Nenhuma revisão hoje</p>
                  <p className="text-[10px] text-muted-foreground">Comece a estudar para gerar revisões</p>
                </div>
              )}
              <div className="pt-1">
                <Link href="/flashcards">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    <BookOpen size={12} />
                    Revisar Flashcards (0)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activity + XP */}
        <motion.div variants={item} className="col-span-12 sm:col-span-6 lg:col-span-4">
          <Card className="card-hover h-full">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Nível & XP</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-chart-5/20 flex items-center justify-center">
                    <Trophy size={14} className="text-chart-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{xpInfo.name}</p>
                    <p className="text-[10px] text-muted-foreground">Nível {xpInfo.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-chart-1">{xpInfo.totalXp.toLocaleString()} XP</p>
                  <p className="text-[10px] text-muted-foreground">
                    até {xpInfo.max === Infinity ? "∞" : xpInfo.max.toLocaleString()}
                  </p>
                </div>
              </div>
              <Progress value={xpInfo.progress} className="mb-4" />

              <div className="space-y-2 mt-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Atividade recente</p>
                {recentActivity.length > 0 ? (
                  recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        {act.type === "question" ? (
                          <HelpCircle size={10} className="text-muted-foreground" />
                        ) : act.type === "flashcard" ? (
                          <BookOpen size={10} className="text-muted-foreground" />
                        ) : (
                          <Clock size={10} className="text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground">{act.text}</p>
                        <p className="text-[10px] text-muted-foreground">{act.time}</p>
                      </div>
                    </div>
                    {act.correct !== null && (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={10} className="text-chart-2" />
                        <span className="text-[10px] text-chart-2 font-medium">{act.correct}</span>
                      </div>
                    )}
                  </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2 text-center">Nenhuma atividade ainda.</p>
                )}
              </div>

              {/* Daily goal */}
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Target size={12} className="text-chart-1" />
                    <span className="text-xs font-medium">Meta diária</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">0 / 4h</span>
                </div>
                <Progress value={0} indicatorClassName="bg-chart-2" />
                <p className="text-[10px] text-muted-foreground mt-1">Comece a estudar para bater a meta!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Heatmap component
function HeatmapCalendar({ data }: { data: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  // Pad to start on Sunday
  if (data.length > 0) {
    const firstDay = new Date(data[0].date).getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: "", count: -1 });
    }
  }

  data.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: "", count: -1 });
    weeks.push(currentWeek);
  }

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-1" style={{ minWidth: "max-content" }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date ? `${day.date}: ${day.count} sessões` : ""}
                className={cn(
                  "heatmap-cell w-3 h-3",
                  day.count === -1
                    ? "opacity-0"
                    : `heatmap-${getHeatmapIntensity(day.count)}`
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
