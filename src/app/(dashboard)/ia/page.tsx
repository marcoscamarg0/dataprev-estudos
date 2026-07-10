"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Sparkles,
  Code,
  BookOpen,
  Lightbulb,
  FileText,
  RefreshCw,
  Copy,
  Check,
  User,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActiveCurriculum, useActiveEditalTitle } from "@/store/curriculumStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}



function formatMessage(content: string) {
  // Basic markdown rendering
  return content
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 list-none flex items-start gap-1.5">
            <span className="text-chart-1 mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{
              __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }} />
          </li>
        );
      }
      if (line === "") return <br key={i} />;
      return (
        <p key={i} dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/`(.*?)`/g, "<code class='px-1 py-0.5 bg-muted rounded text-[11px] font-mono'>$1</code>"),
        }} />
      );
    });
}

export default function IAPage() {
  const activeCurriculum = useActiveCurriculum();
  const activeTitle = useActiveEditalTitle();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Initial Message based on Edital
  useEffect(() => {
    if (messages.length === 0) {
      const subjectList = activeCurriculum.slice(0, 5).map(s => `• **${s.name}**`).join("\\n");
      const initial: Message = {
        id: "0",
        role: "assistant",
        content: `Olá! Sou seu Tutor de IA focado no edital **${activeTitle}**. Estou aqui para ajudar com os conteúdos da sua prova:\\n\\n${subjectList}\\n${activeCurriculum.length > 5 ? "• ... e muito mais!\\n" : ""}\\nPode me perguntar qualquer coisa, pedir resumos, explicações de questões ou dicas de estudos baseadas nas disciplinas do seu edital. Como posso ajudar?`,
        timestamp: new Date(),
      };
      setMessages([initial]);
    }
  }, [activeTitle, activeCurriculum, messages.length]);

  // Dynamic Quick Prompts
  const quickPrompts = activeCurriculum.flatMap(subj => 
    subj.topics.slice(0, 2).map(t => ({
      icon: "💡",
      text: `Explique ${t.name}`,
      category: subj.name
    }))
  ).sort(() => 0.5 - Math.random()).slice(0, 6);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(scrollToBottom, 100);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        let errorMessage = "Ocorreu um erro ao conectar com o Tutor IA.";
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {}

        const fallback: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **Erro de Conexão:**\n\n${errorMessage}\n\n*Verifique se a variável \`OPENROUTER_API_KEY\` está configurada corretamente no Render (ou no seu arquivo .env se estiver rodando localmente).*`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallback]);
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ **Falha de Rede:** Não foi possível alcançar o servidor. Verifique sua conexão com a internet.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 border-r border-border p-4 flex-col gap-4 shrink-0 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-chart-1" />
              <span className="text-xs font-semibold">Sugestões Rápidas</span>
            </div>
            <div className="space-y-1">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(qp.text)}
                  className="w-full text-left flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-sm shrink-0 mt-0.5">{qp.icon}</span>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                    {qp.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={13} className="text-amber-500" />
              <span className="text-xs font-semibold">Comandos Especiais</span>
            </div>
            <div className="space-y-1">
              {[
                { cmd: "/cronograma", desc: "Gerar cronograma de estudos" },
                { cmd: "/flashcard", desc: "Criar flashcard do conteúdo" },
                { cmd: "/exercicio", desc: "Criar questão prática" },
                { cmd: "/revisar", desc: "Revisar conceitos errados" },
              ].map((c) => (
                <button
                  key={c.cmd}
                  onClick={() => setInput(c.cmd + " ")}
                  className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <p className="text-[11px] font-mono text-chart-1">{c.cmd}</p>
                  <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-2 rounded-md bg-muted/30 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium">OpenRouter (Nemotron)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Conectado via API Key do arquivo de ambiente
            </p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-20 md:pb-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2 md:gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shrink-0 mt-1 md:mt-0",
                      message.role === "assistant"
                        ? "bg-chart-1/20 text-chart-1"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot size={14} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[85%] md:max-w-[80%] rounded-xl p-3 md:p-4 text-xs md:text-sm leading-relaxed",
                      message.role === "assistant"
                        ? "bg-card border border-border"
                        : "bg-chart-1/10 border border-chart-1/20"
                    )}
                  >
                    <div className="space-y-1 text-xs">
                      {formatMessage(message.content)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyMessage(message.id, message.content)}
                          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copied === message.id ? (
                            <Check size={11} className="text-chart-2" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-chart-1/20 flex items-center justify-center">
                  <Bot size={14} className="text-chart-1" />
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 md:p-4 bg-background z-10 shrink-0">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Pergunte sobre Java, Spring, Docker, REST, banco de dados..."
                  className="h-10 pr-10 text-sm"
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                variant="indigo"
                size="icon"
                className="h-10 w-10"
                disabled={!input.trim() || isLoading}
              >
                <Send size={14} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Powered by OpenRouter · Pressione Enter para enviar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
