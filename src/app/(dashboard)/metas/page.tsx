"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, CheckCircle2, Circle, TrendingUp, Clock, BookOpen, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  target: number;
  current: number;
  unit: string;
  period: "daily" | "weekly" | "monthly";
  color: string;
}

const GOALS: Goal[] = [
  {
    id: "daily-hours",
    type: "hours",
    label: "Horas de estudo",
    icon: Clock,
    target: 4,
    current: 2.5,
    unit: "h",
    period: "daily",
    color: "#4f46e5",
  },
  {
    id: "daily-questions",
    type: "questions",
    label: "Questões respondidas",
    icon: Zap,
    target: 40,
    current: 28,
    unit: " questões",
    period: "daily",
    color: "#22c55e",
  },
  {
    id: "daily-flashcards",
    type: "flashcards",
    label: "Flashcards revisados",
    icon: BookOpen,
    target: 30,
    current: 30,
    unit: " cards",
    period: "daily",
    color: "#f59e0b",
  },
  {
    id: "weekly-hours",
    type: "hours",
    label: "Horas semanais",
    icon: Clock,
    target: 28,
    current: 14.5,
    unit: "h",
    period: "weekly",
    color: "#4f46e5",
  },
  {
    id: "weekly-questions",
    type: "questions",
    label: "Questões na semana",
    icon: Zap,
    target: 200,
    current: 143,
    unit: " questões",
    period: "weekly",
    color: "#22c55e",
  },
  {
    id: "monthly-exams",
    type: "exams",
    label: "Simulados no mês",
    icon: RefreshCw,
    target: 4,
    current: 2,
    unit: " simulados",
    period: "monthly",
    color: "#0ea5e9",
  },
];

export default function MetasPage() {
  const [periodFilter, setPeriodFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");

  const filtered = GOALS.filter((g) => periodFilter === "all" || g.period === periodFilter);
  const completedToday = GOALS.filter((g) => g.period === "daily" && g.current >= g.target).length;
  const dailyGoals = GOALS.filter((g) => g.period === "daily").length;

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Metas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe suas metas diárias, semanais e mensais
          </p>
        </div>
        <Button variant="indigo" size="sm">
          <Plus size={13} />
          Nova Meta
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Metas diárias concluídas",
            value: `${completedToday}/${dailyGoals}`,
            color: completedToday === dailyGoals ? "text-chart-2" : "text-amber-500",
            bg: completedToday === dailyGoals ? "bg-chart-2/10" : "bg-amber-500/10",
          },
          {
            label: "Sequência atual",
            value: "7 dias",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Metas concluídas (mês)",
            value: "23/30",
            color: "text-chart-1",
            bg: "bg-chart-1/10",
          },
        ].map((s) => (
          <Card key={s.label} className={cn("border-0", s.bg)}>
            <CardContent className="p-4">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period filter */}
      <div className="flex gap-1 mb-4">
        {(["all", "daily", "weekly", "monthly"] as const).map((p) => (
          <Button
            key={p}
            variant={periodFilter === p ? "default" : "ghost"}
            size="sm"
            className="h-8 text-xs capitalize"
            onClick={() => setPeriodFilter(p)}
          >
            {p === "all" ? "Todas" : p === "daily" ? "Diárias" : p === "weekly" ? "Semanais" : "Mensais"}
          </Button>
        ))}
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {filtered.map((goal) => {
          const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
          const completed = goal.current >= goal.target;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(completed && "border-chart-2/30")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-2.5 rounded-lg shrink-0"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <goal.icon size={16} className="opacity-90" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{goal.label}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {goal.period === "daily" ? "Diária" : goal.period === "weekly" ? "Semanal" : "Mensal"}
                          </Badge>
                          {completed && (
                            <Badge variant="success" className="text-[10px]">
                              ✓ Concluída
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: completed ? "hsl(142, 76%, 36%)" : goal.color }}>
                          {goal.current}{goal.unit} / {goal.target}{goal.unit}
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        indicatorClassName={completed ? "bg-chart-2" : undefined}
                        style={!completed ? { ["--tw-bg-opacity" as string]: "1" } : undefined}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {percentage}% concluído
                        </span>
                        {!completed && (
                          <span className="text-[10px] text-muted-foreground">
                            Faltam {(goal.target - goal.current).toFixed(goal.unit === "h" ? 1 : 0)}{goal.unit}
                          </span>
                        )}
                      </div>
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
