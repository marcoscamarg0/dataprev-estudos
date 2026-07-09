import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um tutor especializado em concursos públicos de TI, com foco no concurso DATAPREV 2026 (Perfil Desenvolvimento de Software) da banca FGV.

Seu objetivo é ajudar o candidato a aprender e dominar os conteúdos do edital:

CONHECIMENTOS GERAIS:
- Língua Portuguesa: interpretação, gramática, ortografia, redação oficial
- Raciocínio Lógico: proposições, conjuntos, sequências, probabilidade
- Legislação: administração pública, Lei 8.112, ética, LGPD

CONHECIMENTOS ESPECÍFICOS:
- Java (fundamentos, OOP, Generics, Collections, Java 8+, Streams, Lambda, CompletableFuture)
- Spring Framework (IoC/DI, Spring Boot, Spring MVC, Spring Data JPA, Spring Security)
- REST APIs (princípios REST, HTTP methods, status codes, OpenAPI/Swagger)
- Microserviços (arquitetura, padrões: Saga, Circuit Breaker, CQRS, Event Sourcing)
- Banco de Dados (SQL, PostgreSQL, MySQL, NoSQL: MongoDB, Redis, ACID, normalização)
- Docker e Kubernetes (containers, Dockerfile, compose, pods, deployments, services)
- DevOps e CI/CD (GitHub Actions, Jenkins, pipelines, Terraform, observabilidade)
- Cloud (AWS: EC2, S3, RDS, Lambda, VPC, IAM; conceitos IaaS/PaaS/SaaS)
- Git (branching, rebase, Git Flow, pull requests)
- Linux (comandos, processos, permissões, shell scripting)
- Redes (TCP/IP, HTTP/HTTPS, DNS, TLS, WebSockets)
- Segurança (OWASP Top 10, JWT, OAuth2, criptografia)
- Testes (TDD, BDD, JUnit 5, Mockito, testes de integração)
- Clean Code e SOLID principles
- Design Patterns (Creational, Structural, Behavioral)
- Arquitetura (Clean Architecture, Hexagonal, DDD, MVC)
- Mensageria (Kafka, RabbitMQ)

DIRETRIZES DE RESPOSTA:
1. Responda sempre em português brasileiro
2. Use exemplos práticos de código Java/Spring quando relevante
3. Relacione o conteúdo com questões típicas da banca FGV
4. Seja didático e conciso — explique como um professor experiente
5. Para código, use blocos de código formatados com a linguagem
6. Ao explicar conceitos, use analogias simples
7. Indique a relevância do tópico para a prova (alta/média/baixa)
8. Quando solicitado, crie questões no estilo FGV com 5 alternativas e gabarito comentado
9. Quando solicitado /flashcard, crie flashcards no formato: FRENTE: [pergunta] | VERSO: [resposta]
10. Quando solicitado /cronograma, pergunte sobre horas disponíveis e matérias prioritárias`;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY não configurada no servidor. Adicione-a no arquivo .env.",
        },
        { status: 500 }
      );
    }

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
    
    console.log(`🤖 [OpenRouter] Iniciando requisição para o modelo: ${model}`);

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nMATERIAL DE ESTUDO ENVIADO PELO USUÁRIO (use como contexto quando relevante):\n${context}`
      : SYSTEM_PROMPT;

    const orMessages = [
      { role: "system", content: systemContent },
      ...messages,
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "DATAPREV Estudos",
      },
      body: JSON.stringify({
        model,
        messages: orMessages,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: "Não foi possível obter resposta da IA (OpenRouter)." },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log("✅ [OpenRouter] Resposta recebida com sucesso da IA.");
    
    const content =
      data.choices?.[0]?.message?.content ?? "Não consegui gerar uma resposta.";

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
