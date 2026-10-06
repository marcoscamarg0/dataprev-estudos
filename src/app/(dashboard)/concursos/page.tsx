"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchCheck,
  Plus,
  FileText,
  CheckCircle2,
  Upload,
  Loader2,
  Trash2,
  Edit2,
  X,
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCurriculumStore } from "@/store/curriculumStore";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warn" | "error" | "gemini" | "cmd";
  message: string;
  details?: string;
}

export default function ConcursosPage() {
  const { editais, activeEditalId, setActiveEdital, addEdital, removeEdital, updateEdital } = useCurriculumStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [banca, setBanca] = useState("FGV");
  const [text, setText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Console / Terminal State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [generatingMaterialsId, setGeneratingMaterialsId] = useState<string | null>(null);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [cmdInput, setCmdInput] = useState("");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry["type"], message: string, details?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: timeStr,
      type,
      message,
      details,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  // Initial welcome logs
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs([
      {
        id: "1",
        timestamp: timeStr,
        type: "cmd",
        message: "Trampo Hub · Console de Operações & Diagnóstico IA v2.0",
      },
      {
        id: "2",
        timestamp: timeStr,
        type: "info",
        message: `Módulo de Editais carregado com ${editais.length} edital(is) cadastrado(s).`,
      },
      {
        id: "3",
        timestamp: timeStr,
        type: "gemini",
        message: "Conexão com Google Gemini pronta. Clique em 'Testar Conexão' para validar.",
      },
    ]);
  }, [editais.length]);

  // Auto-scroll console when logs arrive
  useEffect(() => {
    if (isConsoleOpen) {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isConsoleOpen]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle("");
    setRole("");
    setBanca("FGV");
    setText("");
    setError("");
    addLog("info", "Formulário de edital fechado.");
  };

  const startEditing = (edital: any) => {
    setTitle(edital.title);
    setRole(edital.role || "");
    setBanca(edital.banca || "FGV");
    setText("");
    setEditingId(edital.id);
    setIsAdding(true);
    addLog("info", `Modo de edição aberto para: "${edital.title}" (ID: ${edital.id}, Banca: ${edital.banca || "FGV"})`);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo PDF.");
      addLog("error", "Upload rejeitado: arquivo selecionado não é um PDF válido.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      addLog("info", `[PDF] Lendo arquivo: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`);

      const arrayBuffer = await file.arrayBuffer();

      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        useSystemFonts: true,
        disableRange: true,
        disableStream: true,
      });
      const pdf = await loadingTask.promise;

      addLog("info", `[PDF] Documento aberto: ${pdf.numPages} páginas detectadas. Extraindo texto...`);

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
      addLog("success", `[PDF] Extração concluída! ${fullText.length.toLocaleString()} caracteres extraídos de ${pdf.numPages} páginas.`);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao ler o PDF. Certifique-se de que é um arquivo válido.");
      addLog("error", `[PDF] Erro ao extrair texto: ${err.message || "Falha na leitura do arquivo"}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveEdital = async () => {
    if (!title.trim() || !role.trim()) {
      setError("Preencha o título do concurso e o cargo desejado.");
      addLog("warn", "Tentativa de salvar rejeitada: Título e Cargo são obrigatórios.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      let newCurriculum = null;
      let newOverview = undefined;

      if (text.trim()) {
        addLog("gemini", `[IA] Enviando requisição para /api/ai/parse-edital...`);
        addLog("info", `[IA] Parâmetros: Cargo = "${role}" | Texto do Edital = ${text.length.toLocaleString()} caracteres.`);

        const res = await fetch("/api/ai/parse-edital", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, role }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao processar edital via IA.");
        }

        newCurriculum = data.curriculum;
        newOverview = data.overview;
        const detectedBanca = data.banca || banca || "FGV";
        if (data.banca) {
          setBanca(data.banca);
          addLog("info", `[IA] Banca examinadora identificada no edital: "${data.banca}"`);
        }

        addLog("success", `[IA] Extração concluída com sucesso! ${newCurriculum?.length || 0} disciplinas estruturadas.`);

        // Gerar materiais de estudo automaticamente com IA calibrados para a banca
        let generatedMaterials = undefined;
        try {
          addLog("gemini", `[IA] Gerando materiais de estudo calibrados para a banca "${detectedBanca}" e cargo: "${role}"...`);
          const matRes = await fetch("/api/ai/generate-study-materials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              editalTitle: title,
              role,
              banca: detectedBanca,
              subjects: newCurriculum,
            }),
          });
          if (matRes.ok) {
            const matData = await matRes.json();
            if (matData.materials) {
              generatedMaterials = matData.materials;
              addLog("success", `[IA] Materiais de estudo criados: ${generatedMaterials.summaries?.length || 0} resumos teóricos focados na banca ${detectedBanca}, ${generatedMaterials.flashcards?.length || 0} flashcards e cronograma semanal!`);
            }
          }
        } catch (matErr: any) {
          addLog("warn", `[IA] Nota sobre materiais: ${matErr.message || "Apostilas poderão ser geradas no dashboard."}`);
        }

        if (editingId) {
          const updates: any = { title, role, banca: detectedBanca };
          if (newCurriculum) {
            updates.curriculum = newCurriculum;
            updates.overview = newOverview;
          }
          if (generatedMaterials) {
            updates.studyMaterials = generatedMaterials;
          }
          updateEdital(editingId, updates);
          addLog("success", `Edital "${title}" (Banca: ${detectedBanca}) atualizado com sucesso no banco de dados!`);
        } else {
          addEdital({
            title,
            role,
            banca: detectedBanca,
            overview: newOverview,
            curriculum: newCurriculum,
            studyMaterials: generatedMaterials,
          });
          addLog("success", `🎉 Novo edital "${title}" (Banca: ${detectedBanca}) ativado! O Dashboard já foi atualizado com seus novos materiais de estudo.`);
        }
      } else if (editingId) {
        updateEdital(editingId, { title, role, banca });
        addLog("success", `Edital "${title}" atualizado (Banca: ${banca}).`);
      } else {
        throw new Error("Você precisa colar o texto do edital ou enviar o PDF para extrair as disciplinas e gerar os materiais de estudo.");
      }

      resetForm();
    } catch (err: any) {
      setError(err.message);
      addLog("error", `Falha na operação: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Gemini Diagnostic Test
  const runApiTest = async () => {
    if (isTestingApi) return;
    setIsTestingApi(true);
    addLog("cmd", "▶ Iniciando teste de diagnóstico da API do Gemini...");

    try {
      const res = await fetch("/api/ai/test");
      const data = await res.json();

      if (!res.ok || !data.success) {
        addLog("error", `Falha no teste: ${data.error || "A API retornou status de erro"}`);
        if (data.results?.textTest?.error) {
          addLog("error", `[Erro Texto]: ${data.results.textTest.error}`);
        }
        if (data.results?.jsonTest?.error) {
          addLog("error", `[Erro JSON]: ${data.results.jsonTest.error}`);
        }
      } else {
        addLog("success", `✅ Autenticação confirmada! Chave: ${data.results?.keyPreview || "OK"}`);
        addLog("info", `Modelos configurados: ${data.results?.activeModels?.join(", ") || "N/A"}`);
        addLog("success", `Geração de texto: [OK] → Resposta: "${data.results?.textTest?.response}"`);
        addLog("success", `Geração de JSON: [OK] → Parse estruturado validado com sucesso.`);
        addLog("gemini", "🎉 Todos os sistemas de IA estão 100% operacionais.");
      }
    } catch (err: any) {
      addLog("error", `Erro de rede ao conectar com /api/ai/test: ${err.message}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleGenerateMaterialsForEdital = async (edital: any) => {
    if (generatingMaterialsId) return;
    setGeneratingMaterialsId(edital.id);
    const edBanca = edital.banca || "FGV";
    addLog("gemini", `[IA] Gerando novo pacote de materiais de estudo calibrados para a banca "${edBanca}" ("${edital.title}")...`);
    try {
      const res = await fetch("/api/ai/generate-study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editalTitle: edital.title,
          role: edital.role,
          banca: edBanca,
          subjects: edital.curriculum,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar materiais");
      updateEdital(edital.id, { studyMaterials: data.materials });
      addLog("success", `[IA] Sucesso! ${data.materials.summaries?.length || 0} resumos e ${data.materials.flashcards?.length || 0} flashcards gerados especificamente para a banca ${edBanca}.`);
    } catch (err: any) {
      addLog("error", `Falha ao gerar materiais: ${err.message}`);
    } finally {
      setGeneratingMaterialsId(null);
    }
  };

  const handleCopyLogs = () => {
    const formatted = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}${l.details ? `\n${l.details}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleClearLogs = () => {
    const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs([
      {
        id: Date.now().toString(),
        timestamp: timeStr,
        type: "cmd",
        message: "Console limpo pelo usuário.",
      },
    ]);
  };

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = cmdInput.trim().toLowerCase();
    if (!command) return;

    addLog("cmd", `> ${cmdInput.trim()}`);
    setCmdInput("");

    if (command === "test" || command === "testar") {
      runApiTest();
    } else if (command === "clear" || command === "limpar") {
      handleClearLogs();
    } else if (command === "editais" || command === "list") {
      addLog("info", `Editais cadastrados (${editais.length}):\n${editais.map((e) => `• ${e.title} [${e.role || "Geral"}] (${e.curriculum.length} matérias)`).join("\n")}`);
    } else if (command === "help" || command === "ajuda") {
      addLog("info", "Comandos disponíveis:\n• test / testar: Executa diagnóstico completo do Gemini\n• editais / list: Lista todos os editais cadastrados\n• clear / limpar: Limpa os registros do console\n• help / ajuda: Exibe este menu");
    } else {
      addLog("warn", `Comando desconhecido: "${command}". Digite 'help' para ver comandos.`);
    }
  };

  const getLogTypeBadge = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <span className="text-emerald-400 font-semibold">[SUCESSO]</span>;
      case "error":
        return <span className="text-rose-400 font-semibold">[ERRO]</span>;
      case "warn":
        return <span className="text-amber-400 font-semibold">[AVISO]</span>;
      case "gemini":
        return <span className="text-indigo-400 font-semibold">[GEMINI]</span>;
      case "cmd":
        return <span className="text-cyan-400 font-semibold">[SISTEMA]</span>;
      default:
        return <span className="text-blue-400 font-semibold">[INFO]</span>;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/20">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-16">
        {/* Top Header */}
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="gap-1.5 border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300"
            >
              <Terminal size={14} className="text-indigo-400" />
              <span>Console</span>
              <Badge variant="secondary" className="px-1 py-0 text-[10px] bg-indigo-500/20 text-indigo-300">
                {logs.length}
              </Badge>
            </Button>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="gap-2">
                <Plus size={16} /> Novo Edital
              </Button>
            )}
          </div>
        </div>

        {/* Modal / Card to Add or Edit Edital */}
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="text-sm font-medium text-indigo-400">Cargo Desejado</label>
                      <Input
                        placeholder="Ex: Agente de Tecnologia"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-amber-400 flex items-center justify-between">
                        <span>Banca Examinadora</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Foco dos Estudos</span>
                      </label>
                      <Input
                        placeholder="Ex: FGV, Cebraspe, FCC..."
                        value={banca}
                        onChange={(e) => setBanca(e.target.value)}
                        disabled={isLoading}
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {["FGV", "Cebraspe", "FCC", "Cesgranrio", "Vunesp"].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBanca(b)}
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded border transition-colors",
                              banca.toUpperCase() === b.toUpperCase()
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
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

        {/* Existing Editais List */}
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
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-400 bg-amber-500/10">
                      🏛️ Banca: {edital.banca || "FGV"}
                    </Badge>
                    {edital.role && (
                      <Badge variant="secondary" className="text-xs font-normal bg-muted">
                        Cargo: {edital.role}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {edital.curriculum.length} disciplinas cadastradas
                    </span>
                    {edital.studyMaterials && (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] gap-1">
                        <Sparkles size={10} /> {edital.studyMaterials.summaries?.length || 0} Apostilas · {edital.studyMaterials.flashcards?.length || 0} Flashcards
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
                    onClick={() => handleGenerateMaterialsForEdital(edital)}
                    disabled={generatingMaterialsId === edital.id}
                  >
                    {generatingMaterialsId === edital.id ? (
                      <Loader2 size={13} className="animate-spin text-indigo-400" />
                    ) : (
                      <Sparkles size={13} className="text-indigo-400" />
                    )}
                    <span>{edital.studyMaterials ? "Atualizar Materiais IA" : "Gerar Materiais IA"}</span>
                  </Button>
                  {activeEditalId !== edital.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveEdital(edital.id);
                        addLog("info", `Edital ativo alterado para: "${edital.title}"`);
                      }}
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
                      onClick={() => {
                        removeEdital(edital.id);
                        addLog("warn", `Edital "${edital.title}" removido.`);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 💻 CONSOLE & TERMINAL DE OPERAÇÕES */}
        <div className="mt-10">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
                </div>
                <Terminal size={14} className="text-indigo-400" />
                <span className="text-xs font-mono font-semibold text-zinc-200">
                  console@trampo-hub:~ edital-diagnostics
                </span>
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini API Ativo
                </span>
              </div>

              {/* Actions Header */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={runApiTest}
                  disabled={isTestingApi}
                  className="h-7 px-2.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1.5"
                  title="Testar Conexão com Gemini"
                >
                  {isTestingApi ? (
                    <Loader2 size={12} className="animate-spin text-indigo-400" />
                  ) : (
                    <Play size={12} className="text-emerald-400" />
                  )}
                  <span>Testar API</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLogs}
                  className="h-7 px-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Copiar todos os logs"
                >
                  {copiedLogs ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLogs}
                  className="h-7 px-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Limpar console"
                >
                  <RotateCcw size={12} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                  className="h-7 px-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title={isConsoleOpen ? "Recolher console" : "Expandir console"}
                >
                  {isConsoleOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
              </div>
            </div>

            {/* Terminal Body */}
            {isConsoleOpen && (
              <div>
                <div className="p-4 font-mono text-xs text-zinc-300 space-y-1.5 max-h-80 overflow-y-auto bg-zinc-950/90 selection:bg-indigo-500/30">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-zinc-900/40 px-1 rounded transition-colors">
                      <span className="text-zinc-600 select-none text-[11px] shrink-0">{log.timestamp}</span>
                      <span className="shrink-0">{getLogTypeBadge(log.type)}</span>
                      <div className="flex-1 whitespace-pre-wrap break-words">
                        <span>{log.message}</span>
                        {log.details && (
                          <pre className="mt-1 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] overflow-x-auto">
                            {log.details}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>

                {/* Quick Action Chips & Command Input */}
                <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[10px] font-mono text-zinc-500 mr-1 select-none">Atalhos:</span>
                    <button
                      onClick={runApiTest}
                      disabled={isTestingApi}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles size={10} className="text-indigo-400" />
                      diagnosticar
                    </button>
                    <button
                      onClick={() => addLog("info", `Editais Ativos: ${editais.map(e => e.title).join(", ")}`)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1"
                    >
                      <Layers size={10} className="text-emerald-400" />
                      listar editais
                    </button>
                    <button
                      onClick={handleClearLogs}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      limpar
                    </button>
                  </div>

                  {/* Terminal CLI Command Input */}
                  <form onSubmit={handleCmdSubmit} className="flex items-center gap-2 flex-1 sm:max-w-xs">
                    <span className="text-zinc-500 font-mono text-xs select-none">$</span>
                    <input
                      type="text"
                      value={cmdInput}
                      onChange={(e) => setCmdInput(e.target.value)}
                      placeholder="digite 'test' ou 'help'..."
                      className="bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none w-full"
                    />
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
