import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODELS = [
  "poolside/laguna-xs-2.1:free",
  "tencent/hy3:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-4-26b-a4b-it:free"
];
const MODELS_TO_TRY = process.env.OPENROUTER_MODELS ? process.env.OPENROUTER_MODELS.split(",") : DEFAULT_MODELS;

const PARSE_EDITAL_PROMPT = (role: string) => {
  let prompt = `Você é um especialista em concursos públicos. Sua tarefa é extrair as disciplinas e os tópicos/assuntos do texto do edital fornecido e estruturá-los em um formato JSON estrito.
O texto fornecido é o "Conteúdo Programático" de um edital.`;

  if (role) {
    prompt += `\n\nATENÇÃO MÁXIMA: O usuário está estudando EXCLUSIVAMENTE para o cargo de "${role}". Você DEVE ignorar todas as matérias, conhecimentos específicos ou tópicos que não se apliquem a este cargo. Extraia APENAS o que for cobrado para "${role}".`;
  }

  prompt += `\n\nSua resposta DEVE ser APENAS um objeto JSON válido no seguinte formato:

{
  "overview": "Resumo detalhado e mastigado sobre a vaga, estilo da prova, requisitos básicos e dicas de estudo baseadas no edital.",
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
    const { text, model, role } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Chave de API não configurada no servidor (.env)" }, { status: 500 });
    }

    let lastError = null;
    let rawContent = "";

    // If model is explicitly passed by frontend, try it first
    const models = model ? [model, ...MODELS_TO_TRY] : MODELS_TO_TRY;

    for (const m of models) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Trampo Hub",
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: "system", content: PARSE_EDITAL_PROMPT(role || "") },
              { role: "user", content: text },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenRouter Error with ${m}:`, errorText);
          lastError = errorText;
          continue;
        }

        const data = await response.json();
        rawContent = data.choices?.[0]?.message?.content || "";
        break; // Success
      } catch (err: any) {
        console.error(`Fetch error with ${m}:`, err);
        lastError = err.message;
      }
    }

    if (!rawContent) {
      throw new Error("All fallback models failed. Last error: " + lastError);
    }

    // Clean up potential markdown formatting and extract JSON
    let jsonStr = rawContent;
    const match = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      jsonStr = match[0];
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse JSON. Raw content:", rawContent);
      return NextResponse.json(
        { error: "A IA retornou um formato inválido." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Parse Edital error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
