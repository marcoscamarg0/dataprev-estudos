import { NextRequest, NextResponse } from "next/server";
import { callGeminiJson, getGeminiApiKey } from "@/lib/gemini";
import { TopicBancaAnalysis } from "@/lib/curriculum";

export async function POST(req: NextRequest) {
  try {
    const {
      banca = "FGV",
      role = "Desenvolvedor de Software",
      editalTitle = "Concurso Público",
      subjectName,
      topicName,
      subtopics = [],
    } = await req.json();

    if (!topicName || !subjectName) {
      return NextResponse.json(
        { error: "subjectName e topicName são obrigatórios" },
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

    const systemPrompt = `Você é um Auditor e Professor Especialista em Concursos Públicos, com domínio profundo sobre o estilo, histórico de provas e padrões de cobrança da banca examinadora "${banca}".
Sua missão é realizar uma pesquisa aprofundada na web e análise estatística/pedagógica sobre como a banca "${banca}" cobra o tópico "${topicName}" da disciplina "${subjectName}" para o cargo/área "${role}" (${editalTitle}).

Você deve retornar APENAS um objeto JSON estrito com o seguinte formato:

{
  "importance": "Alta" | "Média" | "Baixa",
  "relevanceScore": 9, // Nota de 1 a 10 de probabilidade de cair nesta prova da banca
  "approachStyle": "Resumo do estilo de cobrança (ex: Casos Práticos com Código, Interpretação Semântica e Contextual, Letra da Lei e Prazos, Decoreba de Sintaxe/Configurações, Resolução de Problemas Arquiteturais)",
  "frequentQuestions": [
    "Subtópico ou conceito específico 1 que a banca mais repete em provas",
    "Conceito específico 2 mais cobrado",
    "Conceito específico 3 mais cobrado"
  ],
  "commonTraps": [
    "Pegadinha clássica 1 que a banca costuma usar para confundir o candidato",
    "Pegadinha clássica 2 muito frequente nas alternativas incorretas"
  ],
  "howToStudy": "Orientação tática e direta de 2 a 3 parágrafos explicando como o candidato deve estudar este tópico especificamente para vencer a banca ${banca}.",
  "webReferences": [
    {
      "title": "Nome da fonte de referência ou documentação (ex: Documentação Oficial Spring / Artigo QConcursos / Lei 14.133 / MDN Web Docs)",
      "url": "URL recomendada de consulta ou documentação oficial",
      "snippet": "Por que esta fonte é essencial para este conteúdo na banca"
    }
  ],
  "sampleQuestionSnippet": {
    "statement": "Enunciado fiel e realista no estilo característico da banca ${banca} para o cargo de ${role}.",
    "alternatives": [
      "A) Alternativa A",
      "B) Alternativa B",
      "C) Alternativa C",
      "D) Alternativa D",
      "E) Alternativa E"
    ],
    "correctAnswer": "A",
    "explanation": "Explicação detalhada e comentada do porquê o gabarito é este e onde está a pegadinha."
  }
}

Regras:
1. Responda estritamente em português do Brasil.
2. Seja ultra preciso com as idiossincrasias da banca ${banca}. Por exemplo: FGV adora enunciados longos e ambíguos ou código prático; Cebraspe adora pegadinhas de generalização ('sempre', 'nunca') e assertivas Certo/Errado; FCC foca em precisão conceitual e literalidade; Cesgranrio foca em cenários corporativos reais.
3. Não use blocos de código markdown desnecessários fora do JSON.`;

    const userPrompt = `Realize a pesquisa e análise da banca "${banca}" para o conteúdo:
- Concurso/Edital: ${editalTitle}
- Cargo: ${role}
- Disciplina: ${subjectName}
- Tópico: ${topicName}
- Subtópicos relacionados: ${subtopics.join(", ") || "Geral do tópico"}

Pesquise na internet e nos históricos recentes da banca ${banca} (2023-2026) e retorne o JSON estruturado.`;

    const analysis = await callGeminiJson<TopicBancaAnalysis>({
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      enableSearch: true,
      temperature: 0.2,
      maxOutputTokens: 8192,
    });

    const enrichedAnalysis: TopicBancaAnalysis = {
      ...analysis,
      analyzedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, analysis: enrichedAnalysis });
  } catch (error: any) {
    console.error("Erro na pesquisa de banca por tópico:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pesquisa da banca com IA." },
      { status: 500 }
    );
  }
}
