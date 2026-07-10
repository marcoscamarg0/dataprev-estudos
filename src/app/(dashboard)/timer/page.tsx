"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Coffee,
  BookOpen,
  ChevronDown,
  Check,
  Flame,
  Clock,
  BarChart2,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatTime, formatMinutes } from "@/lib/utils";
import { useActiveCurriculum } from "@/store/curriculumStore";
import { useTimerStore } from "@/store";

interface StudySession {
  topicName: string;
  duration: number; // minutes
  type: "pomodoro" | "free";
  timestamp: Date;
}

const MOCK_HISTORY: StudySession[] = [
  { topicName: "Java — Generics", duration: 25, type: "pomodoro", timestamp: new Date(Date.now() - 2 * 3600000) },
  { topicName: "Spring Boot", duration: 50, type: "pomodoro", timestamp: new Date(Date.now() - 4 * 3600000) },
  { topicName: "Docker", duration: 35, type: "free", timestamp: new Date(Date.now() - 86400000) },
  { topicName: "Banco de Dados", duration: 75, type: "free", timestamp: new Date(Date.now() - 2 * 86400000) },
  { topicName: "REST APIs", duration: 25, type: "pomodoro", timestamp: new Date(Date.now() - 2 * 86400000) },
];

export default function TimerPage() {
  const activeCurriculum = useActiveCurriculum();
  
  const TOPICS_FLAT = activeCurriculum.flatMap((s) =>
    s.topics.map((t) => ({ id: t.id, name: `${s.name} — ${t.name}`, subjectColor: s.color }))
  );
  const {
    isRunning,
    mode,
    seconds,
    pomodoroPhase,
    pomodoroCount,
    selectedTopicId,
    start,
    pause,
    reset,
    tick,
    setMode,
    setTopic,
  } = useTimerStore();

  const [history, setHistory] = useState<StudySession[]>(MOCK_HISTORY);
  const [topicSearch, setTopicSearch] = useState("");
  const [showTopicSelect, setShowTopicSelect] = useState(false);
  const [freeSeconds, setFreeSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedTopic = TOPICS_FLAT.find((t) => t.id === selectedTopicId);

  const totalTodayMinutes = history
    .filter((s) => {
      const today = new Date();
      const st = new Date(s.timestamp);
      return st.getDate() === today.getDate();
    })
    .reduce((acc, s) => acc + s.duration, 0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "pomodoro") {
          tick();
        } else {
          setFreeSeconds((s) => s + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, tick]);

  const handleStartPause = () => {
    if (isRunning) pause();
    else start();
  };

  const handleReset = () => {
    reset();
    setFreeSeconds(0);
  };

  const pomodoroTotal = pomodoroPhase === "work" ? 25 * 60 : pomodoroPhase === "break" ? 5 * 60 : 15 * 60;
  const progressValue = mode === "pomodoro" ? ((pomodoroTotal - seconds) / pomodoroTotal) * 100 : 0;
  const displaySeconds = mode === "pomodoro" ? seconds : freeSeconds;

  const phaseConfig = {
    work: { label: "Foco", color: "text-chart-1", bg: "bg-chart-1", ring: "border-chart-1/30" },
    break: { label: "Pausa Curta", color: "text-chart-2", bg: "bg-chart-2", ring: "border-chart-2/30" },
    "long-break": { label: "Pausa Longa", color: "text-chart-5", bg: "bg-chart-5", ring: "border-chart-5/30" },
  };
  const phase = phaseConfig[pomodoroPhase];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Timer de Estudos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pomodoro & Cronômetro Livre · {formatMinutes(totalTodayMinutes)} estudados hoje
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Timer main */}
        <div className="col-span-5">
          <Card className="h-full">
            <CardContent className="p-6">
              {/* Mode selector */}
              <div className="flex gap-1 mb-6 p-1 bg-muted rounded-md">
                {(["pomodoro", "free"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); handleReset(); }}
                    className={cn(
                      "flex-1 py-1.5 rounded text-xs font-medium transition-all",
                      mode === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m === "pomodoro" ? "🍅 Pomodoro" : "⏱ Livre"}
                  </button>
                ))}
              </div>

              {/* Timer display */}
              <div className="flex flex-col items-center">
                {/* Circular progress */}
                <div className="relative w-52 h-52 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    {mode === "pomodoro" && (
                      <circle
                        cx="100" cy="100" r="90"
                        fill="none"
                        stroke={pomodoroPhase === "work" ? "hsl(243, 75%, 59%)" : pomodoroPhase === "break" ? "hsl(142, 76%, 36%)" : "hsl(262, 83%, 58%)"}
                        strokeWidth="6"
                        strokeDasharray={`${(progressValue / 100) * 565} 565`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {mode === "pomodoro" && (
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", phase.color)}>
                        {phase.label}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground font-mono tracking-tight">
                      {formatTime(displaySeconds)}
                    </span>
                    {mode === "pomodoro" && (
                      <span className="text-[10px] text-muted-foreground mt-1">
                        #{pomodoroCount + 1} pomodoro
                      </span>
                    )}
                    {mode === "free" && isRunning && (
                      <span className="text-[10px] text-muted-foreground mt-1 animate-pulse">
                        em andamento...
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw size={14} />
                  </Button>
                  <Button
                    onClick={handleStartPause}
                    variant="indigo"
                    className="w-28 h-10"
                  >
                    {isRunning ? (
                      <>
                        <Pause size={14} />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        {displaySeconds === 0 ? "Iniciar" : "Continuar"}
                      </>
                    )}
                  </Button>
                </div>

                {/* Pomodoro phases */}
                {mode === "pomodoro" && (
                  <div className="grid grid-cols-3 gap-2 w-full mb-4">
                    {[
                      { phase: "work", label: "Foco", duration: "25min", icon: "🎯" },
                      { phase: "break", label: "Pausa", duration: "5min", icon: "☕" },
                      { phase: "long-break", label: "Longa", duration: "15min", icon: "🌟" },
                    ].map((p) => (
                      <div
                        key={p.phase}
                        className={cn(
                          "p-2 rounded-md text-center border",
                          pomodoroPhase === p.phase
                            ? "bg-chart-1/10 border-chart-1/30"
                            : "border-border"
                        )}
                      >
                        <p className="text-base">{p.icon}</p>
                        <p className="text-[10px] font-medium">{p.label}</p>
                        <p className="text-[10px] text-muted-foreground">{p.duration}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pomodoro dots */}
                {mode === "pomodoro" && (
                  <div className="flex gap-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all",
                          i < pomodoroCount % 4 ? "bg-chart-1" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="col-span-7 space-y-4">
          {/* Topic selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={13} className="text-muted-foreground" />
                <span className="text-xs font-semibold">Estudando agora</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowTopicSelect((v) => !v)}
                  className="w-full flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {selectedTopic && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: selectedTopic.subjectColor }}
                      />
                    )}
                    <span className="text-sm text-foreground">
                      {selectedTopic?.name || "Selecionar matéria..."}
                    </span>
                  </div>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {showTopicSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-1 z-10 bg-card border border-border rounded-md shadow-lg"
                    >
                      <div className="p-2">
                        <input
                          autoFocus
                          placeholder="Buscar..."
                          value={topicSearch}
                          onChange={(e) => setTopicSearch(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {TOPICS_FLAT.filter((t) =>
                          t.name.toLowerCase().includes(topicSearch.toLowerCase())
                        ).slice(0, 12).map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTopic(t.id);
                              setShowTopicSelect(false);
                              setTopicSearch("");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-left"
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.subjectColor }} />
                            <span className="text-xs text-foreground">{t.name}</span>
                            {selectedTopicId === t.id && <Check size={11} className="ml-auto text-chart-1" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Today's stats */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Hoje</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Tempo total", value: formatMinutes(totalTodayMinutes), icon: Clock },
                  { label: "Sessões", value: history.filter((s) => {
                    const today = new Date();
                    return new Date(s.timestamp).getDate() === today.getDate();
                  }).length.toString(), icon: Flame },
                  { label: "Pomodoros", value: pomodoroCount.toString(), icon: Timer },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-md bg-muted/30">
                    <s.icon size={16} className="text-muted-foreground mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Meta diária</span>
                  <span>{formatMinutes(totalTodayMinutes)} / 4h</span>
                </div>
                <Progress value={Math.min((totalTodayMinutes / 240) * 100, 100)} />
              </div>
            </CardContent>
          </Card>

          {/* Recent sessions */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Sessões Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {history.slice(0, 5).map((session, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        session.type === "pomodoro" ? "bg-red-400" : "bg-blue-400"
                      )} />
                      <span className="text-xs text-foreground">{session.topicName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatMinutes(session.duration)}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {session.type === "pomodoro" ? "🍅" : "⏱"}
                      </Badge>
                    </div>
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
