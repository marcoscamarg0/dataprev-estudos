"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Library,
  Plus,
  Search,
  FileText,
  Link as LinkIcon,
  Video,
  BookOpen,
  ExternalLink,
  Download,
  Trash2,
  Tag,
  Filter,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ItemType = "pdf" | "link" | "video" | "book";

interface LibraryItem {
  id: string;
  type: ItemType;
  title: string;
  url?: string;
  subjectName: string;
  subjectColor: string;
  tags: string[];
  addedAt: Date;
  description?: string;
}

const TYPE_CONFIG: Record<ItemType, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string; bg: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-red-500", bg: "bg-red-500/10" },
  link: { icon: Globe, label: "Link", color: "text-blue-500", bg: "bg-blue-500/10" },
  video: { icon: Video, label: "Vídeo", color: "text-red-600", bg: "bg-red-600/10" },
  book: { icon: BookOpen, label: "Livro", color: "text-amber-500", bg: "bg-amber-500/10" },
};

const MOCK_ITEMS: LibraryItem[] = [
  {
    id: "l1",
    type: "pdf",
    title: "Edital DATAPREV 2026 — FGV",
    subjectName: "Geral",
    subjectColor: "#6366f1",
    tags: ["edital", "dataprev", "fgv"],
    addedAt: new Date(Date.now() - 86400000),
    description: "Edital oficial do concurso DATAPREV 2026",
  },
  {
    id: "l2",
    type: "link",
    title: "Documentação oficial Spring Boot",
    url: "https://spring.io/projects/spring-boot",
    subjectName: "Spring Framework",
    subjectColor: "#22c55e",
    tags: ["spring", "boot", "documentação"],
    addedAt: new Date(Date.now() - 2 * 86400000),
    description: "Documentação completa do Spring Boot",
  },
  {
    id: "l3",
    type: "video",
    title: "Docker para Desenvolvedores Java",
    url: "https://youtube.com/watch?v=...",
    subjectName: "Docker e Kubernetes",
    subjectColor: "#0ea5e9",
    tags: ["docker", "java", "tutorial"],
    addedAt: new Date(Date.now() - 3 * 86400000),
    description: "Curso completo de Docker para devs Java",
  },
  {
    id: "l4",
    type: "pdf",
    title: "Clean Code — Robert C. Martin",
    subjectName: "Clean Code",
    subjectColor: "#fbbf24",
    tags: ["clean-code", "solid", "boas-práticas"],
    addedAt: new Date(Date.now() - 5 * 86400000),
    description: "O livro clássico sobre código limpo",
  },
  {
    id: "l5",
    type: "link",
    title: "PostgreSQL Official Docs",
    url: "https://www.postgresql.org/docs/",
    subjectName: "Banco de Dados",
    subjectColor: "#84cc16",
    tags: ["postgresql", "sql", "database"],
    addedAt: new Date(Date.now() - 7 * 86400000),
    description: "Documentação oficial do PostgreSQL",
  },
  {
    id: "l6",
    type: "video",
    title: "Kubernetes em 1 hora",
    url: "https://youtube.com/watch?v=...",
    subjectName: "Docker e Kubernetes",
    subjectColor: "#0ea5e9",
    tags: ["kubernetes", "k8s", "containers"],
    addedAt: new Date(Date.now() - 10 * 86400000),
    description: "Introdução prática ao Kubernetes",
  },
];

export default function BibliotecaPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ItemType>("all");
  const [items, setItems] = useState<LibraryItem[]>(MOCK_ITEMS);

  const filtered = items.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.tags.some((t) => t.includes(q))
      );
    }
    return true;
  });

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Biblioteca</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} materiais salvos · PDFs, links, vídeos e livros
          </p>
        </div>
        <Button variant="indigo" size="sm">
          <Plus size={13} />
          Adicionar Material
        </Button>
      </div>

      {/* Type stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(Object.entries(TYPE_CONFIG) as [ItemType, typeof TYPE_CONFIG[ItemType]][]).map(([type, config]) => {
          const count = items.filter((i) => i.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                typeFilter === type
                  ? "border-chart-1 bg-chart-1/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <div className={cn("p-1.5 rounded-md", config.bg)}>
                <config.icon size={13} className={config.color} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground">{config.label}s</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar materiais..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((item) => {
          const config = TYPE_CONFIG[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="card-hover group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("p-2 rounded-md shrink-0", config.bg)}>
                      <config.icon size={14} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: item.subjectColor }}
                        />
                        <p className="text-[10px] text-muted-foreground">{item.subjectName}</p>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {item.addedAt.toLocaleDateString("pt-BR")}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors">
                            <ExternalLink size={11} />
                          </a>
                      )}
                      {item.type === "pdf" && (
                        <Button variant="ghost" size="icon-sm">
                          <Download size={11} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={11} className="text-red-500" />
                      </Button>
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
