"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  RotateCcw,
  Star,
  StickyNote,
} from "lucide-react";
import { type SubjectData } from "@/lib/curriculum";
import { useActiveCurriculum, useCurriculumStore, useActiveEditalOverview } from "@/store/curriculumStore";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info } from "lucide-react";

type Status = "not_started" | "studying" | "review" | "mastered";

const STATUS_CONFIG: Record<Status, { label: string; class: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  not_started: { label: "Não iniciado", class: "status-not-started", icon: Circle },
  studying: { label: "Estudando", class: "status-studying", icon: BookOpen },
  review: { label: "Revisão", class: "status-review", icon: RotateCcw },
  mastered: { label: "Dominado", class: "status-mastered", icon: CheckCircle2 },
};

// Simulated progress state
const mockProgress: Record<string, { status: Status; progress: number; timeStudied: number }> = {};

export default function EditalPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "general" | "specific">("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(["java", "spring"])
  );
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [topicStatus, setTopicStatus] = useState<Record<string, Status>>({});

  const activeCurriculum = useActiveCurriculum();
  const { editais, activeEditalId, setActiveEdital } = useCurriculumStore();
  const activeTitle = editais.find(e => e.id === activeEditalId)?.title || "Edital Desconhecido";
  const activeOverview = useActiveEditalOverview();

  const filteredCurriculum = activeCurriculum.filter((subj) => {
    if (filter !== "all" && subj.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        subj.name.toLowerCase().includes(q) ||
        subj.topics.some(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.subtopics.some((s) => s.name.toLowerCase().includes(q))
        )
      );
    }
    return true;
  });

  const totalTopics = activeCurriculum.reduce((a, s) => a + s.topics.length, 0);
  const masteredTopics = Object.values(mockProgress).filter((p) => p.status === "mastered").length;
  const studyingTopics = Object.values(topicStatus).filter((s) => s === "studying").length;
  const overallProgress = Math.round((masteredTopics / totalTopics) * 100);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const cycleStatus = (topicId: string) => {
    const cycle: Status[] = ["not_started", "studying", "review", "mastered"];
    const current = topicStatus[topicId] || "not_started";
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    setTopicStatus((prev) => ({ ...prev, [topicId]: next }));
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Resumo do Edital</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe seu progresso em cada disciplina
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <select 
            value={activeEditalId}
            onChange={(e) => setActiveEdital(e.target.value)}
            className="w-full sm:w-[300px] h-10 px-3 py-2 bg-background border rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {editais.map(edital => (
              <option key={edital.id} value={edital.id}>
                {edital.title} {edital.role ? `- ${edital.role}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeOverview && (
        <Card className="mb-6 border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Info size={18} />
              Resumo da Vaga (Análise da IA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {activeOverview}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{overallProgress}%</div>
            <div className="text-xs text-muted-foreground mb-2">Concluído</div>
            <Progress value={overallProgress} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{masteredTopics}</div>
            <div className="text-xs text-muted-foreground">Tópicos dominados</div>
            <div className="text-[11px] text-chart-2 mt-1">de {totalTopics} no total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{studyingTopics}</div>
            <div className="text-xs text-muted-foreground">Em estudo</div>
            <div className="text-[11px] text-blue-500 mt-1">ativos agora</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {totalTopics - masteredTopics - studyingTopics}
            </div>
            <div className="text-xs text-muted-foreground">Não iniciados</div>
            <div className="text-[11px] text-muted-foreground mt-1">restantes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar disciplinas, tópicos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: "all", label: "Todos" },
            { key: "general", label: "Gerais" },
            { key: "specific", label: "Específicos" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilter(key as typeof filter)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Circle size={10} /> Não iniciado</span>
          <span className="flex items-center gap-1"><BookOpen size={10} className="text-blue-500" /> Estudando</span>
          <span className="flex items-center gap-1"><RotateCcw size={10} className="text-amber-500" /> Revisão</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500" /> Dominado</span>
        </div>
      </div>

      {/* Curriculum tree */}
      <div className="space-y-2">
        {filteredCurriculum.map((subject) => (
          <SubjectAccordion
            key={subject.id}
            subject={subject}
            expandedSubjects={expandedSubjects}
            expandedTopics={expandedTopics}
            topicStatus={topicStatus}
            toggleSubject={toggleSubject}
            toggleTopic={toggleTopic}
            cycleStatus={cycleStatus}
            search={search}
          />
        ))}
      </div>
    </div>
  );
}

function SubjectAccordion({
  subject,
  expandedSubjects,
  expandedTopics,
  topicStatus,
  toggleSubject,
  toggleTopic,
  cycleStatus,
  search,
}: {
  subject: SubjectData;
  expandedSubjects: Set<string>;
  expandedTopics: Set<string>;
  topicStatus: Record<string, Status>;
  toggleSubject: (id: string) => void;
  toggleTopic: (id: string) => void;
  cycleStatus: (id: string) => void;
  search: string;
}) {
  const isOpen = expandedSubjects.has(subject.id);
  const masteredCount = subject.topics.filter(
    (t) => topicStatus[t.id] === "mastered"
  ).length;
  const progress = Math.round((masteredCount / subject.topics.length) * 100);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Subject header */}
      <button
        onClick={() => toggleSubject(subject.id)}
        className="w-full flex items-center gap-3 p-3.5 bg-card hover:bg-muted/50 transition-colors text-left"
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: subject.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{subject.name}</span>
            <Badge
              variant={subject.category === "specific" ? "indigo" : "secondary"}
              className="text-[10px]"
            >
              {subject.category === "specific" ? "Específico" : "Geral"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Progress
              value={progress}
              className="w-24 h-1"
              indicatorClassName=""
              style={{ ["--progress-color" as string]: subject.color }}
            />
            <span className="text-[10px] text-muted-foreground">
              {masteredCount}/{subject.topics.length} tópicos · {progress}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            Peso {subject.weight}x
          </Badge>
          {isOpen ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Topics */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="divide-y divide-border">
              {subject.topics.map((topic) => {
                const status = topicStatus[topic.id] || "not_started";
                const statusConf = STATUS_CONFIG[status];
                const isTopicOpen = expandedTopics.has(topic.id);

                return (
                  <div key={topic.id} className="bg-background/50">
                    {/* Topic row */}
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      {/* Status toggle */}
                      <button
                        onClick={() => cycleStatus(topic.id)}
                        title={`Mudar status: ${statusConf.label}`}
                        className="shrink-0"
                      >
                        <statusConf.icon
                          size={14}
                          className={cn(
                            "transition-colors",
                            status === "mastered" && "text-emerald-500",
                            status === "studying" && "text-blue-500",
                            status === "review" && "text-amber-500",
                            status === "not_started" && "text-muted-foreground"
                          )}
                        />
                      </button>

                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <span
                          className={cn(
                            "text-xs font-medium",
                            status === "mastered"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {topic.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({topic.subtopics.length} subtópicos)
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("status-badge text-[10px]", statusConf.class)}
                        >
                          {statusConf.label}
                        </span>
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isTopicOpen ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Subtopics */}
                    <AnimatePresence>
                      {isTopicOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-12 pr-4 pb-2 space-y-1">
                            {topic.subtopics.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center gap-2 py-1 group"
                              >
                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                  {sub.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
