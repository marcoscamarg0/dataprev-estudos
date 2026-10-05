import { NextRequest, NextResponse } from "next/server";
import { callGemini, getGeminiApiKey } from "@/lib/gemini";

function buildSystemPrompt(editalTitle?: string, role?: string, banca?: string, subjects?: any[]) {
  const currentBanca = (banca || "FGV").toUpperCase();
  const currentTitle = editalTitle || "DATAPREV 2026";
  const currentRole = role || "Desenvolvimento de Software";

  let subjectsSummary = "";
  if (subjects && subjects.length > 0) {
    subjectsSummary = subjects
      .slice(0, 10)
      .map((s: any) => `- ${s.name}: ${s.topics ? s.topics.map((t: any) => t.name).slice(0, 4).join(", ") : ""}`)
      .join("\n");
  }

  let bancaStyle = "";
  if (currentBanca.includes("FGV")) {
    bancaStyle = "- Estilo FGV: Cobre cenários práticos e situações-problema do dia a dia, com pegadinhas contextuais e alternativas longas e verossímeis. Explique sempre os 'casos de borda' e os motivos de cada distrator.";
  } else if (currentBanca.includes("CEBRASPE") || currentBanca.includes("CESPE")) {
    bancaStyle = "- Estilo Cebraspe: Foco em precisão terminológica, rigor com as normas técnicas (ISO, ITIL, COBIT) e palavras de alerta ('exclusivamente', 'prescinde', 'sempre').";
  } else if (currentBanca.includes("FCC")) {
    bancaStyle = "- Estilo FCC: Foco cirúrgico em código (Java, Python, SQL), sintaxe e literalidade de especificações técnicas.";
  } else if (currentBanca.includes("CESGRANRIO")) {
    bancaStyle = "- Estilo Cesgranrio: Foco corporativo aplicado a estatais e bancos públicos, modelagem de dados, arquitetura em nuvem e Scrum/Kanban.";
  } else {
    bancaStyle = `- Estilo da banca ${currentBanca}: Foco no padrão histórico e terminologia preferida por esta banca.`;
  }

  return `Você é um Tutor Pedagógico Especialista em concursos públicos de alto nível.
Você está preparando o aluno especificamente para o concurso:
🎯 CONCURSO / EDITAL: "${currentTitle}"
💼 CARGO: "${currentRole}"
🏛️ BANCA EXAMINADORA OFICIAL: "${currentBanca}"

${subjectsSummary ? `DISCIPLINAS DO EDITAL:\n${subjectsSummary}\n` : ""}

DIRETRIZES DA BANCA ${currentBanca}:
${bancaStyle}

DIRETRIZES PEDAGÓGICAS DE RESPOSTA:
1. Responda sempre em português brasileiro de forma didática, encorajadora e profunda.
2. Sempre que explicar um assunto ou resolver uma dúvida, aponte: "Como a banca ${currentBanca} costuma cobrar isso e qual pegadinha ela usa".
3. Use exemplos práticos de código, arquitetura ou diagramas textuais quando relevante.
4. Para código, use blocos de código formatados com a linguagem correspondente.
5. Quando o usuário pedir questões, crie questões inéditas no formato e padrão estrito da banca ${currentBanca} (com 5 alternativas A-E e gabarito comentado).
6. Quando solicitado /flashcard, crie no formato: FRENTE: [pergunta] | VERSO: [resposta].
7. Quando solicitado /cronograma, organize sugestões adaptadas ao peso das matérias deste edital.`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context, editalTitle, role, banca, subjects } = await request.json();

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY não configurada no servidor. Adicione-a no arquivo .env.",
        },
        { status: 500 }
      );
    }

    const basePrompt = buildSystemPrompt(editalTitle, role, banca, subjects);

    const systemContent = context
      ? `${basePrompt}\n\nMATERIAL DE ESTUDO ENVIADO PELO USUÁRIO (use como contexto quando relevante):\n${context}`
      : basePrompt;

    const responseContent = await callGemini({
      systemInstruction: systemContent,
      messages: messages || [],
      temperature: 0.7,
    });

    return NextResponse.json({ response: responseContent });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Não foi possível obter resposta do Gemini." },
      { status: 502 }
    );
  }
}

