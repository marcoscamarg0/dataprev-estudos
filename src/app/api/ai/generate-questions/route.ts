import { NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    const { editalTitle, role, banca = "FGV", subjects, count = 5 } = await req.json();

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: "No subjects provided" }, { status: 400 });
    }

    // Directives tailored to specific bancas
    let bancaDirectives = "";
    const bancaUpper = (banca || "FGV").toUpperCase();

    if (bancaUpper.includes("FGV")) {
      bancaDirectives = `
DIRETRIZES DA BANCA FGV (Fundação Getulio Vargas):
- Crie enunciados situacionais com casos práticos e cenários hipotéticos realistas ("Considere que um analista de sistemas foi incumbido de...", "Em um projeto de modernização de sistemas...").
- Questões reflexivas com nível de dificuldade apurado, alternativas plausíveis e sutis pegadinhas contextuais.
- Aborde arquitetura, boas práticas, design patterns e regras de negócio com profundidade teórica e prática.`;
    } else if (bancaUpper.includes("CEBRASPE") || bancaUpper.includes("CESPE")) {
      bancaDirectives = `
DIRETRIZES DA BANCA CEBRASPE (Cespe):
- Enunciados com textos-base de alta densidade conceitual e precisão terminológica estrita.
- Alternativas formuladas como assertivas técnicas rigorosas, com palavras de atenção como "exclusivamente", "sempre", "é prescindível", "salvo".
- Exija domínio profundo de normas formais (ISO/IEC, COBIT, ITIL) e definições clássicas da literatura de computação.`;
    } else if (bancaUpper.includes("FCC")) {
      bancaDirectives = `
DIRETRIZES DA BANCA FCC (Fundação Carlos Chagas):
- Foco cirúrgico em sintaxe de código real (Java, Python, SQL), diagramas lógicos e literalidade das especificações técnicas.
- Questões diretas com trechos de código e perguntas sobre o resultado da compilação ou execução.`;
    } else if (bancaUpper.includes("CESGRANRIO")) {
      bancaDirectives = `
DIRETRIZES DA BANCA CESGRANRIO:
- Foco em TI corporativa aplicada a empresas públicas e instituições financeiras (bancos de dados relacionais, microsserviços, segurança da informação e metodologias ágeis).
- Questões práticas, estruturadas e com foco na aplicabilidade imediata no ambiente de trabalho.`;
    } else {
      bancaDirectives = `
DIRETRIZES DA BANCA ${banca}:
- Siga rigorosamente o padrão clássico e o vocabulário técnico cobrado historicamente pela banca ${banca}.`;
    }

    const prompt = `Você é um membro sênior da Banca Examinadora ${bancaUpper}.
Sua missão é criar ${count} questões de múltipla escolha INÉDITAS, rigorosamente calibradas no estilo, exigência e características da banca ${bancaUpper}.

Concurso / Edital: "${editalTitle}"
Cargo Alvo: "${role || "Desenvolvedor / Especialista em TI"}"
Banca Examinadora: "${bancaUpper}"

${bancaDirectives}

Disciplinas e Tópicos Cobrados:
${subjects.map((s: any) => `- ${s.name}: ${s.topics ? s.topics.map((t: any) => t.name).join(", ") : ""}`).join("\n")}

REGRAS CRÍTICAS:
1. Cada questão deve ter exatamente 5 alternativas (A, B, C, D, E).
2. APENAS UMA alternativa deve ser a correta.
3. As 4 alternativas incorretas (distratores) devem ser inteligentes e verossímeis, no estilo característico da banca ${bancaUpper}.
4. Você DEVE fornecer uma 'explanation' (explicação comentada detalhada), fundamentando o gabarito oficial e justificando o erro das demais alternativas.
5. Indique o campo "banca": "${bancaUpper}" em cada questão.
6. Responda APENAS com um objeto JSON válido, sem blocos de código markdown.

Formato JSON EXIGIDO:
{
  "questions": [
    {
      "id": "q-${Date.now()}-1",
      "banca": "${bancaUpper}",
      "year": 2026,
      "statement": "Enunciado contextualizado no estilo da banca ${bancaUpper}...",
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
      "explanation": "Comentário pedagógico detalhado do gabarito oficial segundo a doutrina e as regras da banca ${bancaUpper}...",
      "tags": ["${bancaUpper}", "TI", "Concurso"]
    }
  ]
}`;

    const parsedData = await callGeminiJson<{ questions?: any[] } | any[]>({
      prompt,
      temperature: 0.6,
      maxOutputTokens: 8192,
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

