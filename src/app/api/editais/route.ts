import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);

  try {
    const whereClause = payload?.userId ? { userId: payload.userId } : {};
    const editais = await prisma.userEdital.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ editais });
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    return NextResponse.json({ editais: [] });
  }
}

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request);

  try {
    const data = await request.json();

    let userId = payload?.userId;
    if (!userId) {
      const existingUser = await prisma.user.findFirst();
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const defaultUser = await prisma.user.create({
          data: {
            name: "Estudante",
            email: "estudante@trampo-hub.local",
            role: "USER",
          },
        });
        userId = defaultUser.id;
      }
    }

    const newEdital = await prisma.userEdital.create({
      data: {
        userId,
        title: data.title,
        role: data.role,
        overview: data.overview,
        curriculum: data.curriculum,
      },
    });

    return NextResponse.json({ edital: newEdital });
  } catch (error) {
    console.error("Erro ao salvar edital:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
