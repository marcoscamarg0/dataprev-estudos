import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.libraryItem.findUnique({ where: { id } });
  if (!item || item.userId !== auth.userId) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await prisma.libraryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
