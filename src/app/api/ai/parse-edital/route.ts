import { NextRequest, NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";

const PARSE_EDITAL_PROMPT = (role: string) => {
  let prompt = `Você é um especialista em concursos públicos. Sua tarefa é extrair as disciplinas e os tópicos/assuntos do texto do edital fornecido e estruturá-los em um formato JSON estrito.
O texto fornecido é o "Conteúdo Programático" de um edital.`;

  if (role) {
    prompt += `\n\nATENÇÃO MÁXIMA: O usuário está estudando EXCLUSIVAMENTE para o cargo de "${role}". Você DEVE ignorar todas as matérias, conhecimentos específicos ou tópicos que não se apliquem a este cargo. Extraia APENAS o que for cobrado para "${role}".`;
  }

  prompt += `\n\nSua resposta DEVE ser APENAS um objeto JSON válido no seguinte formato:

{
  "banca": "Nome da Banca Examinadora detectada no edital (ex: FGV, Cebraspe, FCC, Cesgranrio, Vunesp, etc. Se não encontrar menção explícita, deduza ou use 'FGV')",
  "overview": "Resumo detalhado e mastigado sobre a vaga, estilo da prova e da banca, requisitos básicos e dicas de estudo baseadas no edital.",
  "curriculum": [
    {
      "name": "Nome da Disciplina (ex: Língua Portuguesa)",
      "topics": [
        { "name": "Tópico 1 (ex: Compreensão de texto)" },
        { "name": "Tópico 2" }
      ]
    }
  ]
}

Formato das interfaces para o array curriculum:

interface SubtopicData {
  id: string; // Gere um ID único e curto (kebab-case)
  name: string;
}

interface TopicData {
  id: string; // Gere um ID único e curto (kebab-case)
  name: string;
  subtopics: SubtopicData[];
}

interface SubjectData {
  id: string; // Gere um ID único e curto (kebab-case)
  name: string; // Nome da disciplina (ex: Língua Portuguesa, Raciocínio Lógico)
  category: "general" | "specific"; // Tente inferir se é conhecimentos gerais ou específicos
  color: string; // Gere uma cor hexadecimal para a disciplina (ex: "#6366f1")
  weight: number; // Defina como 1.0 por padrão
  topics: TopicData[];
}

Regras Críticas:
1. NÃO inclua blocos markdown como \`\`\`json. Responda APENAS com o JSON.
2. Agrupe os tópicos logicamente.
3. Não abrevie os nomes das matérias.
4. Se o texto estiver mal formatado, faça o melhor esforço para deduzir a hierarquia.
5. Filtre o conteúdo estritamente para o cargo desejado (se fornecido).`;

  return prompt;
};

export async function POST(req: NextRequest) {
  try {
    const { text, role } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: "Chave GEMINI_API_KEY não configurada no servidor (.env)" }, { status: 500 });
    }

    const parsedData = await callGeminiJson({
      systemInstruction: PARSE_EDITAL_PROMPT(role || ""),
      prompt: text,
      temperature: 0.1,
      maxOutputTokens: 8192,
    });

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Parse Edital error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

