import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".json"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const items = await prisma.libraryItem.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "Sem título";
    const type = (formData.get("type") as string) || "pdf";
    const url = (formData.get("url") as string) || null;
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let fileUrl: string | null = url;
    let extractedContent: string | null = null;

    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Arquivo muito grande (máx. 20MB)" },
          { status: 400 }
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name).toLowerCase();
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

      const userDir = path.join(UPLOAD_DIR, auth.userId);
      await mkdir(userDir, { recursive: true });
      await writeFile(path.join(userDir, safeName), bytes);

      fileUrl = `/uploads/${auth.userId}/${safeName}`;

      // Extrai conteúdo textual para uso como contexto pelo tutor de IA
      if (TEXT_EXTENSIONS.includes(ext)) {
        extractedContent = bytes.toString("utf-8").slice(0, 20000);
      }
    }

    const item = await prisma.libraryItem.create({
      data: {
        userId: auth.userId,
        type,
        title,
        url: fileUrl,
        content: extractedContent,
        tags,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Library upload error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar o material" },
      { status: 500 }
    );
  }
}
