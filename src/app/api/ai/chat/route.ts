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

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama3.2";

    const ollamaMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Ollama not available" },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      response: data.message?.content || "Não consegui gerar uma resposta.",
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
