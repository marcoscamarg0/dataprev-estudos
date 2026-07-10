"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Plus,
  Search,
  FileText,
  Link as LinkIcon,
  Video,
  BookOpen,
  ExternalLink,
  Trash2,
  Globe,
  X,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ItemType = "pdf" | "link" | "video" | "note";

interface LibraryItem {
  id: string;
  type: ItemType;
  title: string;
  url?: string | null;
  content?: string | null;
  tags: string[];
  createdAt: string;
}

const TYPE_CONFIG: Record<
  ItemType,
  { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string; bg: string }
> = {
  pdf: { icon: FileText, label: "Arquivo", color: "text-red-500", bg: "bg-red-500/10" },
  link: { icon: Globe, label: "Link", color: "text-blue-500", bg: "bg-blue-500/10" },
  video: { icon: Video, label: "Vídeo", color: "text-red-600", bg: "bg-red-600/10" },
  note: { icon: BookOpen, label: "Anotação", color: "text-amber-500", bg: "bg-amber-500/10" },
};

export default function BibliotecaPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ItemType>("all");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/library");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filtered = items.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Não foi possível remover o material");
      loadItems();
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Biblioteca</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} materiais salvos · arquivos, links, vídeos e anotações
          </p>
        </div>
        <Button variant="indigo" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={13} />
          Adicionar Material
        </Button>
      </div>

      {/* Type stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {(Object.entries(TYPE_CONFIG) as [ItemType, (typeof TYPE_CONFIG)[ItemType]][]).map(
          ([type, config]) => {
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
          }
        )}
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
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
          <Loader2 size={14} className="animate-spin" /> Carregando materiais...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <Library size={28} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum material ainda. Adicione seu primeiro arquivo ou link de estudo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.note;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-hover group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn("p-2 rounded-md shrink-0", config.bg)}>
                        <config.icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={() => removeItem(item.id)}>
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
      )}

      <AnimatePresence>
        {modalOpen && (
          <AddMaterialModal
            onClose={() => setModalOpen(false)}
            onAdded={() => {
              setModalOpen(false);
              loadItems();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddMaterialModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [mode, setMode] = useState<"file" | "link">("file");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "file" && !file) {
      toast.error("Selecione um arquivo");
      return;
    }
    if (mode === "link" && !url) {
      toast.error("Informe uma URL");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title || file?.name || url);
      formData.append("type", mode === "file" ? "pdf" : "link");
      formData.append("tags", tags);
      if (mode === "file" && file) formData.append("file", file);
      if (mode === "link") formData.append("url", url);

      const res = await fetch("/api/library", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erro ao adicionar material");
        return;
      }
      toast.success("Material adicionado!");
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Adicionar material</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            size="sm"
            variant={mode === "file" ? "indigo" : "outline"}
            onClick={() => setMode("file")}
          >
            <UploadCloud size={13} /> Arquivo
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "link" ? "indigo" : "outline"}
            onClick={() => setMode("link")}
          >
            <LinkIcon size={13} /> Link
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "file" ? (
            <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors">
              <UploadCloud size={20} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {file ? file.name : "Clique para escolher um arquivo (PDF, TXT, MD...)"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-xs"
            />
          )}

          <Input
            placeholder="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs"
          />
          <Input
            placeholder="Tags separadas por vírgula"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="text-xs"
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : "Salvar material"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
