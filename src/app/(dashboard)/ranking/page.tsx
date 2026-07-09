"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Flame, Crown, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getXpLevel } from "@/lib/utils";
import { useAuthStore } from "@/store";

interface RankingUser {
  id: string;
  name: string;
  avatar: string | null;
  totalXp: number;
}

export default function RankingPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await fetch("/api/ranking");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to load ranking", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" };
    if (index === 1) return { icon: Medal, color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/20" };
    if (index === 2) return { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/20" };
    return { icon: null, color: "text-muted-foreground", bg: "bg-muted" };
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-1 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center text-center"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <Trophy className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ranking Global</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Os estudantes mais dedicados do DATAPREV 2026. Estude, ganhe XP e suba no ranking!
        </p>
      </motion.div>

      <div className="grid gap-4">
        {users.map((rankUser, index) => {
          const rank = getRankBadge(index);
          const levelInfo = getXpLevel(rankUser.totalXp);
          const isCurrentUser = user?.id === rankUser.id;

          return (
            <motion.div
              key={rankUser.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "overflow-hidden transition-all",
                isCurrentUser ? "border-chart-1 ring-1 ring-chart-1/50 shadow-[0_0_15px_rgba(var(--chart-1),0.1)]" : "card-hover",
                index === 0 && !isCurrentUser && "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent"
              )}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex w-12 flex-col items-center justify-center shrink-0">
                    <span className={cn("text-lg font-bold", rank.color)}>
                      #{index + 1}
                    </span>
                    {rank.icon && <rank.icon size={14} className={cn("mt-1", rank.color)} />}
                  </div>

                  <div className="relative">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-full border-2", rank.bg)}>
                      {rankUser.avatar ? (
                        <img src={rankUser.avatar} alt={rankUser.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <UserIcon size={20} className={rank.color} />
                      )}
                    </div>
                    {isCurrentUser && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-chart-1 px-1.5 py-0.5 text-[8px] font-bold text-white">
                        VOCÊ
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold text-foreground">
                        {rankUser.name}
                      </p>
                      {index === 0 && (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px] px-1.5">
                          Líder
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-medium text-foreground">{levelInfo.name}</span>
                        <span>(Nvl {levelInfo.level})</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pr-4">
                    <div className="flex items-center justify-end gap-1.5 text-amber-500">
                      <Flame size={14} />
                      <span className="font-bold text-lg">{rankUser.totalXp.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Total XP
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {users.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhum estudante no ranking ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}