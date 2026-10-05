import { NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
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

    const parsedData = await callGeminiJson<{ questions?: any[] } | any[]>({
      prompt,
      temperature: 0.7,
    });

    if (Array.isArray(parsedData)) {
      return NextResponse.json({ questions: parsedData });
    }
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("AI Generate Questions Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

