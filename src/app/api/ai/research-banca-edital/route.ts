import { NextRequest, NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";
import { SubjectData, TopicData, BancaEditalProfile } from "@/lib/curriculum";

export async function POST(req: NextRequest) {
  try {
    const {
      banca = "FGV",
      role = "Desenvolvimento de Software",
      editalTitle = "Edital do Concurso",
      curriculum = [],
    } = await req.json();

    if (!curriculum || !Array.isArray(curriculum) || curriculum.length === 0) {
      return NextResponse.json(
        { error: "O conteúdo programático (curriculum) é obrigatório" },
        { status: 400 }
      );
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave GEMINI_API_KEY não configurada no servidor (.env)" },
        { status: 500 }
      );
    }

    // Simplify the curriculum structure for prompt efficiency
    const simplifiedCurriculum = curriculum.map((subj: SubjectData) => ({
      id: subj.id,
      name: subj.name,
      category: subj.category,
      topics: subj.topics.map((t) => ({
        id: t.id,
        name: t.name,
        subtopics: t.subtopics.map((s) => s.name),
      })),
    }));

    const systemPrompt = `Você é o maior especialista em inteligência de concursos públicos e bancas examinadoras do Brasil.
Sua tarefa é analisar o edital completo ("${editalTitle}") para o cargo de "${role}" organizado pela BANCA "${banca}".
Você deve pesquisar e cruzar os tópicos com os padrões reais da banca examinadora "${banca}" nos últimos concursos (2023-2026).

Você DEVE retornar APENAS um objeto JSON estrito com o seguinte formato:

{
  "bancaProfile": {
    "bancaName": "${banca}",
    "generalProfile": "Análise aprofundada do perfil pedagógico da banca ${banca}, seu nível de rigor, preferência por enunciados longos ou diretos, teoria vs prática, etc.",
    "scoringCharacteristics": "Detalhamento de como a prova é pontuada, penalidades (se houver), modelo de alternativas e perfil de nota de corte.",
    "recentTrends": [
      "Tendência 1 recente observada nas últimas provas da ${banca}",
      "Tendência 2 observada na web",
      "Tendência 3 observada na web"
    ],
    "recommendedStrategy": "Estratégia passo a passo recomendada pela IA para vencer a banca ${banca} neste concurso.",
    "topPrioritySubjects": ["Disciplina 1 mais crítica", "Disciplina 2 mais crítica"]
  },
  "subjects": [
    {
      "id": "ID_DA_DISCIPLINA",
      "bancaSubjectOverview": "Visão geral de como a banca ${banca} costuma abordar esta disciplina específica.",
      "topics": [
        {
          "id": "ID_DO_TOPICO",
          "importance": "Alta" | "Média" | "Baixa",
          "relevanceScore": 9, // 1 a 10
          "approachStyle": "Resumo do estilo de cobrança (ex: Casos Práticos com Código, Letra da Lei, Conceitual, Pegadinha de Sintaxe)",
          "frequentQuestions": [
            "Conceito mais cobrado pela ${banca} neste tópico"
          ],
          "commonTraps": [
            "Pegadinha clássica da ${banca} neste tópico"
          ],
          "howToStudy": "Dica objetiva de estudo deste tópico para a ${banca}."
        }
      ]
    }
  ]
}

Regras Cruciais:
1. Mantenha os mesmos IDs de disciplina e tópicos fornecidos.
2. Seja realista e estatisticamente fundamentado para a banca ${banca}.
3. Responda estritamente em português do Brasil sem markdown envolvente.`;

    const userPrompt = `Realize a pesquisa completa da banca "${banca}" para o cargo "${role}" e edital "${editalTitle}".
Disciplinas e Tópicos a analisar:
${JSON.stringify(simplifiedCurriculum, null, 2)}`;

    const response = await callGeminiJson<{
      bancaProfile: BancaEditalProfile;
      subjects: Array<{
        id: string;
        bancaSubjectOverview?: string;
        topics: Array<{
          id: string;
          importance: "Alta" | "Média" | "Baixa";
          relevanceScore?: number;
          approachStyle: string;
          frequentQuestions: string[];
          commonTraps: string[];
          howToStudy: string;
        }>;
      }>;
    }>({
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      enableSearch: true,
      temperature: 0.2,
      maxOutputTokens: 8192,
    });

    const now = new Date().toISOString();

    const bancaProfile: BancaEditalProfile = {
      ...response.bancaProfile,
      bancaName: banca,
      analyzedAt: now,
    };

    // Merge analysis back into original curriculum
    const enrichedCurriculum: SubjectData[] = curriculum.map((subj) => {
      const analyzedSubj = response.subjects?.find((s) => s.id === subj.id);
      return {
        ...subj,
        bancaSubjectOverview:
          analyzedSubj?.bancaSubjectOverview || subj.bancaSubjectOverview,
        topics: subj.topics.map((top: TopicData) => {
          const analyzedTopic = analyzedSubj?.topics?.find((t) => t.id === top.id);
          if (analyzedTopic) {
            return {
              ...top,
              bancaAnalysis: {
                importance: analyzedTopic.importance || "Média",
                relevanceScore: analyzedTopic.relevanceScore || 7,
                approachStyle: analyzedTopic.approachStyle || "Conceitual e Prático",
                frequentQuestions: analyzedTopic.frequentQuestions || [],
                commonTraps: analyzedTopic.commonTraps || [],
                howToStudy: analyzedTopic.howToStudy || "",
                analyzedAt: now,
              },
            };
          }
          return top;
        }),
      };
    });

    return NextResponse.json({
      success: true,
      bancaProfile,
      curriculum: enrichedCurriculum,
    });
  } catch (error: any) {
    console.error("Erro na pesquisa geral da banca:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pesquisa da banca via IA." },
      { status: 500 }
    );
  }
}
