"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Plus, Layers, Sparkles, SearchCheck } from "lucide-react";
import { useCurriculumStore, useActiveEdital } from "@/store/curriculumStore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function ConcursoSelector({ className }: { className?: string }) {
  const { editais, activeEditalId, setActiveEdital } = useCurriculumStore();
  const activeEdital = useActiveEdital();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-foreground transition-all select-none group text-left max-w-[280px] sm:max-w-xs"
        title="Clique para alternar entre seus concursos cadastrados"
      >
        <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <SearchCheck size={12} />
        </div>
        <div className="flex flex-col min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-indigo-400 font-mono font-medium uppercase tracking-wider">
              Concurso Ativo:
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
              {activeEdital?.banca || "FGV"}
            </span>
          </div>
          <span className="text-xs font-semibold text-white truncate group-hover:text-indigo-200">
            {activeEdital?.title || "Selecione o Edital"}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-indigo-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-80 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase text-zinc-400 tracking-wider">
                Seus Concursos ({editais.length})
              </span>
              <span className="text-[10px] text-zinc-500">Clique para ativar</span>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {editais.map((edital) => {
                const isActive = activeEditalId === edital.id;
                return (
                  <button
                    key={edital.id}
                    onClick={() => {
                      setActiveEdital(edital.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start justify-between gap-2 group ${
                      isActive
                        ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
                        : "hover:bg-zinc-900 border border-transparent text-zinc-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate group-hover:text-indigo-300">
                          {edital.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 shrink-0">
                          {edital.banca || "FGV"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        {edital.role && <span className="truncate max-w-[140px]">{edital.role}</span>}
                        <span>•</span>
                        <span>{edital.curriculum?.length || 0} matérias</span>
                      </div>
                      {edital.studyMaterials && (
                        <div className="pt-0.5 flex items-center gap-1 text-[10px] text-emerald-400">
                          <Sparkles size={10} />
                          <span>Materiais IA prontos</span>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-zinc-800/80">
              <Link
                href="/concursos"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
              >
                <Plus size={14} />
                <span>Cadastrar / Gerenciar Editais</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
