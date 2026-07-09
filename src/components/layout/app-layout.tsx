"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, useAuthStore } from "@/store";
import { cn, getDaysUntil, EXAM_DATE } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Zap,
  BookOpen,
  Timer,
  BarChart3,
  Library,
  Calendar,
  Bot,
  Target,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
  Bell,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  Trophy,
  RefreshCw,
  PenSquare,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/edital", icon: FileText, label: "Edital" },
      { href: "/cronograma", icon: Calendar, label: "Cronograma" },
    ],
  },
  {
    section: "Estudo",
    items: [
      { href: "/questoes", icon: HelpCircle, label: "Questões" },
      { href: "/simulados", icon: Zap, label: "Simulados" },
      { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
      { href: "/resumos", icon: PenSquare, label: "Resumos" },
      { href: "/revisoes", icon: RefreshCw, label: "Revisões" },
    ],
  },
  {
    section: "Ferramentas",
    items: [
      { href: "/timer", icon: Timer, label: "Timer" },
      { href: "/ia", icon: Bot, label: "Tutor IA" },
      { href: "/biblioteca", icon: Library, label: "Biblioteca" },
    ],
  },
  {
    section: "Análise",
    items: [
      { href: "/estatisticas", icon: BarChart3, label: "Estatísticas" },
      { href: "/metas", icon: Target, label: "Metas" },
      { href: "/conquistas", icon: Trophy, label: "Conquistas" },
    ],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setGlobalSearchOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const daysLeft = getDaysUntil(EXAM_DATE);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 56 : 232 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex flex-col border-r border-border bg-sidebar shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-chart-1 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0"
                >
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    DATAPREV 2026
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Dev. de Software
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar">
          {NAV_ITEMS.map((section) => (
            <div key={section.section} className="mb-4">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1"
                  >
                    {section.section}
                  </motion.p>
                )}
              </AnimatePresence>
              <nav className="space-y-0.5 px-1.5">
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "sidebar-item",
                          active && "active",
                          sidebarCollapsed && "justify-center px-0"
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <item.icon
                          size={15}
                          className={active ? "text-foreground" : ""}
                        />
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.1 }}
                              className="truncate"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Exam countdown */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-2 mb-2 p-3 rounded-md bg-chart-1/10 border border-chart-1/20"
            >
              <p className="text-[10px] font-medium text-chart-1 mb-1">
                PROVA EM
              </p>
              <p className="text-2xl font-bold text-foreground leading-none">
                {daysLeft}
              </p>
              <p className="text-[10px] text-muted-foreground">dias restantes</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom: Settings & Collapse */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          <Link href="/configuracoes">
            <div
              className={cn(
                "sidebar-item",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? "Configurações" : undefined}
            >
              <Settings size={15} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate text-xs"
                  >
                    Configurações
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className={cn(
              "sidebar-item w-full",
              sidebarCollapsed && "justify-center px-0"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={15} />
            ) : (
              <>
                <ChevronLeft size={15} />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs"
                >
                  Recolher
                </motion.span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          {/* Search */}
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-2 px-3 h-8 rounded-md border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors min-w-[200px] max-w-sm w-full"
          >
            <Search size={13} />
            <span className="flex-1 text-left text-xs">Pesquisar tudo...</span>
            <kbd className="text-[10px] bg-background border border-border rounded px-1">
              ⌘K
            </kbd>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Streak */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 mr-2">
              <Flame size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">7</span>
            </div>

            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-chart-1 rounded-full" />
            </Button>

            {/* User avatar */}
            <Link href="/perfil">
              <div className="w-7 h-7 rounded-full bg-chart-1 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-chart-1/50 transition-all ml-1">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={13} className="text-white" />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
