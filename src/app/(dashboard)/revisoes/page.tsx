"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const INTERVALS = [1, 7, 15, 30, 60, 90];

interface Revision {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  subjectColor: string;
  interval: number;
  scheduledAt: Date;
  completedAt: Date | null;
}

// Generate mock revisions
const MOCK_REVISIONS: Revision[] = [
  {
    id: "r1",
    topicId: "java-fundamentos",
    topicName: "Fundamentos de Java",
    subjectName: "Java",
    subjectColor: "#f59e0b",
    interval: 7,
    scheduledAt: new Date(),
    completedAt: null,
  },
  {
    id: "r2",
    topicId: "spring-boot",
    topicName: "Spring Boot",
    subjectName: "Spring Framework",
    subjectColor: "#22c55e",
    interval: 1,
    scheduledAt: new Date(),
    completedAt: null,
  },
  {
    id: "r3",
    topicId: "docker-core",
    topicName: "Docker",
    subjectName: "Docker e Kubernetes",
    subjectColor: "#0ea5e9",
    interval: 15,
    scheduledAt: new Date(Date.now() + 3 * 86400000),
    completedAt: null,
  },
  {
    id: "r4",
    topicId: "bd-relacional",
    topicName: "Banco de Dados Relacional",
    subjectName: "Banco de Dados",
    subjectColor: "#84cc16",
    interval: 30,
    scheduledAt: new Date(Date.now() + 7 * 86400000),
    completedAt: null,
  },
  {
    id: "r5",
    topicId: "rest-principios",
    topicName: "Princípios REST",
    subjectName: "REST e APIs",
    subjectColor: "#06b6d4",
    interval: 7,
    scheduledAt: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 86400000),
  },
];

function getDaysFromNow(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function RevisoesPage() {
  const [revisions, setRevisions] = useState<Revision[]>(MOCK_REVISIONS);

  const today = revisions.filter(
    (r) => !r.completedAt && getDaysFromNow(r.scheduledAt) <= 0
  );
  const upcoming = revisions.filter(
    (r) => !r.completedAt && getDaysFromNow(r.scheduledAt) > 0
  );
  const completed = revisions.filter((r) => r.completedAt !== null);

  const markComplete = (id: string) => {
    setRevisions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completedAt: new Date() } : r))
    );
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Revisões</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Sistema de repetição espaçada · intervalos: 1, 7, 15, 30, 60, 90 dias
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Para hoje", value: today.length, color: today.length > 0 ? "text-red-500" : "text-chart-2" },
          { label: "Esta semana", value: revisions.filter((r) => !r.completedAt && getDaysFromNow(r.scheduledAt) <= 7 && getDaysFromNow(r.scheduledAt) > 0).length, color: "text-amber-500" },
          { label: "Próximas", value: upcoming.length, color: "text-foreground" },
          { label: "Concluídas", value: completed.length, color: "text-chart-2" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interval explanation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {INTERVALS.map((interval, i) => (
          <div
            key={interval}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border shrink-0"
          >
            <RefreshCw size={10} className="text-chart-1" />
            <span className="text-[11px] font-medium">
              {interval === 1 ? "1 dia" : `${interval} dias`}
            </span>
          </div>
        ))}
        <span className="text-[11px] text-muted-foreground flex items-center">
          → ciclo completo em 3 meses
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Today's revisions */}
        <div className="col-span-7">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle size={13} className="text-red-500" />
            Para revisar hoje ({today.length})
          </h2>
          {today.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 size={32} className="text-chart-2 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Tudo em dia!</p>
                <p className="text-xs text-muted-foreground">Nenhuma revisão pendente para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {today.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className={cn("border-l-2", `border-l-red-500`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: rev.subjectColor }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{rev.topicName}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {rev.subjectName} · Intervalo {rev.interval}d
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="danger" className="text-[10px]">
                            Atrasado
                          </Badge>
                          <Button
                            variant="indigo"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => markComplete(rev.id)}
                          >
                            <CheckCircle2 size={11} />
                            Revisei
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          <h2 className="text-sm font-semibold mb-3 mt-6 flex items-center gap-2">
            <Calendar size={13} className="text-chart-1" />
            Próximas revisões
          </h2>
          <div className="space-y-2">
            {upcoming.slice(0, 6).map((rev) => {
              const daysLeft = getDaysFromNow(rev.scheduledAt);
              return (
                <Card key={rev.id} className="card-hover">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: rev.subjectColor }}
                        />
                        <div>
                          <p className="text-xs font-medium text-foreground">{rev.topicName}</p>
                          <p className="text-[10px] text-muted-foreground">{rev.subjectName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={daysLeft <= 3 ? "warning" : "secondary"}
                          className="text-[10px]"
                        >
                          {daysLeft === 1 ? "amanhã" : `em ${daysLeft} dias`}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {rev.interval}d
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-5 space-y-4">
          {/* Completion rate */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Taxa de Conclusão</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-center mb-3">
                <p className="text-3xl font-bold text-chart-2">
                  {revisions.length > 0
                    ? Math.round((completed.length / revisions.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">das revisões concluídas</p>
              </div>
              <Progress value={(completed.length / Math.max(revisions.length, 1)) * 100} />
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                {completed.length} de {revisions.length} revisões
              </p>
            </CardContent>
          </Card>

          {/* Schedule add */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Agendar Revisão</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Após marcar um tópico como "Dominado" no Edital, as revisões são
                agendadas automaticamente nos intervalos: 1, 7, 15, 30, 60 e 90 dias.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                <BookOpen size={12} />
                Ir para o Edital
              </Button>
            </CardContent>
          </Card>

          {/* Recently completed */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Concluídas Recentemente</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {completed.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma concluída ainda.</p>
              ) : (
                <div className="space-y-2">
                  {completed.map((rev) => (
                    <div key={rev.id} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-chart-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">{rev.topicName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {rev.completedAt?.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
