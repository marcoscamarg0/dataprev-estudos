"use client";

import { motion } from "framer-motion";
import { Briefcase, Building2, BellRing, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VagasPage() {
  return (
    <div className="flex-1 overflow-auto bg-muted/20">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            Vagas Privadas
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Oportunidades no setor privado compatíveis com seu perfil e currículo.
          </p>
        </div>

        {/* Coming Soon State */}
        <div className="mt-12 bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Painel de Vagas em Desenvolvimento</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Em breve, a IA analisará o seu currículo gerado e buscará automaticamente vagas compatíveis no LinkedIn e Gupy para você se candidatar em um clique.
          </p>
          <Button variant="indigo" className="gap-2">
            <BellRing size={16} />
            Avise-me quando lançar
          </Button>
        </div>

        {/* AI feature hint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-lg">Seu currículo já está pronto?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enquanto o painel de vagas não chega, certifique-se de que seu currículo ATS-friendly está atualizado para não perder nenhuma oportunidade.
              </p>
            </div>
            <a href="/curriculo">
              <Button variant="outline" size="sm" className="w-fit gap-2">
                Atualizar Currículo
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
