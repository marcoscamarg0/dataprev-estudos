"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Target,
  Zap,
  BookOpen,
  HelpCircle,
  Lock,
  CheckCircle2,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, getXpLevel } from "@/lib/utils";

const ACHIEVEMENTS = [
  {
    id: "first-study",
    name: "Primeiros Passos",
    description: "Complete sua primeira sessão de estudo",
    icon: "🚀",
    xp: 50,
    unlocked: true,
    unlockedAt: "01/06/2026",
  },
  {
    id: "streak-7",
    name: "Uma Semana de Fogo",
    description: "Mantenha um streak de 7 dias consecutivos",
    icon: "🔥",
    xp: 200,
    unlocked: true,
    unlockedAt: "07/06/2026",
  },
  {
    id: "100-questions",
    name: "Centuriador",
    description: "Responda 100 questões",
    icon: "💯",
    xp: 150,
    unlocked: true,
    unlockedAt: "10/06/2026",
  },
  {
    id: "first-exam",
    name: "Examinado",
    description: "Complete seu primeiro simulado",
    icon: "📋",
    xp: 100,
    unlocked: true,
    unlockedAt: "15/06/2026",
  },
  {
    id: "flashcard-master",
    name: "Mestre dos Flashcards",
    description: "Crie 50 flashcards",
    icon: "🃏",
    xp: 100,
    unlocked: false,
    progress: 34,
    target: 50,
  },
  {
    id: "streak-30",
    name: "Um Mês Imparável",
    description: "Mantenha um streak de 30 dias",
    icon: "💪",
    xp: 500,
    unlocked: false,
    progress: 7,
    target: 30,
  },
  {
    id: "1000-questions",
    name: "Milhar",
    description: "Responda 1000 questões",
    icon: "🎯",
    xp: 1000,
    unlocked: false,
    progress: 847,
    target: 1000,
  },
  {
    id: "accuracy-80",
    name: "Precisão Cirúrgica",
    description: "Atinja 80% de taxa de acerto em simulado",
    icon: "🎯",
    xp: 300,
    unlocked: false,
    progress: 74,
    target: 80,
  },
  {
    id: "full-edital",
    name: "Edital Dominado",
    description: "Marque todos os tópicos como Dominado",
    icon: "👑",
    xp: 2000,
    unlocked: false,
    progress: 12,
    target: 100,
  },
  {
    id: "study-100h",
    name: "Centenário",
    description: "Acumule 100 horas de estudo",
    icon: "⏱️",
    xp: 800,
    unlocked: true,
    unlockedAt: "05/07/2026",
  },
  {
    id: "pomodoro-50",
    name: "Rei dos Pomodoros",
    description: "Complete 50 sessões Pomodoro",
    icon: "🍅",
    xp: 250,
    unlocked: false,
    progress: 32,
    target: 50,
  },
  {
    id: "perfect-exam",
    name: "Nota Máxima",
    description: "Tire 90%+ em um simulado completo",
    icon: "⭐",
    xp: 1500,
    unlocked: false,
  },
];

const WEEKLY_MISSIONS = [
  {
    id: "m1",
    title: "Resolver 100 questões",
    icon: HelpCircle,
    progress: 73,
    target: 100,
    xp: 150,
    deadline: "Domingo",
  },
  {
    id: "m2",
    title: "Estudar 20 horas",
    icon: Clock,
    progress: 14.5,
    target: 20,
    xp: 200,
    deadline: "Domingo",
  },
  {
    id: "m3",
    title: "Revisar 50 flashcards",
    icon: BookOpen,
    progress: 50,
    target: 50,
    xp: 100,
    deadline: "Domingo",
    completed: true,
  },
  {
    id: "m4",
    title: "Completar 1 simulado",
    icon: Zap,
    progress: 0,
    target: 1,
    xp: 100,
    deadline: "Domingo",
  },
];

export default function ConquistasPage() {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const xpInfo = getXpLevel(4200);
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  const filtered = ACHIEVEMENTS.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Conquistas & Gamificação</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {unlockedCount} de {ACHIEVEMENTS.length} conquistas desbloqueadas
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* XP Card */}
        <div className="col-span-4">
          <Card className="border-chart-5/20 bg-chart-5/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-chart-5 font-semibold">
                    Nível {xpInfo.level}
                  </p>
                  <p className="text-xl font-bold text-foreground">{xpInfo.name}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-5/20 flex items-center justify-center">
                  <Trophy size={20} className="text-chart-5" />
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{xpInfo.totalXp.toLocaleString()} XP</span>
                  <span className="text-muted-foreground">
                    {xpInfo.max === Infinity ? "MAX" : xpInfo.max.toLocaleString()} XP
                  </span>
                </div>
                <Progress value={xpInfo.progress} indicatorClassName="bg-chart-5" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {xpInfo.max === Infinity
                  ? "Nível máximo atingido!"
                  : `${(xpInfo.max - xpInfo.totalXp).toLocaleString()} XP para o próximo nível`}
              </p>
            </CardContent>
          </Card>

          {/* Streak card */}
          <Card className="mt-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Flame size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">7 dias</p>
                  <p className="text-xs text-muted-foreground">Sequência atual</p>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-6 rounded flex items-center justify-center text-[10px]",
                      i < 7 ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* XP breakdown */}
          <Card className="mt-3">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Ganhar XP</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {[
                { action: "Questão correta", xp: "+10 XP" },
                { action: "Simulado completo", xp: "+100 XP" },
                { action: "Flashcard revisado", xp: "+5 XP" },
                { action: "Tópico dominado", xp: "+50 XP" },
                { action: "Meta diária", xp: "+25 XP" },
                { action: "Streak de 7 dias", xp: "+100 XP" },
              ].map((item) => (
                <div key={item.action} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{item.action}</span>
                  <span className="text-xs font-semibold text-chart-5">{item.xp}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Missions + Achievements */}
        <div className="col-span-8 space-y-4">
          {/* Weekly missions */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Missões Semanais</CardTitle>
                <Badge variant="secondary" className="text-[10px]">Reseta domingo</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 grid grid-cols-2 gap-3">
              {WEEKLY_MISSIONS.map((mission) => (
                <div
                  key={mission.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    mission.completed
                      ? "border-chart-2/30 bg-chart-2/5"
                      : "border-border bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <mission.icon
                        size={13}
                        className={mission.completed ? "text-chart-2" : "text-muted-foreground"}
                      />
                      <span className="text-[11px] font-medium text-foreground">
                        {mission.title}
                      </span>
                    </div>
                    {mission.completed ? (
                      <CheckCircle2 size={13} className="text-chart-2" />
                    ) : (
                      <Badge variant="indigo" className="text-[9px]">+{mission.xp} XP</Badge>
                    )}
                  </div>
                  <Progress
                    value={(mission.progress / mission.target) * 100}
                    className="h-1 mb-1"
                    indicatorClassName={mission.completed ? "bg-chart-2" : "bg-chart-1"}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {mission.completed
                      ? "✓ Concluída"
                      : typeof mission.progress === "number" && typeof mission.target === "number"
                        ? `${mission.progress} / ${mission.target}`
                        : ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Conquistas</h2>
              <div className="flex gap-1">
                {(["all", "unlocked", "locked"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1 rounded text-[11px] font-medium transition-colors",
                      filter === f
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f === "all" ? "Todas" : f === "unlocked" ? "Desbloqueadas" : "Bloqueadas"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden cursor-default",
                      !achievement.unlocked && "opacity-60"
                    )}
                  >
                    {!achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock size={11} className="text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="text-2xl mb-1.5">{achievement.icon}</div>
                      <p className="text-xs font-semibold text-foreground">{achievement.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {achievement.description}
                      </p>
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle2 size={10} className="text-chart-2" />
                          <span className="text-[10px] text-chart-2 font-medium">
                            +{achievement.xp} XP
                          </span>
                        </div>
                      ) : "progress" in achievement ? (
                        <div className="mt-2">
                          <Progress
                            value={((achievement.progress || 0) / (achievement.target || 1)) * 100}
                            className="h-1 mb-0.5"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            {achievement.progress} / {achievement.target}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          +{achievement.xp} XP ao desbloquear
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
