import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: payload.userId },
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
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

    const profile = await prisma.userProfile.upsert({
      where: { userId: payload.userId },
      update: {
        fullName: data.fullName,
        title: data.title,
        email: data.email,
        phone: data.phone,
        location: data.location,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        about: data.about,
        jobDescription: data.jobDescription,
        experiences: data.experiences || [],
        educations: data.educations || [],
        certifications: data.certifications || [],
        skills: data.skills || [],
        languages: data.languages || [],
      },
      create: {
        userId: payload.userId,
        fullName: data.fullName,
        title: data.title,
        email: data.email,
        phone: data.phone,
        location: data.location,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        about: data.about,
        jobDescription: data.jobDescription,
        experiences: data.experiences || [],
        educations: data.educations || [],
        certifications: data.certifications || [],
        skills: data.skills || [],
        languages: data.languages || [],
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
