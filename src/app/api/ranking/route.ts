import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        totalXp: true,
      },
      orderBy: {
        totalXp: "desc",
      },
      take: 50,
    });

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("Ranking API Error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar ranking" },
      { status: 500 }
    );
  }
}