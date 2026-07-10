"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchCheck, Plus, FileText, CheckCircle2, Upload, Loader2, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCurriculumStore } from "@/store/curriculumStore";

export default function ConcursosPage() {
  const { editais, activeEditalId, setActiveEdital, addEdital, removeEdital, updateEdital } = useCurriculumStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle("");
    setRole("");
    setText("");
    setError("");
  };

  const startEditing = (edital: any) => {
    setTitle(edital.title);
    setRole(edital.role || "");
    setText(""); // Clear text, they only need to paste text if they want to regenerate
    setEditingId(edital.id);
    setIsAdding(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo PDF.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableRange: true,
        disableStream: true,
      });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += pageText + "\n";
      }
      
      setText(fullText);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao ler o PDF. Certifique-se de que é um arquivo válido.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveEdital = async () => {
    if (!title.trim() || !role.trim()) {
      setError("Preencha o título do concurso e o cargo desejado.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      let newCurriculum = null;
      let newOverview = undefined;

      // Se houver texto, chama a IA para gerar novo currículo
      if (text.trim()) {
        const res = await fetch("/api/ai/parse-edital", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao processar edital.");
        newCurriculum = data.curriculum;
        newOverview = data.overview;
      }

      if (editingId) {
        // Atualizando existente
        const updates: any = { title, role };
        if (newCurriculum) {
          updates.curriculum = newCurriculum;
          updates.overview = newOverview;
        }
        updateEdital(editingId, updates);
      } else {
        // Criando novo
        if (!newCurriculum) {
          throw new Error("Você precisa colar o texto do edital ou enviar o PDF para gerar o conteúdo de estudos pela primeira vez.");
        }
        addEdital({
          title,
          role,
          overview: newOverview,
          curriculum: newCurriculum,
        });
      }

      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/20">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <SearchCheck className="w-8 h-8 text-indigo-500" />
              Editais
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Adicione e gerencie editais focados em cargos específicos.
            </p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus size={16} /> Novo Edital
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-indigo-500/20 shadow-sm relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-4 text-muted-foreground"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  <X size={16} />
                </Button>
                
                <CardContent className="p-6 space-y-6 pt-10">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    {editingId ? "Editar Edital" : "Adicionar Novo Edital"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Concurso/Órgão</label>
                      <Input 
                        placeholder="Ex: Banco do Brasil 2026"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-500">Cargo Desejado (Crucial para a IA)</label>
                      <Input 
                        placeholder="Ex: Agente de Tecnologia"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Conteúdo Programático</label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2 h-8 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Upload size={14} /> Upload PDF
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {editingId 
                        ? "Deixe em branco se quiser apenas alterar o nome/cargo. Cole texto ou faça upload do PDF para REGERAR as matérias com a IA." 
                        : "Cole o texto das disciplinas do edital aqui, ou faça upload do PDF para extrairmos automaticamente."}
                    </p>
                    
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handlePdfUpload}
                    />
                    
                    <textarea 
                      className="w-full h-32 mt-2 p-3 bg-background border rounded-md text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="Cole o conteúdo programático do edital aqui..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="indigo" 
                      onClick={handleSaveEdital} 
                      disabled={isLoading || (!editingId && !text.trim()) || !title.trim() || !role.trim()}
                      className="gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                      {editingId && !text.trim() ? "Salvar Alterações" : "Extrair e Salvar Edital"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 mt-6">
          <h2 className="font-semibold text-lg mb-2">Seus Editais</h2>
          {editais.map((edital) => (
            <Card 
              key={edital.id}
              className={`transition-colors ${activeEditalId === edital.id ? 'border-indigo-500 bg-indigo-500/5' : 'hover:border-foreground/20'}`}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-foreground text-lg">{edital.title}</h3>
                    {activeEditalId === edital.id && (
                      <Badge variant="indigo" className="gap-1 px-2 py-0.5 shadow-sm">
                        <CheckCircle2 size={12} /> Ativo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {edital.role && (
                      <Badge variant="secondary" className="text-xs font-normal bg-muted">
                        Cargo: {edital.role}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {edital.curriculum.length} disciplinas cadastradas
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {activeEditalId !== edital.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveEdital(edital.id)}
                    >
                      Ativar para Estudos
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-2"
                    onClick={() => startEditing(edital)}
                  >
                    <Edit2 size={14} /> Editar
                  </Button>
                  {edital.id !== "dataprev-2026" && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => removeEdital(edital.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
