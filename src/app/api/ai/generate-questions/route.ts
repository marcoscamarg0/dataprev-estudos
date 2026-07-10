import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const DEFAULT_MODELS = [
  "poolside/laguna-xs-2.1:free",
  "tencent/hy3:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-4-26b-a4b-it:free"
];
const MODELS_TO_TRY = process.env.OPENROUTER_MODELS ? process.env.OPENROUTER_MODELS.split(",") : DEFAULT_MODELS;

export async function POST(req: Request) {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY environment variable");
    }

    const { editalTitle, subjects, count = 5 } = await req.json();

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: "No subjects provided" }, { status: 400 });
    }

    const prompt = `Você é um membro de uma Banca Examinadora de concursos de alto nível.
Sua tarefa é criar ${count} questões de múltipla escolha INÉDITAS baseadas nas seguintes disciplinas/tópicos do edital "${editalTitle}":

Disciplinas e Tópicos:
${subjects.map((s: any) => `- ${s.name}: ${s.topics.map((t: any) => t.name).join(", ")}`).join("\n")}

REGRAS CRÍTICAS:
1. Cada questão deve ter exatamente 5 alternativas (A, B, C, D, E).
2. APENAS UMA alternativa deve ser a correta.
3. Você deve fornecer uma 'explanation' (explicação detalhada) justificando a resposta correta e porque as outras estão incorretas.
4. Responda APENAS com um objeto JSON válido, sem blocos markdown (\`\`\`json).

Formato JSON EXIGIDO:
{
  "questions": [
    {
      "id": "gere-um-id-unico-tipo-hash",
      "statement": "Enunciado completo da questão...",
      "subject": "Nome da Disciplina",
      "topic": "Nome do Tópico Específico",
      "difficulty": "medium", 
      "alternatives": [
        { "letter": "A", "text": "Texto da alternativa", "isCorrect": false },
        { "letter": "B", "text": "Texto da alternativa", "isCorrect": true },
        { "letter": "C", "text": "Texto da alternativa", "isCorrect": false },
        { "letter": "D", "text": "Texto da alternativa", "isCorrect": false },
        { "letter": "E", "text": "Texto da alternativa", "isCorrect": false }
      ],
      "explanation": "Explicação detalhada do gabarito...",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}`;

    let lastError = null;
    let rawContent = "";

    for (const model of MODELS_TO_TRY) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenRouter API error with ${model}:`, errorText);
          lastError = errorText;
          continue; // Try next model on failure (like 429 rate limit)
        }

        const data = await response.json();
        rawContent = data.choices?.[0]?.message?.content || "";
        break; // Success! Stop trying models
      } catch (err: any) {
        console.error(`Fetch error with ${model}:`, err);
        lastError = err.message;
      }
    }

    if (!rawContent) {
      throw new Error("All fallback models failed. Last error: " + lastError);
    }

    // Cleanup Markdown block and extract JSON
    let jsonStr = rawContent;
    const match = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      jsonStr = match[0];
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData)) {
        return NextResponse.json({ questions: parsedData });
      }
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI. Raw content:", rawContent);
      return NextResponse.json({ error: "A IA retornou um formato inválido." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
