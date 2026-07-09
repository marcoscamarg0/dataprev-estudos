"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FileText,
  Clock,
  ChevronRight,
  Bold,
  Italic,
  Code,
  List,
  CheckSquare,
  Table,
  Image,
  Link as LinkIcon,
  Heading1,
  Heading2,
  AlignLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DATAPREV_CURRICULUM } from "@/lib/curriculum";

interface Note {
  id: string;
  title: string;
  preview: string;
  subjectName: string;
  subjectColor: string;
  updatedAt: Date;
  wordCount: number;
}

const MOCK_NOTES: Note[] = [];

const TOOLBAR_ACTIONS = [
  { icon: Heading1, label: "H1", action: "heading1" },
  { icon: Heading2, label: "H2", action: "heading2" },
  { icon: Bold, label: "Negrito", action: "bold" },
  { icon: Italic, label: "Itálico", action: "italic" },
  { icon: Code, label: "Código", action: "code" },
  { icon: List, label: "Lista", action: "list" },
  { icon: CheckSquare, label: "Checklist", action: "checklist" },
  { icon: Table, label: "Tabela", action: "table" },
  { icon: Image, label: "Imagem", action: "image" },
  { icon: LinkIcon, label: "Link", action: "link" },
];

export default function ResumosPage() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(MOCK_NOTES[0]);
  const [search, setSearch] = useState("");
  const [content, setContent] = useState(
    selectedNote?.preview + "\n\n## Conceitos Principais\n\n- Item 1\n- Item 2\n- Item 3\n\n## Código de Exemplo\n\n```java\n@Service\npublic class UserService {\n    @Autowired\n    private UserRepository repository;\n    \n    public User findById(Long id) {\n        return repository.findById(id)\n            .orElseThrow(() -> new NotFoundException(\"User not found\"));\n    }\n}\n```"
  );

  const filteredNotes = MOCK_NOTES.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Notes sidebar */}
      <div className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <Button variant="indigo" size="sm" className="w-full text-xs mb-2">
            <Plus size={12} />
            Novo Resumo
          </Button>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={cn(
                "w-full p-3 text-left border-b border-border hover:bg-muted/50 transition-colors",
                selectedNote?.id === note.id && "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: note.subjectColor }}
                />
                <span className="text-[10px] text-muted-foreground truncate">
                  {note.subjectName}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-1">{note.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{note.preview}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {note.wordCount} palavras
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            {/* Editor header */}
            <div className="border-b border-border p-4">
              <input
                className="text-lg font-semibold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground"
                defaultValue={selectedNote.title}
                placeholder="Título do resumo..."
              />
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: selectedNote.subjectColor }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {selectedNote.subjectName}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground">
                  <Clock size={10} className="inline mr-1" />
                  {selectedNote.updatedAt.toLocaleDateString("pt-BR")}
                </span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedNote.wordCount} palavras
                </span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="border-b border-border px-4 py-1.5 flex items-center gap-0.5">
              {TOOLBAR_ACTIONS.map((action) => (
                <button
                  key={action.action}
                  title={action.label}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <action.icon size={13} />
                </button>
              ))}
              <div className="h-4 w-px bg-border mx-1" />
              <Button variant="outline" size="sm" className="text-xs h-6 px-2 ml-auto">
                Exportar PDF
              </Button>
            </div>

            {/* Editor content */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed font-mono"
                placeholder="Comece a escrever seu resumo..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FileText size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Nenhum resumo selecionado</p>
            <p className="text-xs text-muted-foreground mb-4">
              Selecione um resumo na barra lateral ou crie um novo
            </p>
            <Button variant="indigo" size="sm">
              <Plus size={13} />
              Novo Resumo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
