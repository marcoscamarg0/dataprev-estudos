import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const editais = await prisma.userEdital.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ editais });
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const newEdital = await prisma.userEdital.create({
      data: {
        userId: payload.userId,
        title: data.title,
        role: data.role,
        overview: data.overview,
        curriculum: data.curriculum, // SubjectData[]
      },
    });

    return NextResponse.json({ edital: newEdital });
  } catch (error) {
    console.error("Erro ao salvar edital:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
