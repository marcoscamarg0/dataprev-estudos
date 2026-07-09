import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Verifica conexão com o banco de dados logo que instanciado
(async () => {
  try {
    await prisma.$connect();
    console.log("✅ [Prisma] Conectado ao banco de dados com sucesso!");
  } catch (error) {
    console.error("❌ [Prisma] Falha ao conectar no banco de dados:", error);
  }
})();
