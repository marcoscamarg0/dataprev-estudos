"use client";

import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, calculateApprovalProbability, getDaysUntil, EXAM_DATE } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Brain, Clock, HelpCircle } from "lucide-react";

const radarData = [
  { subject: "Java", value: 0, fullMark: 100 },
  { subject: "Spring", value: 0, fullMark: 100 },
  { subject: "REST", value: 0, fullMark: 100 },
  { subject: "Docker", value: 0, fullMark: 100 },
  { subject: "BD", value: 0, fullMark: 100 },
  { subject: "Redes", value: 0, fullMark: 100 },
  { subject: "DevOps", value: 0, fullMark: 100 },
  { subject: "Testes", value: 0, fullMark: 100 },
  { subject: "Português", value: 0, fullMark: 100 },
  { subject: "Lógica", value: 0, fullMark: 100 },
];

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  acertos: 0,
  questoes: 0,
}));

const pieData = [
  { name: "Corretas", value: 0, color: "hsl(142, 76%, 36%)" },
  { name: "Erradas", value: 0, color: "hsl(0, 84%, 60%)" },
  { name: "Em branco", value: 0, color: "hsl(0, 0%, 45%)" },
];

const subjectBarData = [
  { name: "Java", acerto: 0, questoes: 0 },
  { name: "Spring", acerto: 0, questoes: 0 },
  { name: "Docker", acerto: 0, questoes: 0 },
  { name: "BD", acerto: 0, questoes: 0 },
  { name: "REST", acerto: 0, questoes: 0 },
  { name: "Redes", acerto: 0, questoes: 0 },
  { name: "DevOps", acerto: 0, questoes: 0 },
  { name: "Testes", acerto: 0, questoes: 0 },
];

const WEAK_SUBJECTS = subjectBarData
  .filter((s) => s.acerto < 60)
  .sort((a, b) => a.acerto - b.acerto);

export default function EstatisticasPage() {
  const daysLeft = getDaysUntil(EXAM_DATE);
  const approvalProb = calculateApprovalProbability(0.78, 1847, 127, daysLeft);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Estatísticas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Análise completa do seu desempenho
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-4"
      >
        {/* Overview stats */}
        {[
          { label: "Taxa de Acerto", value: "0%", delta: "0%", up: true, icon: Target },
          { label: "Questões Respondidas", value: "0", delta: "0 esta semana", up: true, icon: HelpCircle },
          { label: "Horas Estudadas", value: "0h", delta: "0h hoje", up: true, icon: Clock },
          { label: "Prob. Aprovação", value: `0%`, delta: "iniciando", up: true, icon: Brain },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="col-span-12 sm:col-span-12 lg:col-span-6 lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 bg-muted rounded-md">
                    <s.icon size={13} className="text-muted-foreground" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-[11px] font-medium",
                    s.up ? "text-chart-2" : "text-red-500"
                  )}>
                    {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {s.delta}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Radar + Pie */}
        <motion.div variants={item} className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Radar de Desempenho por Área</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="hsl(243, 75%, 59%)"
                    fill="hsl(243, 75%, 59%)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-12 sm:col-span-12 lg:col-span-6 lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Distribuição de Respostas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 w-full">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak subjects diagnostic */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Diagnóstico — Pontos Fracos</CardTitle>
                <Badge variant="danger" className="text-[10px]">Ação necessária</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {WEAK_SUBJECTS.map((subj) => (
                <div key={subj.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{subj.name}</span>
                    <span className={cn(
                      "font-medium",
                      subj.acerto < 40 ? "text-red-500" : "text-amber-500"
                    )}>{subj.acerto}%</span>
                  </div>
                  <Progress
                    value={subj.acerto}
                    className="h-1.5"
                    indicatorClassName={subj.acerto < 40 ? "bg-red-500" : "bg-amber-500"}
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {subj.questoes} questões respondidas
                  </p>
                </div>
              ))}
              {WEAK_SUBJECTS.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  <p className="text-sm">Nenhum dado suficiente ainda.</p>
                </div>
              )}
              {WEAK_SUBJECTS.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[11px] text-muted-foreground">
                    💡 <strong>Recomendação:</strong> Estude mais para gerar recomendações.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly evolution */}
        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Evolução — Taxa de Acerto (30 dias)</CardTitle>
                <div className="flex items-center gap-1 text-[11px] text-chart-2">
                  <TrendingUp size={11} />
                  Tendência positiva
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="acertosGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 100]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, "Acerto"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="acertos"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    fill="url(#acertosGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar chart by subject */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Acerto por Disciplina</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={subjectBarData}
                  layout="vertical"
                  margin={{ top: 0, right: 5, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v: unknown) => [`${Number(v)}%`, "Acerto"]}
                  />
                  <Bar
                    dataKey="acerto"
                    radius={[0, 3, 3, 0]}
                    fill="hsl(243, 75%, 59%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projection */}
        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Projeção até a Prova</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Questões projetadas", value: "0", sub: "até o dia da prova", color: "text-chart-1" },
                  { label: "Taxa de acerto projetada", value: "0%", sub: "se mantiver ritmo atual", color: "text-chart-2" },
                  { label: "Horas restantes", value: "0h", sub: `em ${daysLeft} dias`, color: "text-chart-5" },
                ].map((p) => (
                  <div key={p.label} className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className={cn("text-2xl font-bold", p.color)}>{p.value}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground">{p.sub}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <p className="text-xs text-chart-2 font-medium">
                  🎯 Previsão: Faça exercícios e simulados para que o sistema possa projetar sua chance de aprovação.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
