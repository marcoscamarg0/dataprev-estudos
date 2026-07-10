import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

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
    // Now receives extracted text (not a file) — parsing happens client-side
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Texto do PDF inválido ou muito curto." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY não configurada." },
        { status: 500 }
      );
    }

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    console.log(`🤖 [LinkedIn Parser] Enviando ${text.length} chars para IA (${model})`);

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "DATAPREV Estudos - LinkedIn PDF Parser",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: PARSE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extraia as informações do seguinte texto de perfil LinkedIn e retorne o JSON estruturado:\n\n${text}`,
          },
        ],
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: "Erro ao processar com IA. Tente novamente." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    console.log("✅ [LinkedIn Parser] IA retornou dados. Fazendo parse do JSON...");

    // Parse JSON from AI response — clean markdown code blocks if present
    let parsedProfile;
    try {
      const cleanedContent = content
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/gi, "")
        .trim();
      parsedProfile = JSON.parse(cleanedContent);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedProfile = JSON.parse(jsonMatch[0]);
        } catch {
          console.error("JSON parse error from AI:", content.slice(0, 200));
          return NextResponse.json(
            { error: "A IA não conseguiu estruturar os dados. Tente novamente." },
            { status: 500 }
          );
        }
      } else {
        console.error("No JSON in AI response:", content.slice(0, 200));
        return NextResponse.json(
          { error: "A IA não retornou um JSON válido. Tente novamente." },
          { status: 500 }
        );
      }
    }

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
  } catch (error) {
    console.error("LinkedIn PDF parse error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
