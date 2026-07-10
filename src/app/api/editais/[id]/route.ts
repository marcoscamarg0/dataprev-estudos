import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await request.json();

    const updatedEdital = await prisma.userEdital.update({
      where: { 
        id,
        userId: payload.userId, // Ensures user can only update their own
      },
      data: {
        title: data.title,
        role: data.role,
        overview: data.overview,
        curriculum: data.curriculum,
      },
    });

    return NextResponse.json({ edital: updatedEdital });
  } catch (error) {
    console.error("Erro ao atualizar edital:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.userEdital.delete({
      where: { 
        id,
        userId: payload.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar edital:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
