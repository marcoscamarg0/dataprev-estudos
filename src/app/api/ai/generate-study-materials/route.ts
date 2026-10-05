import { NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";

export interface StudyMaterialBundle {
  overview: string;
  studyPlan: {
    weekGoal: string;
    dailySchedule: Array<{
      day: string;
      subjects: string[];
      focus: string;
      estimatedMinutes: number;
    }>;
  };
  summaries: Array<{
    id: string;
    subjectName: string;
    title: string;
    keyPoints: string[];
    theorySummary: string;
    examTips: string;
  }>;
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    subjectName: string;
    difficulty: "fácil" | "médio" | "difícil";
  }>;
  keyTopicsPriority: Array<{
    subject: string;
    relevance: "Alta" | "Média" | "Baixa";
    weight: number;
  }>;
}

export async function POST(req: Request) {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor (.env)" },
        { status: 500 }
      );
    }

    const { editalTitle, role, banca = "FGV", subjects } = await req.json();

    if (!editalTitle || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: "Título do edital e disciplinas são obrigatórios." },
        { status: 400 }
      );
    }

    const bancaUpper = (banca || "FGV").toUpperCase();

    // Limit subjects passed to prompt to avoid huge payloads while getting comprehensive materials
    const selectedSubjects = subjects.slice(0, 8);
    const subjectsList = selectedSubjects
      .map((s: any) => `- ${s.name} (${s.category === "specific" ? "Conhecimentos Específicos" : "Conhecimentos Gerais"}): ${s.topics?.map((t: any) => t.name).slice(0, 5).join(", ")}`)
      .join("\n");

    const prompt = `Você é o maior especialista pedagógico em concursos públicos do Brasil, com especialização aprofundada na banca examinadora ${bancaUpper}.
Sua missão é criar o PACOTE COMPLETO DE MATERIAIS DE ESTUDO DE ALTO IMPACTO DIRECIONADO ESPECIFICAMENTE À BANCA ${bancaUpper} para:
Edital: "${editalTitle}"
Cargo Alvo: "${role || "Desenvolvedor / TI"}"
Banca Examinadora: "${bancaUpper}"

Disciplinas Principais do Edital:
${subjectsList}

DIRETRIZES PEDAGÓGICAS DA BANCA ${bancaUpper}:
- Todas as dicas de prova ("examTips") em cada resumo DEVEM explicar explicitamente como a banca ${bancaUpper} costuma cobrar o tema, suas pegadinhas típicas e palavras-chave que ela adora.
- Os resumos teóricos ("theorySummary") devem focar nas abordagens preferidas pela ${bancaUpper} (estudo de caso se for FGV, precisão terminológica estrita se for Cebraspe, código sintático se for FCC, etc.).
- Os flashcards devem abordar armadilhas recorrentes da ${bancaUpper}.
- O texto motivador ("overview") deve fazer uma análise estratégica do perfil da banca ${bancaUpper} para esta prova.

Gere um pacote pedagógico estruturado no formato JSON estrito, sem blocos markdown ao redor, seguindo rigorosamente a estrutura abaixo:

{
  "overview": "Texto motivador e estratégico explicando o perfil da banca ${bancaUpper}, quais matérias têm maior peso para a aprovação e o método de estudo recomendado para superar as pegadinhas desta banca.",
  "studyPlan": {
    "weekGoal": "Meta semanal clara focada no padrão da ${bancaUpper} (ex: Dominar 3 disciplinas prioritárias e resolver 100 questões comentadas da ${bancaUpper})",
    "dailySchedule": [
      {
        "day": "Segunda-feira",
        "subjects": ["Nome de 1 ou 2 matérias do edital"],
        "focus": "Foco prático do dia (ex: Conceitos fundamentais e resolução de 15 exercícios da ${bancaUpper})",
        "estimatedMinutes": 120
      },
      {
        "day": "Terça-feira",
        "subjects": ["Nome de 1 ou 2 matérias do edital"],
        "focus": "Foco prático do dia",
        "estimatedMinutes": 90
      },
      {
        "day": "Quarta-feira",
        "subjects": ["Nome de 1 ou 2 matérias do edital"],
        "focus": "Foco prático do dia",
        "estimatedMinutes": 120
      },
      {
        "day": "Quinta-feira",
        "subjects": ["Nome de 1 ou 2 matérias do edital"],
        "focus": "Foco prático do dia",
        "estimatedMinutes": 90
      },
      {
        "day": "Sexta-feira",
        "subjects": ["Nome de 1 ou 2 matérias do edital"],
        "focus": "Foco prático do dia",
        "estimatedMinutes": 120
      },
      {
        "day": "Sábado",
        "subjects": ["Revisão Geral e Simulado ${bancaUpper}"],
        "focus": "Simulado prático no estilo da ${bancaUpper} e revisão cirúrgica de erros",
        "estimatedMinutes": 180
      },
      {
        "day": "Domingo",
        "subjects": ["Descanso Ativo"],
        "focus": "Revisão leve de flashcards e descanso",
        "estimatedMinutes": 45
      }
    ]
  },
  "summaries": [
    {
      "id": "sum-1",
      "subjectName": "Nome da Disciplina",
      "title": "Apostila Rápida: [Nome do Assunto mais Cobrado pela ${bancaUpper}]",
      "keyPoints": [
        "Ponto-chave essencial 1",
        "Ponto-chave essencial 2",
        "Ponto-chave essencial 3"
      ],
      "theorySummary": "Resumo teórico aprofundado, didático e direto ao ponto com foco no que a ${bancaUpper} cobra. Use tópicos claros ou exemplos práticos se for código/regras.",
      "examTips": "Dica de Ouro da Banca ${bancaUpper}: [Explicação da pegadinha clássica ou detalhe que a ${bancaUpper} mais costuma usar para reprovar candidatos despreparados]."
    }
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "subjectName": "Nome da Disciplina",
      "front": "Pergunta direta ou conceito cobrado pela ${bancaUpper}?",
      "back": "Resposta clara, objetiva e fundamentada para memorização rápida.",
      "difficulty": "médio"
    }
  ],
  "keyTopicsPriority": [
    {
      "subject": "Nome da Disciplina",
      "relevance": "Alta",
      "weight": 3
    }
  ]
}

REGRAS OBRIGATÓRIAS:
1. Gere entre 4 e 6 'summaries' (resumos teóricos com dicas específicas da banca ${bancaUpper}) cobrindo as matérias mais estratégicas deste edital.
2. Gere entre 8 e 12 'flashcards' de fixação rápida distribuídos entre as matérias.
3. Adapte a linguagem especificamente para concursos da área de "${role || "TI / Desenvolvimento"}".
4. Retorne APENAS o JSON puro válido, sem blocos markdown.`;

    const materialBundle = await callGeminiJson<StudyMaterialBundle>({
      prompt,
      temperature: 0.3,
      maxOutputTokens: 8192,
    });

    return NextResponse.json({
      success: true,
      materials: materialBundle,
    });
  } catch (error: any) {
    console.error("AI Generate Study Materials Error:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao gerar materiais de estudo com IA." },
      { status: 500 }
    );
  }
}
