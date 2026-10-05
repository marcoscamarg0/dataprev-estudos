import { NextRequest, NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";

const PARSE_SYSTEM_PROMPT = `Você é um especialista em análise de currículos e perfis do LinkedIn. 
Sua tarefa é extrair informações estruturadas de um texto extraído de um PDF de perfil do LinkedIn.

Retorne APENAS um JSON válido com a seguinte estrutura (sem comentários, sem markdown, apenas JSON puro):

{
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "phone": "Telefone se encontrado",
  "linkedin": "URL do linkedin se encontrado",
  "github": "URL do github se encontrado",
  "targetRole": "Cargo atual ou objetivo profissional",
  "summary": "Resumo profissional / About do LinkedIn",
  "experiences": [
    {
      "company": "Nome da Empresa",
      "role": "Cargo/Função",
      "period": "Mês/Ano – Mês/Ano ou Presente",
      "description": "Descrição das atividades e conquistas, uma por linha começando com traço"
    }
  ],
  "education": [
    {
      "course": "Nome do Curso",
      "institution": "Nome da Instituição",
      "year": "Ano de conclusão ou período"
    }
  ],
  "skills": ["habilidade1", "habilidade2", "habilidade3"],
  "certifications": [
    {
      "name": "Nome da Certificação",
      "issuer": "Emissor",
      "year": "Ano"
    }
  ],
  "achievements": [
    {
      "title": "Nome do projeto ou conquista",
      "description": "Descrição detalhada"
    }
  ]
}

REGRAS IMPORTANTES:
1. Se um campo não for encontrado no texto, use string vazia "" para strings ou array vazio [] para arrays
2. Para experiências, extraia TODAS as empresas e cargos encontrados
3. Para habilidades, extraia TODAS as skills/competências listadas, especialmente tecnologias
4. Converta datas para o formato "Mês/Ano – Mês/Ano" ou use "Presente" para empregos atuais
5. Para descrições de experiência, preserve as informações relevantes sobre responsabilidades e conquistas
6. Retorne SOMENTE o JSON, sem texto adicional, sem blocos de código, sem explicações`;

export async function POST(request: NextRequest) {
  try {
    // Receives extracted text from client
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Texto do PDF inválido ou muito curto." },
        { status: 400 }
      );
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada." },
        { status: 500 }
      );
    }

    console.log(`🤖 [LinkedIn Parser] Enviando ${text.length} chars para Gemini`);

    const parsedProfile = await callGeminiJson<any>({
      systemInstruction: PARSE_SYSTEM_PROMPT,
      prompt: `Extraia as informações do seguinte texto de perfil LinkedIn e retorne o JSON estruturado:\n\n${text}`,
      temperature: 0.1,
    });

    console.log("✅ [LinkedIn Parser] Gemini retornou dados. Estruturando IDs...");

    // Add IDs to array items (required by frontend)
    const ts = Date.now();
    const withIds = {
      ...parsedProfile,
      experiences: (parsedProfile.experiences || []).map(
        (e: object, i: number) => ({ id: `exp-${ts}-${i}`, ...e })
      ),
      education: (parsedProfile.education || []).map(
        (e: object, i: number) => ({ id: `edu-${ts}-${i}`, ...e })
      ),
      certifications: (parsedProfile.certifications || []).map(
        (c: object, i: number) => ({ id: `cert-${ts}-${i}`, ...c })
      ),
      achievements: (parsedProfile.achievements || []).map(
        (a: object, i: number) => ({ id: `ach-${ts}-${i}`, ...a })
      ),
      skills: parsedProfile.skills || [],
    };

    console.log(
      `✅ [LinkedIn Parser] OK — ${withIds.experiences?.length || 0} exp, ${withIds.education?.length || 0} form, ${withIds.skills?.length || 0} skills`
    );

    return NextResponse.json({ profile: withIds });
  } catch (error: any) {
    console.error("LinkedIn PDF parse error:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

