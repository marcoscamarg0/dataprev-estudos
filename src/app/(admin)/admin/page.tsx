"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Activity, Clock, Search, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  totalXp: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [user, router]);

  const toggleRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`Cargo atualizado para ${newRole}`);
      } else {
        toast.error("Erro ao atualizar cargo");
      }
    } catch (error) {
      toast.error("Erro ao atualizar cargo");
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Painel de Administração
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                Acesso Restrito
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os estudantes e monitore as atividades da plataforma.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users size={20} className="text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total de Estudantes</p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Activity size={20} className="text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-bold">{users.reduce((acc, u) => acc + u.totalXp, 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">XP Total Gerado</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Shield size={20} className="text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-bold">{users.filter(u => u.role === "ADMIN").length}</p>
            <p className="text-sm text-muted-foreground mt-1">Administradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Usuários Cadastrados</CardTitle>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Usuário</th>
                  <th className="px-4 py-3 text-left font-medium">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-right font-medium">XP Total</th>
                  <th className="px-4 py-3 text-right font-medium">Data de Cadastro</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={u.role === "ADMIN" ? "border-amber-500/50 text-amber-500" : ""}>
                        {u.role === "ADMIN" && <Shield size={10} className="mr-1" />}
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-chart-1">{u.totalXp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRole(u.id, u.role)}
                        disabled={u.id === user.id}
                      >
                        {u.role === "ADMIN" ? "Remover Admin" : "Tornar Admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}