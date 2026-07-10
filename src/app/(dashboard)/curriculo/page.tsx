"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUser,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Star,
  Plus,
  Trash2,
  Save,
  Wand2,
  Copy,
  Check,
  Download,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface Education {
  id: string;
  course: string;
  institution: string;
  year: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  targetRole: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  achievements: Achievement[];
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  targetRole: "",
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  certifications: [],
  achievements: [],
};

const STORAGE_KEY = "dataprev_curriculum_profile";

// ─── Small UI helpers ──────────────────────────────────────────────────────────

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-chart-1/15 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-chart-1" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1">
      {children}
    </label>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none transition-colors",
        className
      )}
    />
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "profile", label: "Meu Perfil", icon: User },
  { id: "generate", label: "Gerar Currículo", icon: Wand2 },
  { id: "result", label: "Resultado", icon: FileUser },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CurriculoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCurriculum, setGeneratedCurriculum] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // ── LinkedIn PDF Import ──
  // Extract text from PDF in the browser using pdfjs-dist (dynamic import)
  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamic import so it only loads in browser
    const pdfjs = await import("pdfjs-dist");

    // Worker served from /public — no CDN dependency, no CORS issues
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

    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n");
  };


  const importFromLinkedIn = async (file: File) => {
    setImportError(null);
    setImportSuccess(false);
    setIsImporting(true);

    try {
      // Step 1: Extract text in the browser
      let pdfText: string;
      try {
        pdfText = await extractPdfText(file);
      } catch (pdfErr) {
        console.error("PDF extract error:", pdfErr);
        setImportError("Não foi possível ler o PDF. Use o PDF gerado pelo botão 'Salvar como PDF' do LinkedIn.");
        return;
      }

      if (!pdfText || pdfText.trim().length < 50) {
        setImportError("O PDF parece estar vazio. Certifique-se de usar o PDF de texto do LinkedIn (não uma imagem escaneada).");
        return;
      }

      // Step 2: Send text to AI API
      const response = await fetch("/api/ai/parse-linkedin-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfText.slice(0, 8000) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImportError(data.error || "Erro ao processar com IA.");
      } else {
        setProfile((prev) => ({
          ...prev,
          ...data.profile,
          name: data.profile.name || prev.name,
          email: data.profile.email || prev.email,
          phone: data.profile.phone || prev.phone,
          linkedin: data.profile.linkedin || prev.linkedin,
          github: data.profile.github || prev.github,
          targetRole: data.profile.targetRole || prev.targetRole,
          summary: data.profile.summary || prev.summary,
        }));
        setImportSuccess(true);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, ...data.profile }));
        } catch {}
        setTimeout(() => setImportSuccess(false), 5000);
      }
    } catch {
      setImportError("Falha de rede. Verifique sua conexão.");
    } finally {
      setIsImporting(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };


  const saveProfile = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  // ── Experience ──
  const addExperience = () => {
    updateField("experiences", [
      ...profile.experiences,
      { id: Date.now().toString(), company: "", role: "", period: "", description: "" },
    ]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    updateField(
      "experiences",
      profile.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeExperience = (id: string) => {
    updateField(
      "experiences",
      profile.experiences.filter((e) => e.id !== id)
    );
  };

  // ── Education ──
  const addEducation = () => {
    updateField("education", [
      ...profile.education,
      { id: Date.now().toString(), course: "", institution: "", year: "" },
    ]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    updateField(
      "education",
      profile.education.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeEducation = (id: string) => {
    updateField(
      "education",
      profile.education.filter((e) => e.id !== id)
    );
  };

  // ── Skills ──
  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) return;
    updateField("skills", [...profile.skills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    updateField(
      "skills",
      profile.skills.filter((s) => s !== skill)
    );
  };

  // ── Certifications ──
  const addCertification = () => {
    updateField("certifications", [
      ...profile.certifications,
      { id: Date.now().toString(), name: "", issuer: "", year: "" },
    ]);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    updateField(
      "certifications",
      profile.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCertification = (id: string) => {
    updateField(
      "certifications",
      profile.certifications.filter((c) => c.id !== id)
    );
  };

  // ── Achievements ──
  const addAchievement = () => {
    updateField("achievements", [
      ...profile.achievements,
      { id: Date.now().toString(), title: "", description: "" },
    ]);
  };

  const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
    updateField(
      "achievements",
      profile.achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAchievement = (id: string) => {
    updateField(
      "achievements",
      profile.achievements.filter((a) => a.id !== id)
    );
  };

  // ── Generate ──
  const generateCurriculum = async () => {
    if (!jobDescription.trim()) {
      setError("Cole a descrição da vaga antes de gerar.");
      return;
    }
    if (!profile.name) {
      setError("Preencha pelo menos seu nome no perfil.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao gerar currículo.");
      } else {
        setGeneratedCurriculum(data.curriculum);
        setActiveTab("result");
      }
    } catch {
      setError("Falha de rede. Verifique sua conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCurriculum = () => {
    navigator.clipboard.writeText(generatedCurriculum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCurriculum = async () => {
    if (!generatedCurriculum) return;

    // Dynamic import — only loads when user clicks download
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
    const usableWidth = pageWidth - marginLeft - marginRight;

    let y = marginTop;

    const lines = generatedCurriculum.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      // Detect line type
      const isHeader = line === line.toUpperCase() && line.trim().length > 2 && !line.startsWith("-") && !line.startsWith("|");
      const isBullet = line.trimStart().startsWith("-");
      const isName = y === marginTop && lines.indexOf(rawLine) === 0;
      const isEmpty = line.trim() === "";

      if (isEmpty) {
        y += 4;
        continue;
      }

      // Check for page break
      if (y > pageHeight - marginBottom - 10) {
        doc.addPage();
        y = marginTop;
      }

      if (isName) {
        // First line = name — large bold
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); // slate-900
        const nameLines = doc.splitTextToSize(line, usableWidth);
        doc.text(nameLines, marginLeft, y);
        y += nameLines.length * 7 + 2;
      } else if (isHeader) {
        // Section header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(79, 70, 229); // indigo-600
        const hLines = doc.splitTextToSize(line, usableWidth);
        doc.text(hLines, marginLeft, y);
        y += hLines.length * 5.5;
        // Underline
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 3;
      } else if (isBullet) {
        // Bullet point
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // slate-600
        const bulletText = line.trimStart().slice(1).trim(); // remove leading "- "
        const bulletLines = doc.splitTextToSize(bulletText, usableWidth - 5);
        doc.text("•", marginLeft, y);
        doc.text(bulletLines, marginLeft + 4, y);
        y += bulletLines.length * 4.5 + 1;
      } else {
        // Contact line / normal text
        const isSeparatorLine = line.includes("|");
        doc.setFont("helvetica", isSeparatorLine ? "normal" : "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // slate-500 for contact, slate-600 for rest
        const normalLines = doc.splitTextToSize(line, usableWidth);
        doc.text(normalLines, marginLeft, y);
        y += normalLines.length * 4.5 + 1;
      }
    }

    const fileName = `curriculo_${profile.name.replace(/\s+/g, "_") || "gerado"}.pdf`;
    doc.save(fileName);
  };


  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-chart-1/15 flex items-center justify-center">
              <FileUser size={18} className="text-chart-1" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">Gerador de Currículo IA</h1>
              <p className="text-xs text-muted-foreground">
                Currículo ATS-compatível, personalizado para cada vaga
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">IA Ativa</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-chart-1 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ── TAB: PROFILE ──────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-24"
            >
              {/* Hidden file input */}
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importFromLinkedIn(file);
                }}
              />

              {/* LinkedIn PDF Import Banner */}
              <div
                className={cn(
                  "relative rounded-xl border-2 border-dashed p-5 transition-all",
                  isImporting
                    ? "border-chart-1/40 bg-chart-1/5"
                    : importSuccess
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : importError
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-muted/20 hover:border-chart-1/40 hover:bg-chart-1/5"
                )}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
                    importFromLinkedIn(file);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* LinkedIn icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    importSuccess ? "bg-emerald-500/15" : "bg-[#0A66C2]/10"
                  )}>
                    {importSuccess ? (
                      <Check size={22} className="text-emerald-500" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {importSuccess
                        ? "✅ Perfil importado com sucesso!"
                        : "Importar perfil do LinkedIn PDF"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {importSuccess
                        ? "Todos os campos foram preenchidos automaticamente. Revise e ajuste se necessário."
                        : isImporting
                        ? "Extraindo dados com IA... aguarde."
                        : "Baixe seu perfil no LinkedIn → Mais → Salvar como PDF e faça upload aqui."}
                    </p>
                    {importError && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {importError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {importSuccess && (
                      <Button
                        onClick={() => {
                          setImportSuccess(false);
                          setImportError(null);
                          pdfInputRef.current?.click();
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <RefreshCw size={13} />
                        <span className="hidden sm:inline">Importar outro</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isImporting}
                      variant={importSuccess ? "outline" : "indigo"}
                      size="sm"
                      className="gap-1.5"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          {importSuccess ? "Substituir" : "Selecionar PDF"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* How to get PDF hint */}
                {!importSuccess && !isImporting && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2">
                    <span className="text-[10px] text-muted-foreground leading-relaxed">
                      💡 <strong>Como baixar:</strong> Acesse seu perfil no LinkedIn →
                      clique em <strong>&quot;Mais&quot;</strong> →
                      <strong>&quot;Salvar como PDF&quot;</strong> → faça upload aqui
                    </span>
                  </div>
                )}
              </div>

              {/* Personal Data */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle
                  icon={User}
                  title="Dados Pessoais"
                  subtitle="Informações de contato que aparecerão no topo do currículo"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <FieldLabel>Nome Completo *</FieldLabel>
                    <Input
                      value={profile.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Ex: João da Silva Santos"
                    />
                  </div>
                  <div>
                    <FieldLabel>E-mail</FieldLabel>
                    <Input
                      value={profile.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="joao@email.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <FieldLabel>Telefone</FieldLabel>
                    <Input
                      value={profile.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <FieldLabel>LinkedIn</FieldLabel>
                    <Input
                      value={profile.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/joaosilva"
                    />
                  </div>
                  <div>
                    <FieldLabel>GitHub</FieldLabel>
                    <Input
                      value={profile.github}
                      onChange={(e) => updateField("github", e.target.value)}
                      placeholder="github.com/joaosilva"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Cargo Desejado / Objetivo</FieldLabel>
                    <Input
                      value={profile.targetRole}
                      onChange={(e) => updateField("targetRole", e.target.value)}
                      placeholder="Ex: Desenvolvedor Java Sênior | Analista de Sistemas"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Resumo Profissional (base)</FieldLabel>
                    <Textarea
                      value={profile.summary}
                      onChange={(v) => updateField("summary", v)}
                      placeholder="Descreva sua experiência, principais tecnologias e diferenciais. A IA vai adaptar esse resumo para cada vaga."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Experiences */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle
                  icon={Briefcase}
                  title="Experiência Profissional"
                  subtitle="Adicione suas experiências mais relevantes. Descreva conquistas com métricas!"
                />
                <div className="space-y-4">
                  {profile.experiences.map((exp, i) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-3 sm:p-4 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-chart-1">
                          Experiência {i + 1}
                        </span>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>Empresa</FieldLabel>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            placeholder="Nome da empresa"
                          />
                        </div>
                        <div>
                          <FieldLabel>Cargo</FieldLabel>
                          <Input
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                            placeholder="Desenvolvedor Java Pleno"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <FieldLabel>Período</FieldLabel>
                          <Input
                            value={exp.period}
                            onChange={(e) => updateExperience(exp.id, "period", e.target.value)}
                            placeholder="Jan/2022 – Presente"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <FieldLabel>Conquistas e Responsabilidades</FieldLabel>
                          <Textarea
                            value={exp.description}
                            onChange={(v) => updateExperience(exp.id, "description", v)}
                            placeholder={`Descreva suas conquistas com verbos de ação e métricas:\n- Desenvolveu API REST com Spring Boot reduzindo latência em 35%\n- Implementou testes unitários com JUnit aumentando cobertura de 40% para 85%\n- Liderou migração de monolito para microserviços atendendo 50k usuários/dia`}
                            rows={5}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <Button
                    onClick={addExperience}
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Adicionar Experiência
                  </Button>
                </div>
              </div>

              {/* Education */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle
                  icon={GraduationCap}
                  title="Formação Acadêmica"
                />
                <div className="space-y-3">
                  {profile.education.map((edu, i) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-chart-1">Formação {i + 1}</span>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <FieldLabel>Curso</FieldLabel>
                          <Input
                            value={edu.course}
                            onChange={(e) => updateEducation(edu.id, "course", e.target.value)}
                            placeholder="Ciência da Computação"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <FieldLabel>Instituição</FieldLabel>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                            placeholder="USP / UNICAMP..."
                          />
                        </div>
                        <div>
                          <FieldLabel>Ano Conclusão</FieldLabel>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                            placeholder="2022"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <Button
                    onClick={addEducation}
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Adicionar Formação
                  </Button>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle
                  icon={Wrench}
                  title="Habilidades Técnicas"
                  subtitle="A IA vai destacar as habilidades mais relevantes para cada vaga"
                />
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Java, Spring Boot, Docker, PostgreSQL..."
                    className="flex-1"
                  />
                  <Button onClick={addSkill} variant="outline" size="sm">
                    <Plus size={14} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-chart-1/10 text-chart-1 border border-chart-1/20 text-xs font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive transition-colors ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {profile.skills.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhuma habilidade adicionada
                    </p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle icon={Award} title="Certificações" />
                <div className="space-y-3">
                  {profile.certifications.map((cert, i) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-chart-1">Certificação {i + 1}</span>
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <FieldLabel>Nome</FieldLabel>
                          <Input
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                            placeholder="AWS Certified Developer"
                          />
                        </div>
                        <div>
                          <FieldLabel>Emissor</FieldLabel>
                          <Input
                            value={cert.issuer}
                            onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                            placeholder="Amazon Web Services"
                          />
                        </div>
                        <div>
                          <FieldLabel>Ano</FieldLabel>
                          <Input
                            value={cert.year}
                            onChange={(e) => updateCertification(cert.id, "year", e.target.value)}
                            placeholder="2024"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <Button
                    onClick={addCertification}
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Adicionar Certificação
                  </Button>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle
                  icon={Star}
                  title="Conquistas e Projetos Destacados"
                  subtitle="Projetos pessoais, open source, premiações, contribuições relevantes"
                />
                <div className="space-y-3">
                  {profile.achievements.map((ach, i) => (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-chart-1">Conquista {i + 1}</span>
                        <button
                          onClick={() => removeAchievement(ach.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div>
                        <FieldLabel>Título</FieldLabel>
                        <Input
                          value={ach.title}
                          onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                          placeholder="Sistema de Gestão Escolar Open Source"
                        />
                      </div>
                      <div>
                        <FieldLabel>Descrição</FieldLabel>
                        <Textarea
                          value={ach.description}
                          onChange={(v) => updateAchievement(ach.id, "description", v)}
                          placeholder="Desenvolveu sistema com Spring Boot e React com 500+ estrelas no GitHub, utilizado por 30 escolas."
                          rows={2}
                        />
                      </div>
                    </motion.div>
                  ))}
                  <Button
                    onClick={addAchievement}
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Adicionar Conquista
                  </Button>
                </div>
              </div>

              {/* Save button */}
              <div className="fixed bottom-6 right-6 z-10">
                <Button
                  onClick={saveProfile}
                  variant="indigo"
                  className="shadow-lg shadow-chart-1/20 gap-2"
                >
                  {saved ? (
                    <>
                      <Check size={15} />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Salvar Perfil
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── TAB: GENERATE ─────────────────────────────────────────────── */}
          {activeTab === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-10"
            >
              {/* Tips */}
              <div className="bg-chart-1/5 border border-chart-1/20 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={15} className="text-chart-1 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-chart-1 mb-1">Como funciona</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• A IA lê a descrição da vaga e extrai as palavras-chave automaticamente</li>
                      <li>• Seu perfil é adaptado para destacar o que a vaga precisa</li>
                      <li>• O resultado é um currículo 100% ATS-compatível (sem tabelas, colunas ou ícones)</li>
                      <li>• Cada geração é única — experimente com diferentes vagas!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Profile status */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User size={14} className="text-muted-foreground" />
                  <span className="text-sm font-semibold">Status do Perfil</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Dados pessoais", ok: !!profile.name },
                    { label: "Experiências", ok: profile.experiences.length > 0 },
                    { label: "Habilidades", ok: profile.skills.length > 0 },
                    { label: "Formação", ok: profile.education.length > 0 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium",
                        item.ok
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted/50 border-border text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.ok ? "bg-emerald-500" : "bg-muted-foreground"
                        )}
                      />
                      {item.label}
                    </div>
                  ))}
                </div>
                {!profile.name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Preencha seu perfil na aba anterior para melhores resultados.
                  </p>
                )}
              </div>

              {/* Job description */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <SectionTitle
                  icon={Briefcase}
                  title="Descrição da Vaga"
                  subtitle="Cole o texto completo da vaga — quanto mais detalhes, melhor o currículo gerado"
                />
                <Textarea
                  value={jobDescription}
                  onChange={setJobDescription}
                  placeholder={`Cole aqui a descrição completa da vaga...

Exemplo:
Desenvolvedor Java Sênior
Requisitos:
- Experiência com Java 11+ e Spring Boot
- Conhecimento em microsserviços e arquitetura distribuída
- Docker e Kubernetes
- PostgreSQL e Redis
- CI/CD com GitHub Actions
- Boa comunicação e trabalho em equipe

Diferencial:
- AWS (EC2, S3, Lambda)
- Kafka ou RabbitMQ
- Clean Architecture / DDD`}
                  rows={16}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate button */}
              <Button
                onClick={generateCurriculum}
                variant="indigo"
                disabled={isGenerating}
                className="w-full h-12 text-sm font-semibold gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Gerando currículo ATS...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Gerar Currículo com IA
                  </>
                )}
              </Button>

              {isGenerating && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center text-muted-foreground"
                >
                  A IA está analisando a vaga e adaptando seu perfil... isso pode levar até 30 segundos.
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── TAB: RESULT ───────────────────────────────────────────────── */}
          {activeTab === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4 pb-10"
            >
              {generatedCurriculum ? (
                <>
                  {/* Action bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-semibold">Currículo ATS gerado</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={copyCurriculum}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        {copied ? (
                          <><Check size={13} className="text-emerald-500" /> Copiado!</>
                        ) : (
                          <><Copy size={13} /> Copiar</>
                        )}
                      </Button>
                      <Button
                        onClick={downloadCurriculum}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <Download size={13} />
                        <span className="hidden sm:inline">Baixar PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("generate")}
                        variant="indigo"
                        size="sm"
                        className="gap-1.5"
                      >
                        <Wand2 size={13} />
                        <span className="hidden sm:inline">Gerar outro</span>
                        <span className="sm:hidden">Novo</span>
                      </Button>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      💡 <strong>Dica ATS:</strong> Baixe em PDF para enviar candidaturas. Para editar, copie o texto e cole no Word ou Google Docs — sem tabelas, colunas ou ícones para manter compatibilidade com os sistemas de triagem.
                    </p>
                  </div>

                  {/* Curriculum content */}
                  <div className="bg-card border border-border rounded-xl p-5 sm:p-8">
                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-foreground">
                      {generatedCurriculum}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <FileUser size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Nenhum currículo gerado ainda</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vá para a aba "Gerar Currículo", cole a descrição da vaga e clique em gerar.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("generate")}
                    variant="indigo"
                    size="sm"
                    className="gap-1.5 mt-2"
                  >
                    <Wand2 size={14} />
                    Ir para Gerador
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
