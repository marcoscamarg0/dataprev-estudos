"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Download, Upload, Trash2, Shield, Keyboard, User, Target, Clock, Calendar, Palette, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

const SECTIONS = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "metas", label: "Metas", icon: Target },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "atalhos", label: "Atalhos", icon: Keyboard },
  { id: "dados", label: "Dados", icon: Shield },
];

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState("perfil");
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name || "Marcos Camargo",
    email: user?.email || "marcos@email.com",
    examDate: "2026-10-15",
    dailyGoal: "4",
    weeklyGoal: "20",
  });

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Personalize sua experiência de estudos
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="col-span-3">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full sidebar-item",
                  activeSection === s.id && "active"
                )}
              >
                <s.icon size={14} />
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-9">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection === "perfil" && (
              <Card>
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Informações do Perfil</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div className="w-16 h-16 rounded-full bg-chart-1 flex items-center justify-center text-white text-xl font-bold">
                      {form.name.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Funcionalidade de upload em breve!")}>
                        Alterar foto
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG ou GIF · max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome</label>
                      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                      <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Concurso</label>
                      <Input value="DATAPREV 2026 — Desenvolvimento de Software" readOnly className="text-sm opacity-60" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data da Prova</label>
                      <Input
                        type="date"
                        value={form.examDate}
                        onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button variant="indigo" size="sm" className="mt-2" onClick={() => toast.success("Perfil atualizado com sucesso!")}>
                    Salvar alterações
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "metas" && (
              <Card>
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Metas de Estudo</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        <Clock size={12} className="inline mr-1" />
                        Horas diárias (meta)
                      </label>
                      <Input
                        type="number"
                        value={form.dailyGoal}
                        onChange={(e) => setForm((f) => ({ ...f, dailyGoal: e.target.value }))}
                        min={1} max={12}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        <Calendar size={12} className="inline mr-1" />
                        Horas semanais (meta)
                      </label>
                      <Input
                        type="number"
                        value={form.weeklyGoal}
                        onChange={(e) => setForm((f) => ({ ...f, weeklyGoal: e.target.value }))}
                        min={5} max={80}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-foreground">Metas de questões</p>
                    {[
                      { label: "Questões por semana", defaultValue: "200" },
                      { label: "Flashcards por dia", defaultValue: "30" },
                      { label: "Simulados por mês", defaultValue: "4" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground">{m.label}</label>
                        <Input defaultValue={m.defaultValue} className="w-24 h-7 text-xs text-center" />
                      </div>
                    ))}
                  </div>

                  <Button variant="indigo" size="sm" onClick={() => toast.success("Metas atualizadas com sucesso!")}>
                    Salvar metas
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "aparencia" && (
              <Card>
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Aparência</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-3 block">Tema</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Escuro", icon: Moon, desc: "Linear, Vercel aesthetic" },
                        { id: "light", label: "Claro", icon: Sun, desc: "Modo claro limpo" },
                        { id: "system", label: "Sistema", icon: Globe, desc: "Segue o OS" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            "p-4 rounded-lg border text-center transition-all",
                            theme === t.id ? "border-chart-1 bg-chart-1/5" : "border-border hover:border-border/80"
                          )}
                        >
                          <t.icon size={20} className={cn("mx-auto mb-2", theme === t.id ? "text-chart-1" : "text-muted-foreground")} />
                          <p className="text-xs font-medium">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Tamanho da fonte</label>
                    <div className="flex gap-2">
                      {["Pequena", "Média", "Grande"].map((size, i) => (
                        <button
                          key={size}
                          className={cn(
                            "px-3 py-1.5 rounded-md border text-xs transition-colors",
                            i === 1 ? "border-chart-1 bg-chart-1/5 text-chart-1" : "border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "notificacoes" && (
              <Card>
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Notificações</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {[
                    { label: "Lembretes de revisão", desc: "Notificar quando há cards para revisar", on: true },
                    { label: "Meta diária", desc: "Lembrar de cumprir a meta diária", on: true },
                    { label: "Streak em risco", desc: "Alertar se a sequência pode quebrar", on: true },
                    { label: "Novos simulados", desc: "Sugerir simulados periodicamente", on: false },
                    { label: "Resumo semanal", desc: "Relatório de desempenho toda segunda", on: true },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.label}</p>
                        <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                      </div>
                      <button
                        onClick={() => toast.success(`${n.label} atualizado.`)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          n.on ? "bg-chart-1" : "bg-muted"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                          n.on ? "translate-x-5" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === "atalhos" && (
              <Card>
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Atalhos de Teclado</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    {[
                      { key: "⌘ K", action: "Pesquisa global" },
                      { key: "⌘ /", action: "Abrir tutor IA" },
                      { key: "T", action: "Iniciar/pausar timer" },
                      { key: "N", action: "Novo resumo" },
                      { key: "Q", action: "Resolver questão" },
                      { key: "F", action: "Novo flashcard" },
                      { key: "D", action: "Ir para o dashboard" },
                      { key: "E", action: "Ir para o edital" },
                      { key: "?", action: "Mostrar atalhos" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">{s.action}</span>
                        <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "dados" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="p-5 pb-0">
                    <CardTitle className="text-base">Backup e Exportação</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">Exportar dados</p>
                        <p className="text-[11px] text-muted-foreground">Baixar todos os seus dados em JSON</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.success("Download iniciado!")}>
                        <Download size={13} />
                        Exportar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">Importar dados</p>
                        <p className="text-[11px] text-muted-foreground">Restaurar de um backup anterior</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Selecione um arquivo JSON.")}>
                        <Upload size={13} />
                        Importar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">Exportar flashcards (Anki)</p>
                        <p className="text-[11px] text-muted-foreground">Formato .apkg compatível com Anki</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download size={13} />
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/20">
                  <CardHeader className="p-5 pb-0">
                    <CardTitle className="text-base text-red-500">Zona de Perigo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Excluir conta</p>
                        <p className="text-[11px] text-muted-foreground">Esta ação é irreversível</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => toast.error("Por motivos de segurança, entre em contato com o suporte.")}>
                        <Trash2 size={13} />
                        Excluir conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
