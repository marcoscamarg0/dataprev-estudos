import { NextRequest, NextResponse } from "next/server";
import { callGemini, getGeminiApiKey } from "@/lib/gemini";

const CURRICULUM_SYSTEM_PROMPT = `Você é um especialista em currículos e sistemas ATS (Applicant Tracking System) para vagas de tecnologia.

⚠️ REGRA ABSOLUTA — ANTI-ALUCINAÇÃO:
NUNCA invente, adicione ou suponha informações que não estão nos dados fornecidos pelo candidato.
- NÃO invente métricas (ex: "reduziu 40%") se o candidato não informou
- NÃO adicione tecnologias ou ferramentas que não estão na lista de habilidades ou nas experiências
- NÃO crie experiências, empresas ou projetos fictícios
- NÃO adicione certificações que não foram informadas
- Se um campo estiver vazio ou não informado, simplesmente OMITA aquela seção
- Use APENAS as palavras exatas fornecidas pelo candidato; você pode reorganizar e reformular com verbos de ação, mas sem adicionar fatos novos

O QUE VOCÊ PODE FAZER:
✅ Reorganizar bullets com verbos de ação (Desenvolveu, Implementou, Liderou, Entregou...)
✅ Destacar palavras-chave da vaga que JÁ EXISTEM no perfil do candidato
✅ Reescrever descrições com linguagem mais impactante, sem mudar os fatos
✅ Ordenar as habilidades priorizando as que a vaga pede (mas só as que o candidato tem)
✅ Adaptar o resumo profissional para a vaga usando informações reais do candidato

FORMATO ATS (obrigatório):
- Sem tabelas, colunas ou formatação complexa
- Sem ícones ou símbolos especiais
- Seções em MAIÚSCULAS
- Bullets com hífen
- Separadores com pipe (|)

ESTRUTURA:
[NOME COMPLETO]
[E-mail] | [Telefone] | [LinkedIn] | [GitHub]

OBJETIVO PROFISSIONAL
[Resumo de 3-4 linhas baseado APENAS no resumo e cargo fornecidos, adaptado à vaga]

EXPERIÊNCIA PROFISSIONAL
[Empresa] | [Cargo] | [Período]
- [Bullet reformulado com verbo de ação, baseado nas informações fornecidas]

FORMAÇÃO ACADÊMICA
[Curso] | [Instituição] | [Ano]

HABILIDADES TÉCNICAS
[Apenas as habilidades que o candidato listou, priorizando as relevantes para a vaga]

CERTIFICAÇÕES (omitir seção se não houver)
[Nome] | [Emissor] | [Ano]

PROJETOS E CONQUISTAS (omitir seção se não houver)
[Título]
- [Descrição baseada no que o candidato forneceu]

IDIOMA: Sempre em português brasileiro
Retorne APENAS o texto do currículo, sem explicações nem comentários extras.`;

export async function POST(request: NextRequest) {
  try {
    const { profile, jobDescription } = await request.json();

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    if (!profile || !jobDescription) {
      return NextResponse.json(
        { error: "Perfil e descrição da vaga são obrigatórios." },
        { status: 400 }
      );
    }

    const userMessage = `
DESCRIÇÃO DA VAGA:
${jobDescription}

---

DADOS DO CANDIDATO:
Nome: ${profile.name || "Não informado"}
E-mail: ${profile.email || "Não informado"}
Telefone: ${profile.phone || "Não informado"}
LinkedIn: ${profile.linkedin || "Não informado"}
GitHub: ${profile.github || "Não informado"}
Cargo desejado: ${profile.targetRole || "Não informado"}

RESUMO PROFISSIONAL (base):
${profile.summary || "Não informado"}

EXPERIÊNCIAS PROFISSIONAIS:
${
  profile.experiences && profile.experiences.length > 0
    ? profile.experiences
        .map(
          (exp: {
            company: string;
            role: string;
            period: string;
            description: string;
          }) =>
            `Empresa: ${exp.company}
Cargo: ${exp.role}
Período: ${exp.period}
Descrição/Conquistas:
${exp.description}`
        )
        .join("\n\n")
    : "Não informado"
}

FORMAÇÃO ACADÊMICA:
${
  profile.education && profile.education.length > 0
    ? profile.education
        .map(
          (edu: { course: string; institution: string; year: string }) =>
            `${edu.course} | ${edu.institution} | ${edu.year}`
        )
        .join("\n")
    : "Não informado"
}

HABILIDADES TÉCNICAS:
${profile.skills ? profile.skills.join(", ") : "Não informado"}

CERTIFICAÇÕES:
${
  profile.certifications && profile.certifications.length > 0
    ? profile.certifications
        .map(
          (cert: { name: string; issuer: string; year: string }) =>
            `${cert.name} | ${cert.issuer} | ${cert.year}`
        )
        .join("\n")
    : "Nenhuma"
}

PROJETOS E CONQUISTAS DESTACADAS:
${
  profile.achievements && profile.achievements.length > 0
    ? profile.achievements
        .map(
          (ach: { title: string; description: string }) =>
            `${ach.title}: ${ach.description}`
        )
        .join("\n")
    : "Não informado"
}

---

Gere um currículo ATS-otimizado para esta vaga específica, usando os dados do candidato acima.
Adapte o resumo profissional e destaque as experiências mais relevantes para os requisitos da vaga.
Incorpore as palavras-chave da vaga naturalmente no texto.
`;

    console.log(`🤖 [Curriculum] Gerando currículo com Gemini`);

    const curriculum = await callGemini({
      systemInstruction: CURRICULUM_SYSTEM_PROMPT,
      prompt: userMessage,
      temperature: 0.5,
      maxOutputTokens: 3000,
    });

    return NextResponse.json({ curriculum });
  } catch (error: any) {
    console.error("Curriculum generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

