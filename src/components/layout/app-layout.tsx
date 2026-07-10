"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Shield,
  Menu,
  X,
  FileUser,
  Briefcase,
  SearchCheck,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  {
    section: "Oportunidades",
    items: [
      { href: "/concursos", icon: SearchCheck, label: "Editais" },
      { href: "/vagas", icon: Briefcase, label: "Vagas Privadas" },
    ],
  },
  {
    section: "Carreira & IA",
    items: [
      { href: "/curriculo", icon: FileUser, label: "Currículo IA" },
      { href: "/ia", icon: Bot, label: "Tutor Carreira" },
    ],
  },
  {
    section: "Meus Estudos",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/edital", icon: FileText, label: "Edital" },
      { href: "/cronograma", icon: Calendar, label: "Cronograma" },
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
      { href: "/biblioteca", icon: Library, label: "Biblioteca" },
      { href: "/ranking", icon: Trophy, label: "Ranking" },
      { href: "/conquistas", icon: Shield, label: "Conquistas" },
    ],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

function SidebarContent({
  isEffectivelyCollapsed,
  pathname,
  user,
  daysLeft,
  onItemClick,
}: {
  isEffectivelyCollapsed: boolean;
  pathname: string | null;
  user: { role?: string; name?: string; avatar?: string } | null;
  daysLeft: number;
  onItemClick?: () => void;
}) {
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-chart-1 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <AnimatePresence>
            {!isEffectivelyCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  Trampo Hub
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Concursos & Vagas
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
              {!isEffectivelyCollapsed && (
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
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                  >
                    <div
                      className={cn(
                        "sidebar-item",
                        active && "active",
                        isEffectivelyCollapsed && "justify-center px-0"
                      )}
                      title={isEffectivelyCollapsed ? item.label : undefined}
                    >
                      <item.icon
                        size={18}
                        className={active ? "text-foreground" : ""}
                      />
                      <AnimatePresence>
                        {!isEffectivelyCollapsed && (
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
        {!isEffectivelyCollapsed && (
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

      {/* Admin Link (Conditional) */}
      {user?.role === "ADMIN" && (
        <div className="px-1.5 mb-2 mt-2">
          <Link href="/admin" onClick={onItemClick}>
            <div
              className={cn(
                "sidebar-item text-amber-500 hover:text-amber-400 hover:bg-amber-500/10",
                isEffectivelyCollapsed && "justify-center px-0"
              )}
              title={isEffectivelyCollapsed ? "Painel Admin" : undefined}
            >
              <Shield size={18} />
              <AnimatePresence>
                {!isEffectivelyCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate text-sm font-medium"
                  >
                    Painel Admin
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, setGlobalSearchOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const daysLeft = getDaysUntil(EXAM_DATE);

  const isEffectivelyCollapsed = sidebarCollapsed && !isHovered;

  useEffect(() => setMounted(true), []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: 280 }}
            animate={{ x: 0 }}
            exit={{ x: 280 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[280px] flex flex-col border-l border-border bg-background z-50 md:hidden overflow-hidden shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X size={16} />
            </button>

            <SidebarContent
              isEffectivelyCollapsed={false}
              pathname={pathname}
              user={user}
              daysLeft={daysLeft}
              onItemClick={() => setMobileOpen(false)}
            />

            {/* Bottom settings */}
            <div className="border-t border-sidebar-border p-2 space-y-0.5">
              <Link href="/configuracoes" onClick={() => setMobileOpen(false)}>
                <div className="sidebar-item">
                  <Settings size={18} />
                  <span className="truncate text-xs">Configurações</span>
                </div>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isEffectivelyCollapsed ? 56 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative hidden md:flex flex-col border-r border-border bg-sidebar shrink-0 overflow-hidden z-20"
      >
        <SidebarContent
          isEffectivelyCollapsed={isEffectivelyCollapsed}
          pathname={pathname}
          user={user}
          daysLeft={daysLeft}
        />

        {/* Bottom: Settings & Collapse */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          <Link href="/configuracoes">
            <div
              className={cn(
                "sidebar-item",
                isEffectivelyCollapsed && "justify-center px-0"
              )}
              title={isEffectivelyCollapsed ? "Configurações" : undefined}
            >
              <Settings size={18} />
              <AnimatePresence>
                {!isEffectivelyCollapsed && (
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
              isEffectivelyCollapsed && "justify-center px-0"
            )}
          >
            {isEffectivelyCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
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

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-3 sm:px-4 border-b border-border bg-background shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Search */}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="flex items-center gap-2 px-3 h-8 rounded-md border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors w-full max-w-[180px] sm:max-w-sm"
            >
              <Search size={13} />
              <span className="flex-1 text-left text-xs hidden sm:block">Pesquisar tudo...</span>
              <span className="flex-1 text-left text-xs sm:hidden">Buscar...</span>
              <kbd className="text-[10px] bg-background border border-border rounded px-1 hidden sm:block">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Streak */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 mr-1 sm:mr-2">
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
            <Link href="/configuracoes">
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

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              title="Sair"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                logout();
                router.push("/login");
              }}
            >
              <LogOut size={15} />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
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

      {/* ── Mobile Bottom Navigation ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-14 px-1">
          <Link href="/dashboard" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors", pathname === "/dashboard" && "text-foreground")}>
            <LayoutDashboard size={20} className={pathname === "/dashboard" ? "text-indigo-500" : ""} />
            <span className="text-[10px] font-medium">Início</span>
          </Link>
          <Link href="/vagas" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors", pathname === "/vagas" && "text-foreground")}>
            <Briefcase size={20} className={pathname === "/vagas" ? "text-indigo-500" : ""} />
            <span className="text-[10px] font-medium">Vagas</span>
          </Link>
          <Link href="/curriculo" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors", pathname === "/curriculo" && "text-foreground")}>
            <FileUser size={20} className={pathname === "/curriculo" ? "text-indigo-500" : ""} />
            <span className="text-[10px] font-medium">Currículo</span>
          </Link>
          <Link href="/questoes" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors", pathname === "/questoes" && "text-foreground")}>
            <HelpCircle size={20} className={pathname === "/questoes" ? "text-indigo-500" : ""} />
            <span className="text-[10px] font-medium">Questões</span>
          </Link>
          <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors">
            <Menu size={20} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
