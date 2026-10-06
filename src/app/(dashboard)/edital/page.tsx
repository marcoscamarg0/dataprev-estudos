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
  Info,
  Sparkles,
  Globe,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  RefreshCw,
  Flame,
  Award,
  BookCheck,
  HelpCircle,
  Layers,
  Check,
  Edit2,
  ShieldAlert,
  FileText,
  Compass,
  Target,
  ArrowRight,
  Zap,
  X,
} from "lucide-react";
import {
  type SubjectData,
  type TopicData,
  type TopicBancaAnalysis,
  type BancaEditalProfile,
} from "@/lib/curriculum";
import {
  useActiveCurriculum,
  useCurriculumStore,
  useActiveEditalOverview,
  useActiveEdital,
  useActiveEditalBanca,
  useActiveEditalBancaProfile,
} from "@/store/curriculumStore";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

type Status = "not_started" | "studying" | "review" | "mastered";

const STATUS_CONFIG: Record<
  Status,
  { label: string; class: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  not_started: { label: "Não iniciado", class: "status-not-started", icon: Circle },
  studying: { label: "Estudando", class: "status-studying", icon: BookOpen },
  review: { label: "Revisão", class: "status-review", icon: RotateCcw },
  mastered: { label: "Dominado", class: "status-mastered", icon: CheckCircle2 },
};

const COMMON_BANCAS = [
  "FGV",
  "Cebraspe (CESPE)",
  "FCC (Fundação Carlos Chagas)",
  "Cesgranrio",
  "Vunesp",
  "Quadrix",
  "AOCP",
  "IBFC",
];

export default function EditalPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "general" | "specific">("all");
  const [relevanceFilter, setRelevanceFilter] = useState<"all" | "Alta" | "Média" | "Baixa">("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(["java", "spring", "camara-eng-software", "camara-arquitetura"])
  );
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [topicStatus, setTopicStatus] = useState<Record<string, Status>>({});
  const [showBancaDossier, setShowBancaDossier] = useState(true);
  const [isResearchingAll, setIsResearchingAll] = useState(false);
  const [researchingTopicId, setResearchingTopicId] = useState<string | null>(null);
  const [editingBanca, setEditingBanca] = useState(false);
  const [customBanca, setCustomBanca] = useState("");
  const [selectedTopicForModal, setSelectedTopicForModal] = useState<{
    subject: SubjectData;
    topic: TopicData;
  } | null>(null);

  const activeCurriculum = useActiveCurriculum();
  const activeEdital = useActiveEdital();
  const activeBanca = useActiveEditalBanca();
  const activeBancaProfile = useActiveEditalBancaProfile();
  const activeOverview = useActiveEditalOverview();

  const {
    editais,
    activeEditalId,
    setActiveEdital,
    updateEditalBanca,
    setEditalBancaProfile,
    updateTopicBancaAnalysis,
  } = useCurriculumStore();

  const activeTitle = editais.find((e) => e.id === activeEditalId)?.title || "Edital Desconhecido";

  // Filter curriculum based on category, search, and relevance
  const filteredCurriculum = activeCurriculum
    .map((subj) => {
      if (filter !== "all" && subj.category !== filter) return null;

      const matchingTopics = subj.topics.filter((t) => {
        // Relevance filter
        if (relevanceFilter !== "all") {
          const imp = t.bancaAnalysis?.importance || "Média";
          if (imp !== relevanceFilter) return false;
        }

        // Search filter
        if (search) {
          const q = search.toLowerCase();
          const matchesName = t.name.toLowerCase().includes(q);
          const matchesSub = t.subtopics.some((s) => s.name.toLowerCase().includes(q));
          const matchesTraps = t.bancaAnalysis?.commonTraps?.some((trap) =>
            trap.toLowerCase().includes(q)
          );
          const matchesQuestions = t.bancaAnalysis?.frequentQuestions?.some((fq) =>
            fq.toLowerCase().includes(q)
          );
          const matchesStyle = t.bancaAnalysis?.approachStyle?.toLowerCase().includes(q);
          const matchesSubj = subj.name.toLowerCase().includes(q);
          return matchesName || matchesSub || matchesTraps || matchesQuestions || matchesStyle || matchesSubj;
        }

        return true;
      });

      if (matchingTopics.length === 0 && search) return null;

      return {
        ...subj,
        topics: matchingTopics.length > 0 ? matchingTopics : subj.topics,
      };
    })
    .filter(Boolean) as SubjectData[];

  const totalTopics = activeCurriculum.reduce((a, s) => a + s.topics.length, 0);
  const masteredTopics = Object.values(topicStatus).filter((s) => s === "mastered").length;
  const studyingTopics = Object.values(topicStatus).filter((s) => s === "studying").length;
  const highPriorityTopics = activeCurriculum.reduce(
    (acc, s) =>
      acc +
      s.topics.filter(
        (t) => t.bancaAnalysis?.importance === "Alta" || (!t.bancaAnalysis && s.weight >= 2.5)
      ).length,
    0
  );
  const overallProgress = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

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

  // Handle Full Edital Banca Research with IA
  const handleResearchFullEdital = async () => {
    try {
      setIsResearchingAll(true);
      toast.info(`Iniciando pesquisa web na banca "${activeBanca}" para todos os conteúdos...`, {
        description: "A IA está cruzando dados de provas recentes e tendências da internet.",
      });

      const res = await fetch("/api/ai/research-banca-edital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banca: activeBanca,
          role: activeEdital.role || "Desenvolvedor de Software",
          editalTitle: activeTitle,
          curriculum: activeCurriculum,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha na pesquisa web da banca");
      }

      if (data.bancaProfile && data.curriculum) {
        setEditalBancaProfile(activeEditalId, data.bancaProfile, data.curriculum);
        setShowBancaDossier(true);
        toast.success(`Pesquisa concluída para a banca ${activeBanca}!`, {
          description: "Dossiê atualizado com tendências 2024-2026 e classificação de relevância.",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro na pesquisa da banca com IA", {
        description: err.message || "Verifique sua conexão ou tente novamente.",
      });
    } finally {
      setIsResearchingAll(false);
    }
  };

  // Handle Single Topic Live Web Research
  const handleResearchTopic = async (
    subject: SubjectData,
    topic: TopicData,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    try {
      setResearchingTopicId(topic.id);
      toast.info(`Pesquisando na web: "${topic.name}" na banca ${activeBanca}...`);

      const res = await fetch("/api/ai/research-banca-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banca: activeBanca,
          role: activeEdital.role || "Desenvolvedor de Software",
          editalTitle: activeTitle,
          subjectName: subject.name,
          topicName: topic.name,
          subtopics: topic.subtopics.map((s) => s.name),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao pesquisar tópico");
      }

      if (data.analysis) {
        updateTopicBancaAnalysis(activeEditalId, subject.id, topic.id, data.analysis);
        // Also expand topic so user sees the result immediately
        setExpandedTopics((prev) => new Set(prev).add(topic.id));
        setExpandedSubjects((prev) => new Set(prev).add(subject.id));
        toast.success(`Raio-X da Banca gerado para: ${topic.name}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao pesquisar tópico com IA", {
        description: err.message,
      });
    } finally {
      setResearchingTopicId(null);
    }
  };

  const handleSaveBanca = (newBanca: string) => {
    if (!newBanca.trim()) return;
    updateEditalBanca(activeEditalId, newBanca.trim());
    setEditingBanca(false);
    toast.success(`Banca atualizada para "${newBanca.trim()}"`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" />
              Conteúdo Programático & Raio-X da Banca
            </h1>
            <Badge variant="outline" className="text-xs bg-muted/60 border-primary/20">
              <Globe className="w-3 h-3 mr-1 text-primary animate-pulse" />
              IA com Pesquisa Web Ativa
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Análise aprofundada de incidência, pegadinhas e padrão de cobrança da banca examinadora
            para cada conteúdo do edital.
          </p>
        </div>

        {/* Action Controls & Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Edital Selector */}
          <div className="w-full sm:w-auto">
            <select
              value={activeEditalId}
              onChange={(e) => setActiveEdital(e.target.value)}
              className="w-full sm:w-[260px] h-9 px-3 py-1.5 bg-background border border-border rounded-md text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {editais.map((edital) => (
                <option key={edital.id} value={edital.id}>
                  {edital.title} {edital.role ? `(${edital.role})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Banca Badge / Quick Editor */}
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1 rounded-md">
            <span className="text-xs text-muted-foreground">Banca:</span>
            {editingBanca ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  defaultValue={activeBanca}
                  placeholder="Ex: FGV, Cebraspe"
                  className="h-7 px-2 text-xs bg-muted rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary w-28"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveBanca(e.currentTarget.value);
                    if (e.key === "Escape") setEditingBanca(false);
                  }}
                  onBlur={(e) => handleSaveBanca(e.target.value)}
                />
              </div>
            ) : (
              <button
                onClick={() => setEditingBanca(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline group"
                title="Clique para alterar a banca"
              >
                <span>{activeBanca || "Definir Banca"}</span>
                <Edit2 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Global AI Web Research CTA */}
          <Button
            onClick={handleResearchFullEdital}
            disabled={isResearchingAll}
            className="h-9 px-3.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {isResearchingAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Pesquisando Banca na Web...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Pesquisar Banca & Conteúdos na Web
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Banca Dossier / Raio-X Section */}
      {activeBancaProfile && (
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-background to-purple-950/10 shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    Dossiê da Banca: {activeBancaProfile.bancaName || activeBanca}
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      Raio-X de Prova
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Padrões de cobrança, tendências da internet e estratégia de resolução de prova
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setShowBancaDossier((prev) => !prev)}
              >
                {showBancaDossier ? "Recolher" : "Expandir Dossiê"}
                {showBancaDossier ? (
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                )}
              </Button>
            </div>
          </CardHeader>

          <AnimatePresence>
            {showBancaDossier && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CardContent className="p-4 pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* General Profile */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-card/60 border border-border/50">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
                      <Target className="w-4 h-4" />
                      <span>Perfil Pedagógico da Banca</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeBancaProfile.generalProfile}
                    </p>
                  </div>

                  {/* Scoring Characteristics */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-card/60 border border-border/50">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                      <Award className="w-4 h-4" />
                      <span>Critérios & Modelo de Pontuação</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeBancaProfile.scoringCharacteristics}
                    </p>
                  </div>

                  {/* Recommended Strategy */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-card/60 border border-border/50">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span>Estratégia Tática Recomendada</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeBancaProfile.recommendedStrategy}
                    </p>
                  </div>

                  {/* Recent Web Trends */}
                  {activeBancaProfile.recentTrends && activeBancaProfile.recentTrends.length > 0 && (
                    <div className="md:col-span-2 lg:col-span-3 space-y-2 p-3 rounded-lg bg-card/40 border border-border/50">
                      <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span>Tendências Recentes Mapeadas na Web (2024-2026):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeBancaProfile.recentTrends.map((trend, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 bg-background/50 p-2 rounded border border-border/30"
                          >
                            <span className="text-primary font-bold">✓</span>
                            <span className="text-muted-foreground text-[11px] leading-relaxed">
                              {trend}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progresso Global</span>
              <span className="text-xs font-semibold text-primary">{overallProgress}%</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-2">{overallProgress}%</div>
            <Progress value={overallProgress} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Alta Incidência na Banca</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{highPriorityTopics}</div>
            <div className="text-[11px] text-rose-400 mt-0.5">Tópicos cruciais da {activeBanca}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Tópicos Dominados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{masteredTopics}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">de {totalTopics} tópicos no total</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Em Estudo / Revisão</span>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{studyingTopics}</div>
            <div className="text-[11px] text-blue-400 mt-0.5">ativos no momento</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-card/60 border border-border rounded-lg">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Buscar por matéria, tópico, pegadinha ou conceito ${activeBanca}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <div className="flex items-center bg-muted/40 p-0.5 rounded border border-border">
            {(
              [
                { key: "all", label: "Todos" },
                { key: "general", label: "Gerais" },
                { key: "specific", label: "Específicos" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium rounded transition-colors",
                  filter === key
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Relevance Filter */}
          <div className="flex items-center bg-muted/40 p-0.5 rounded border border-border">
            {(
              [
                { key: "all", label: "Relevância: Todas" },
                { key: "Alta", label: "🔥 Alta" },
                { key: "Média", label: "⚡ Média" },
                { key: "Baixa", label: "📘 Baixa" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRelevanceFilter(key)}
                className={cn(
                  "px-2 py-1 text-[11px] font-medium rounded transition-colors",
                  relevanceFilter === key
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
          <span className="flex items-center gap-1">
            <Circle size={10} /> Não iniciado
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} className="text-blue-500" /> Estudando
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw size={10} className="text-amber-500" /> Revisão
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-500" /> Dominado
          </span>
        </div>
      </div>

      {/* Curriculum Subject Accordion List */}
      <div className="space-y-3">
        {filteredCurriculum.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border p-6">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">Nenhum conteúdo encontrado</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tente ajustar seus termos de busca ou filtros de relevância.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setRelevanceFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          filteredCurriculum.map((subject) => (
            <SubjectAccordion
              key={subject.id}
              subject={subject}
              activeBanca={activeBanca}
              activeEditalRole={activeEdital.role}
              expandedSubjects={expandedSubjects}
              expandedTopics={expandedTopics}
              topicStatus={topicStatus}
              toggleSubject={toggleSubject}
              toggleTopic={toggleTopic}
              cycleStatus={cycleStatus}
              researchingTopicId={researchingTopicId}
              onResearchTopic={handleResearchTopic}
              onOpenTopicModal={(subj, top) => setSelectedTopicForModal({ subject: subj, topic: top })}
            />
          ))
        )}
      </div>

      {/* Detailed Modal / Dossier for a specific Topic */}
      {selectedTopicForModal && (
        <TopicDetailModal
          subject={selectedTopicForModal.subject}
          topic={selectedTopicForModal.topic}
          activeBanca={activeBanca}
          status={topicStatus[selectedTopicForModal.topic.id] || "not_started"}
          onClose={() => setSelectedTopicForModal(null)}
          onCycleStatus={() => cycleStatus(selectedTopicForModal.topic.id)}
          onResearchTopic={(subj, top) => handleResearchTopic(subj, top)}
          isResearching={researchingTopicId === selectedTopicForModal.topic.id}
        />
      )}
    </div>
  );
}

// Subject Accordion Component
function SubjectAccordion({
  subject,
  activeBanca,
  activeEditalRole,
  expandedSubjects,
  expandedTopics,
  topicStatus,
  toggleSubject,
  toggleTopic,
  cycleStatus,
  researchingTopicId,
  onResearchTopic,
  onOpenTopicModal,
}: {
  subject: SubjectData;
  activeBanca: string;
  activeEditalRole?: string;
  expandedSubjects: Set<string>;
  expandedTopics: Set<string>;
  topicStatus: Record<string, Status>;
  toggleSubject: (id: string) => void;
  toggleTopic: (id: string) => void;
  cycleStatus: (id: string) => void;
  researchingTopicId: string | null;
  onResearchTopic: (subject: SubjectData, topic: TopicData, e?: React.MouseEvent) => void;
  onOpenTopicModal: (subject: SubjectData, topic: TopicData) => void;
}) {
  const isOpen = expandedSubjects.has(subject.id);
  const masteredCount = subject.topics.filter(
    (t) => topicStatus[t.id] === "mastered"
  ).length;
  const progress =
    subject.topics.length > 0
      ? Math.round((masteredCount / subject.topics.length) * 100)
      : 0;

  const highPriorityCount = subject.topics.filter(
    (t) => t.bancaAnalysis?.importance === "Alta"
  ).length;

  return (
    <div className="rounded-lg border border-border bg-card/40 overflow-hidden shadow-xs">
      {/* Subject Header */}
      <button
        onClick={() => toggleSubject(subject.id)}
        className="w-full flex items-center gap-3 p-3.5 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: subject.color || "#6366f1" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">{subject.name}</span>
            <Badge
              variant={subject.category === "specific" ? "indigo" : "secondary"}
              className="text-[10px] py-0 px-1.5"
            >
              {subject.category === "specific" ? "Específico" : "Geral"}
            </Badge>

            {highPriorityCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 border-rose-500/30 text-rose-400 bg-rose-500/10"
              >
                <Flame className="w-2.5 h-2.5 mr-0.5" />
                {highPriorityCount} alta incidência
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <Progress
              value={progress}
              className="w-24 h-1.5"
              style={{ ["--progress-color" as string]: subject.color }}
            />
            <span className="text-[11px] text-muted-foreground">
              {masteredCount}/{subject.topics.length} tópicos · {progress}%
            </span>
            {subject.bancaSubjectOverview && (
              <span className="hidden md:inline text-[11px] text-indigo-400 truncate max-w-md">
                • {subject.bancaSubjectOverview}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-[10px] font-mono">
            Peso {subject.weight}x
          </Badge>
          {isOpen ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Topics List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/80"
          >
            <div className="divide-y divide-border/60 bg-background/50">
              {subject.topics.map((topic) => {
                const status = topicStatus[topic.id] || "not_started";
                const statusConf = STATUS_CONFIG[status];
                const isTopicOpen = expandedTopics.has(topic.id);
                const isResearchingThis = researchingTopicId === topic.id;
                const analysis = topic.bancaAnalysis;

                return (
                  <div key={topic.id} className="transition-colors hover:bg-muted/10">
                    {/* Topic Main Row */}
                    <div className="flex items-center gap-2.5 px-4 py-3">
                      {/* Status Toggle Button */}
                      <button
                        onClick={() => cycleStatus(topic.id)}
                        title={`Status: ${statusConf.label} (Clique para alterar)`}
                        className="shrink-0 p-1 hover:scale-110 transition-transform"
                      >
                        <statusConf.icon
                          size={15}
                          className={cn(
                            "transition-colors",
                            status === "mastered" && "text-emerald-500",
                            status === "studying" && "text-blue-500",
                            status === "review" && "text-amber-500",
                            status === "not_started" && "text-muted-foreground"
                          )}
                        />
                      </button>

                      {/* Topic Name and Subtopics trigger */}
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                      >
                        <span
                          className={cn(
                            "text-xs font-semibold transition-colors",
                            status === "mastered"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {topic.name}
                        </span>

                        <span className="text-[10px] text-muted-foreground shrink-0">
                          ({topic.subtopics.length} subtópicos)
                        </span>
                      </button>

                      {/* Banca Importance & Approach Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {analysis?.importance === "Alta" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <Flame size={11} />
                            Alta Incidência
                          </span>
                        )}
                        {analysis?.importance === "Média" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Zap size={11} />
                            Média
                          </span>
                        )}
                        {analysis?.importance === "Baixa" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            Baixa
                          </span>
                        )}

                        {analysis?.approachStyle && (
                          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 truncate max-w-[140px]">
                            {analysis.approachStyle}
                          </span>
                        )}

                        {/* Raio-X Modal Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 gap-1"
                          onClick={() => onOpenTopicModal(subject, topic)}
                          title="Abrir Raio-X detalhado da banca para este conteúdo"
                        >
                          <Compass size={12} />
                          <span className="hidden md:inline">Raio-X</span>
                        </Button>

                        {/* Live Web Research Single Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isResearchingThis}
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 border-border/70"
                          onClick={(e) => onResearchTopic(subject, topic, e)}
                          title={`Pesquisar tendências da banca ${activeBanca} na web`}
                        >
                          {isResearchingThis ? (
                            <RefreshCw size={11} className="animate-spin text-primary" />
                          ) : (
                            <Globe size={11} className="text-primary" />
                          )}
                          <span className="hidden lg:inline">
                            {isResearchingThis ? "Pesquisando..." : "Pesquisar Web"}
                          </span>
                        </Button>

                        {/* Toggle Topic Chevron */}
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
                        >
                          {isTopicOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Topic Details: Subtopics + Banca Research Panel */}
                    <AnimatePresence>
                      {isTopicOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-muted/20 border-t border-border/40 p-4 space-y-4"
                        >
                          {/* Subtopics Checklist */}
                          <div>
                            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Layers size={12} className="text-primary" />
                              Subtópicos contemplados no edital
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {topic.subtopics.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-2 p-1.5 rounded bg-background/60 border border-border/40 text-xs text-muted-foreground"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                                  <span className="truncate">{sub.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Banca Analysis Block */}
                          {analysis ? (
                            <div className="rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-background to-card p-4 space-y-3 text-xs shadow-xs">
                              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-indigo-400" />
                                  <span className="font-bold text-foreground">
                                    Perfil da Banca {activeBanca} para "{topic.name}"
                                  </span>
                                  <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-300">
                                    {analysis.approachStyle}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  Incidência Estimada: <strong className="text-foreground">{analysis.importance} ({analysis.relevanceScore || 8}/10)</strong>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Frequent Concepts */}
                                {analysis.frequentQuestions && analysis.frequentQuestions.length > 0 && (
                                  <div className="space-y-1.5 bg-background/50 p-2.5 rounded border border-border/40">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                                      <Target size={13} className="text-indigo-400" />
                                      O que a {activeBanca} mais cobra neste tópico:
                                    </span>
                                    <ul className="space-y-1 text-muted-foreground text-[11px] list-none">
                                      {analysis.frequentQuestions.map((fq, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                          <span className="text-indigo-400 font-bold">•</span>
                                          <span>{fq}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Common Traps */}
                                {analysis.commonTraps && analysis.commonTraps.length > 0 && (
                                  <div className="space-y-1.5 bg-amber-500/5 p-2.5 rounded border border-amber-500/20">
                                    <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px]">
                                      <AlertTriangle size={13} />
                                      Pegadinhas & Armadilhas Clássicas:
                                    </span>
                                    <ul className="space-y-1 text-muted-foreground text-[11px] list-none">
                                      {analysis.commonTraps.map((trap, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                          <span className="text-amber-400 font-bold">⚠️</span>
                                          <span>{trap}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* How to study */}
                              {analysis.howToStudy && (
                                <div className="space-y-1 p-2.5 rounded bg-background/40 border border-border/40">
                                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                                    <Lightbulb size={13} />
                                    Orientação Tática de Estudo:
                                  </span>
                                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                                    {analysis.howToStudy}
                                  </p>
                                </div>
                              )}

                              {/* Web References */}
                              {analysis.webReferences && analysis.webReferences.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                                    <Globe size={12} className="text-blue-400" />
                                    Fontes & Documentações Pesquisadas na Internet:
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.webReferences.map((ref, i) => (
                                      <a
                                        key={i}
                                        href={ref.url || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted/70 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
                                      >
                                        <ExternalLink size={11} className="text-primary" />
                                        <span className="font-medium truncate max-w-[200px]">
                                          {ref.title}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4 rounded-lg border border-dashed border-border bg-card/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                              <div>
                                <h4 className="text-xs font-semibold text-foreground">
                                  Perfil da banca ainda não pesquisado para este tópico
                                </h4>
                                <p className="text-[11px] text-muted-foreground">
                                  Descubra como a banca {activeBanca} cobra esse assunto, suas armadilhas e referências.
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => onResearchTopic(subject, topic, e)}
                                disabled={isResearchingThis}
                                className="text-xs gap-1.5 shrink-0"
                              >
                                {isResearchingThis ? (
                                  <RefreshCw size={12} className="animate-spin text-primary" />
                                ) : (
                                  <Sparkles size={12} className="text-primary" />
                                )}
                                Pesquisar com IA
                              </Button>
                            </div>
                          )}
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

// Full Topic Dossier Modal
function TopicDetailModal({
  subject,
  topic,
  activeBanca,
  status,
  onClose,
  onCycleStatus,
  onResearchTopic,
  isResearching,
}: {
  subject: SubjectData;
  topic: TopicData;
  activeBanca: string;
  status: Status;
  onClose: () => void;
  onCycleStatus: () => void;
  onResearchTopic: (subject: SubjectData, topic: TopicData) => void;
  isResearching: boolean;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const statusConf = STATUS_CONFIG[status];
  const analysis = topic.bancaAnalysis;
  const sampleQ = analysis?.sampleQuestionSnippet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-start justify-between gap-4 bg-muted/20">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-primary">{subject.name}</span>
              <Badge variant="secondary" className="text-[10px]">
                {subject.category === "specific" ? "Específico" : "Geral"}
              </Badge>
              {analysis?.importance && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    analysis.importance === "Alta"
                      ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Incidência {analysis.importance}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{topic.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Status and Action bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status do Estudo:</span>
              <button
                onClick={onCycleStatus}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border",
                  statusConf.class
                )}
              >
                <statusConf.icon size={13} />
                {statusConf.label}
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={isResearching}
              onClick={() => onResearchTopic(subject, topic)}
              className="text-xs gap-1.5 h-8"
            >
              {isResearching ? (
                <RefreshCw size={12} className="animate-spin text-primary" />
              ) : (
                <Globe size={12} className="text-primary" />
              )}
              {isResearching ? "Pesquisando..." : "Atualizar Pesquisa Web"}
            </Button>
          </div>

          {/* Subtopics */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-primary" />
              Subtópicos deste Conteúdo ({topic.subtopics.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topic.subtopics.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-2 rounded bg-background border border-border/60 text-xs text-muted-foreground"
                >
                  <Check size={12} className="text-primary shrink-0" />
                  <span>{sub.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Banca Analysis */}
          {analysis ? (
            <div className="space-y-4">
              {/* Style & Relevancy */}
              <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                    <Compass size={14} />
                    Padrão de Cobrança da Banca {activeBanca}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-indigo-500/20 text-indigo-300">
                    {analysis.approachStyle}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A banca costuma cobrar este assunto com <strong>{analysis.approachStyle}</strong>,
                  apresentando relevância estimada de <strong>{analysis.importance} ({analysis.relevanceScore || 8}/10)</strong>.
                </p>
              </div>

              {/* Grid of Frequent Concepts & Traps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Frequent Concepts */}
                {analysis.frequentQuestions && analysis.frequentQuestions.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-card border border-border/60 space-y-2">
                    <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Target size={14} className="text-indigo-400" />
                      Conceitos Mais Cobrados:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground list-none">
                      {analysis.frequentQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary font-bold">✓</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Traps */}
                {analysis.commonTraps && analysis.commonTraps.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      Pegadinhas & Armadilhas da {activeBanca}:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground list-none">
                      {analysis.commonTraps.map((trap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">⚠️</span>
                          <span>{trap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tactical Study Advice */}
              {analysis.howToStudy && (
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    Como Estudar este Conteúdo:
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {analysis.howToStudy}
                  </p>
                </div>
              )}

              {/* Sample Question Snippet */}
              {sampleQ && typeof sampleQ === "object" && (
                <div className="p-4 rounded-lg bg-card border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <FileText size={14} className="text-primary" />
                      Questão Típica no Estilo da Banca {activeBanca}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] text-primary"
                      onClick={() => setShowAnswer((prev) => !prev)}
                    >
                      {showAnswer ? "Ocultar Gabarito" : "Ver Gabarito Comentado"}
                    </Button>
                  </div>

                  <p className="text-xs text-foreground/90 font-medium leading-relaxed bg-muted/30 p-2.5 rounded">
                    {sampleQ.statement}
                  </p>

                  {sampleQ.alternatives && (
                    <div className="space-y-1 pl-2">
                      {sampleQ.alternatives.map((alt, i) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          {alt}
                        </div>
                      ))}
                    </div>
                  )}

                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 space-y-1"
                    >
                      <div className="font-bold text-emerald-400 text-xs">
                        Gabarito: {sampleQ.correctAnswer || "A"}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {sampleQ.explanation}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Web References */}
              {analysis.webReferences && analysis.webReferences.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Globe size={13} className="text-blue-400" />
                    Fontes Pesquisadas na Internet:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.webReferences.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded bg-muted/40 hover:bg-muted/70 border border-border/50 text-xs transition-colors group block"
                      >
                        <div className="flex items-center justify-between text-primary font-semibold mb-0.5">
                          <span className="truncate">{ref.title}</span>
                          <ExternalLink size={12} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        {ref.snippet && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {ref.snippet}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-lg space-y-3">
              <Compass className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <p className="text-xs text-muted-foreground">
                Nenhum dossiê gerado ainda para este tópico na banca {activeBanca}.
              </p>
              <Button
                onClick={() => onResearchTopic(subject, topic)}
                disabled={isResearching}
                size="sm"
                className="gap-1.5 text-xs"
              >
                {isResearching ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                Pesquisar este Tópico na Web com IA
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/80 flex items-center justify-between bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Fechar
          </Button>
          <Button
            size="sm"
            onClick={onCycleStatus}
            className="text-xs gap-1.5"
          >
            <CheckCircle2 size={13} />
            Avançar Status: {statusConf.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
