// Complete DATAPREV 2026 curriculum based on the official FGV exam notice

export interface SubtopicData {
  id: string;
  name: string;
}

export interface TopicData {
  id: string;
  name: string;
  subtopics: SubtopicData[];
}

export interface SubjectData {
  id: string;
  name: string;
  category: "general" | "specific";
  color: string;
  weight: number;
  topics: TopicData[];
}

export const DATAPREV_CURRICULUM: SubjectData[] = [
  // ============ CONHECIMENTOS GERAIS ============
  {
    id: "portugues",
    name: "Língua Portuguesa",
    category: "general",
    color: "#6366f1",
    weight: 1.0,
    topics: [
      {
        id: "port-compreensao",
        name: "Compreensão e Interpretação de Textos",
        subtopics: [
          { id: "port-comp-01", name: "Leitura e interpretação" },
          { id: "port-comp-02", name: "Inferência e pressupostos" },
          { id: "port-comp-03", name: "Coerência e coesão textual" },
          { id: "port-comp-04", name: "Tipologia textual" },
        ],
      },
      {
        id: "port-gramatica",
        name: "Gramática",
        subtopics: [
          { id: "port-gram-01", name: "Morfologia e classes gramaticais" },
          { id: "port-gram-02", name: "Sintaxe da oração e do período" },
          { id: "port-gram-03", name: "Regência verbal e nominal" },
          { id: "port-gram-04", name: "Concordância verbal e nominal" },
          { id: "port-gram-05", name: "Crase" },
          { id: "port-gram-06", name: "Pontuação" },
        ],
      },
      {
        id: "port-ortografia",
        name: "Ortografia e Redação Oficial",
        subtopics: [
          { id: "port-ort-01", name: "Ortografia oficial" },
          { id: "port-ort-02", name: "Acentuação gráfica" },
          { id: "port-ort-03", name: "Redação oficial (PROT)" },
        ],
      },
    ],
  },
  {
    id: "raciocinio-logico",
    name: "Raciocínio Lógico",
    category: "general",
    color: "#8b5cf6",
    weight: 1.0,
    topics: [
      {
        id: "rl-logica",
        name: "Lógica Proposicional",
        subtopics: [
          { id: "rl-log-01", name: "Proposições e conectivos" },
          { id: "rl-log-02", name: "Tabelas-verdade" },
          { id: "rl-log-03", name: "Equivalências lógicas" },
          { id: "rl-log-04", name: "Silogismos e inferências" },
        ],
      },
      {
        id: "rl-conjuntos",
        name: "Teoria dos Conjuntos e Contagem",
        subtopics: [
          { id: "rl-conj-01", name: "Conjuntos e operações" },
          { id: "rl-conj-02", name: "Princípio multiplicativo" },
          { id: "rl-conj-03", name: "Permutações e combinações" },
          { id: "rl-conj-04", name: "Probabilidade básica" },
        ],
      },
      {
        id: "rl-sequencias",
        name: "Sequências e Padrões",
        subtopics: [
          { id: "rl-seq-01", name: "Sequências numéricas" },
          { id: "rl-seq-02", name: "Progressões aritméticas" },
          { id: "rl-seq-03", name: "Progressões geométricas" },
        ],
      },
    ],
  },
  {
    id: "legislacao",
    name: "Legislação e Ética",
    category: "general",
    color: "#ec4899",
    weight: 0.8,
    topics: [
      {
        id: "leg-admin",
        name: "Administração Pública",
        subtopics: [
          { id: "leg-adm-01", name: "Princípios constitucionais da administração" },
          { id: "leg-adm-02", name: "Lei 8.112/1990 — Estatuto do servidor público" },
          { id: "leg-adm-03", name: "Código de ética profissional" },
        ],
      },
      {
        id: "leg-lgpd",
        name: "LGPD",
        subtopics: [
          { id: "leg-lgpd-01", name: "Conceitos e princípios da LGPD" },
          { id: "leg-lgpd-02", name: "Bases legais para tratamento de dados" },
          { id: "leg-lgpd-03", name: "Direitos dos titulares" },
          { id: "leg-lgpd-04", name: "ANPD e penalidades" },
        ],
      },
    ],
  },

  // ============ CONHECIMENTOS ESPECÍFICOS ============
  {
    id: "java",
    name: "Java",
    category: "specific",
    color: "#f59e0b",
    weight: 2.0,
    topics: [
      {
        id: "java-fundamentos",
        name: "Fundamentos de Java",
        subtopics: [
          { id: "java-fund-01", name: "Tipos primitivos e wrappers" },
          { id: "java-fund-02", name: "Orientação a Objetos: classes, herança, polimorfismo" },
          { id: "java-fund-03", name: "Interfaces e classes abstratas" },
          { id: "java-fund-04", name: "Generics" },
          { id: "java-fund-05", name: "Collections Framework" },
          { id: "java-fund-06", name: "Exceptions" },
          { id: "java-fund-07", name: "I/O e Streams" },
        ],
      },
      {
        id: "java-moderno",
        name: "Java Moderno (8+)",
        subtopics: [
          { id: "java-mod-01", name: "Lambda expressions" },
          { id: "java-mod-02", name: "Streams API" },
          { id: "java-mod-03", name: "Optional" },
          { id: "java-mod-04", name: "Records (Java 16+)" },
          { id: "java-mod-05", name: "Sealed classes" },
          { id: "java-mod-06", name: "Pattern Matching" },
        ],
      },
      {
        id: "java-concorrencia",
        name: "Concorrência e Multithreading",
        subtopics: [
          { id: "java-conc-01", name: "Threads e Runnable" },
          { id: "java-conc-02", name: "ExecutorService e ThreadPool" },
          { id: "java-conc-03", name: "CompletableFuture" },
          { id: "java-conc-04", name: "Sincronização e locks" },
        ],
      },
    ],
  },
  {
    id: "spring",
    name: "Spring Framework",
    category: "specific",
    color: "#22c55e",
    weight: 2.0,
    topics: [
      {
        id: "spring-core",
        name: "Spring Core / IoC",
        subtopics: [
          { id: "spr-core-01", name: "Injeção de dependência (DI)" },
          { id: "spr-core-02", name: "IoC Container e ApplicationContext" },
          { id: "spr-core-03", name: "Anotações: @Component, @Service, @Repository" },
          { id: "spr-core-04", name: "AOP — Programação Orientada a Aspectos" },
        ],
      },
      {
        id: "spring-boot",
        name: "Spring Boot",
        subtopics: [
          { id: "spr-boot-01", name: "Auto-configuration" },
          { id: "spr-boot-02", name: "application.properties / yml" },
          { id: "spr-boot-03", name: "Starters e dependências" },
          { id: "spr-boot-04", name: "Profiles" },
          { id: "spr-boot-05", name: "Actuator" },
        ],
      },
      {
        id: "spring-mvc",
        name: "Spring MVC / Web",
        subtopics: [
          { id: "spr-mvc-01", name: "@RestController, @RequestMapping" },
          { id: "spr-mvc-02", name: "Request/Response handling" },
          { id: "spr-mvc-03", name: "Validação com Bean Validation" },
          { id: "spr-mvc-04", name: "Exception handling global" },
        ],
      },
      {
        id: "spring-data",
        name: "Spring Data JPA",
        subtopics: [
          { id: "spr-data-01", name: "JPA / Hibernate" },
          { id: "spr-data-02", name: "Repositories e query methods" },
          { id: "spr-data-03", name: "JPQL e Native Queries" },
          { id: "spr-data-04", name: "Transações (@Transactional)" },
        ],
      },
      {
        id: "spring-security",
        name: "Spring Security",
        subtopics: [
          { id: "spr-sec-01", name: "Authentication e Authorization" },
          { id: "spr-sec-02", name: "JWT com Spring Security" },
          { id: "spr-sec-03", name: "OAuth2 / OpenID Connect" },
          { id: "spr-sec-04", name: "CORS e CSRF" },
        ],
      },
    ],
  },
  {
    id: "rest-api",
    name: "REST e APIs",
    category: "specific",
    color: "#06b6d4",
    weight: 1.5,
    topics: [
      {
        id: "rest-principios",
        name: "Princípios REST",
        subtopics: [
          { id: "rest-prin-01", name: "Recursos e URIs" },
          { id: "rest-prin-02", name: "Métodos HTTP (GET, POST, PUT, PATCH, DELETE)" },
          { id: "rest-prin-03", name: "Status codes" },
          { id: "rest-prin-04", name: "HATEOAS" },
          { id: "rest-prin-05", name: "Versionamento de APIs" },
        ],
      },
      {
        id: "rest-design",
        name: "Design de APIs",
        subtopics: [
          { id: "rest-des-01", name: "OpenAPI / Swagger" },
          { id: "rest-des-02", name: "Paginação e filtros" },
          { id: "rest-des-03", name: "Rate limiting" },
          { id: "rest-des-04", name: "API Gateway" },
        ],
      },
      {
        id: "graphql",
        name: "GraphQL (básico)",
        subtopics: [
          { id: "graphql-01", name: "Queries e Mutations" },
          { id: "graphql-02", name: "Schema definition language" },
        ],
      },
    ],
  },
  {
    id: "microservicos",
    name: "Microserviços",
    category: "specific",
    color: "#f97316",
    weight: 1.5,
    topics: [
      {
        id: "micro-arquitetura",
        name: "Arquitetura de Microserviços",
        subtopics: [
          { id: "micro-arq-01", name: "Monolito vs Microserviços" },
          { id: "micro-arq-02", name: "Decomposição por domínio (DDD)" },
          { id: "micro-arq-03", name: "Comunicação síncrona (REST, gRPC)" },
          { id: "micro-arq-04", name: "Comunicação assíncrona (mensageria)" },
          { id: "micro-arq-05", name: "Service discovery" },
          { id: "micro-arq-06", name: "Circuit breaker (Resilience4j)" },
        ],
      },
      {
        id: "micro-padroes",
        name: "Padrões de Microserviços",
        subtopics: [
          { id: "micro-pad-01", name: "Saga pattern" },
          { id: "micro-pad-02", name: "API Gateway pattern" },
          { id: "micro-pad-03", name: "CQRS" },
          { id: "micro-pad-04", name: "Event Sourcing" },
        ],
      },
    ],
  },
  {
    id: "banco-dados",
    name: "Banco de Dados",
    category: "specific",
    color: "#84cc16",
    weight: 1.5,
    topics: [
      {
        id: "bd-relacional",
        name: "Banco de Dados Relacional",
        subtopics: [
          { id: "bd-rel-01", name: "Modelagem ER" },
          { id: "bd-rel-02", name: "Normalização (1FN, 2FN, 3FN, BCNF)" },
          { id: "bd-rel-03", name: "SQL — DDL, DML, DQL, DCL" },
          { id: "bd-rel-04", name: "Joins, subqueries, window functions" },
          { id: "bd-rel-05", name: "Índices e performance" },
          { id: "bd-rel-06", name: "Transações e ACID" },
          { id: "bd-rel-07", name: "PostgreSQL" },
          { id: "bd-rel-08", name: "MySQL / MariaDB" },
        ],
      },
      {
        id: "bd-nosql",
        name: "Banco de Dados NoSQL",
        subtopics: [
          { id: "bd-nosql-01", name: "MongoDB (documentos)" },
          { id: "bd-nosql-02", name: "Redis (chave-valor, cache)" },
          { id: "bd-nosql-03", name: "Cassandra (colunas)" },
          { id: "bd-nosql-04", name: "Teorema CAP" },
          { id: "bd-nosql-05", name: "Consistência eventual" },
        ],
      },
    ],
  },
  {
    id: "docker-k8s",
    name: "Docker e Kubernetes",
    category: "specific",
    color: "#0ea5e9",
    weight: 1.5,
    topics: [
      {
        id: "docker-core",
        name: "Docker",
        subtopics: [
          { id: "docker-01", name: "Containers vs VMs" },
          { id: "docker-02", name: "Dockerfile e imagens" },
          { id: "docker-03", name: "Docker Compose" },
          { id: "docker-04", name: "Volumes e networks" },
          { id: "docker-05", name: "Docker Hub e registries" },
        ],
      },
      {
        id: "k8s-core",
        name: "Kubernetes",
        subtopics: [
          { id: "k8s-01", name: "Arquitetura do cluster" },
          { id: "k8s-02", name: "Pods, Deployments, Services" },
          { id: "k8s-03", name: "ConfigMaps e Secrets" },
          { id: "k8s-04", name: "Ingress e Load Balancer" },
          { id: "k8s-05", name: "Helm charts" },
          { id: "k8s-06", name: "Auto-scaling (HPA/VPA)" },
        ],
      },
    ],
  },
  {
    id: "devops",
    name: "DevOps e CI/CD",
    category: "specific",
    color: "#a855f7",
    weight: 1.0,
    topics: [
      {
        id: "devops-cicd",
        name: "CI/CD",
        subtopics: [
          { id: "devops-01", name: "Conceitos de CI/CD" },
          { id: "devops-02", name: "GitHub Actions" },
          { id: "devops-03", name: "Jenkins" },
          { id: "devops-04", name: "GitLab CI" },
          { id: "devops-05", name: "Pipelines e stages" },
        ],
      },
      {
        id: "devops-iac",
        name: "Infraestrutura como Código",
        subtopics: [
          { id: "devops-iac-01", name: "Terraform" },
          { id: "devops-iac-02", name: "Ansible" },
          { id: "devops-iac-03", name: "Observabilidade (Prometheus, Grafana)" },
        ],
      },
    ],
  },
  {
    id: "cloud",
    name: "Cloud Computing",
    category: "specific",
    color: "#14b8a6",
    weight: 1.0,
    topics: [
      {
        id: "cloud-conceitos",
        name: "Conceitos de Cloud",
        subtopics: [
          { id: "cloud-01", name: "IaaS, PaaS, SaaS, FaaS" },
          { id: "cloud-02", name: "Cloud pública, privada, híbrida" },
          { id: "cloud-03", name: "Escalabilidade e elasticidade" },
        ],
      },
      {
        id: "cloud-aws",
        name: "AWS (principais serviços)",
        subtopics: [
          { id: "cloud-aws-01", name: "EC2, S3, RDS, Lambda" },
          { id: "cloud-aws-02", name: "VPC e redes na AWS" },
          { id: "cloud-aws-03", name: "IAM e segurança" },
          { id: "cloud-aws-04", name: "SQS, SNS, EventBridge" },
        ],
      },
    ],
  },
  {
    id: "git",
    name: "Git e Controle de Versão",
    category: "specific",
    color: "#f43f5e",
    weight: 1.0,
    topics: [
      {
        id: "git-core",
        name: "Git Core",
        subtopics: [
          { id: "git-01", name: "Comandos básicos (clone, add, commit, push, pull)" },
          { id: "git-02", name: "Branches e merging" },
          { id: "git-03", name: "Rebase e cherry-pick" },
          { id: "git-04", name: "Git Flow e trunk-based development" },
          { id: "git-05", name: "Pull requests e code review" },
        ],
      },
    ],
  },
  {
    id: "linux",
    name: "Linux e Sistemas Operacionais",
    category: "specific",
    color: "#fb923c",
    weight: 1.0,
    topics: [
      {
        id: "linux-core",
        name: "Linux",
        subtopics: [
          { id: "linux-01", name: "Comandos essenciais" },
          { id: "linux-02", name: "Gerenciamento de processos" },
          { id: "linux-03", name: "Permissões e usuários" },
          { id: "linux-04", name: "Shell scripting" },
          { id: "linux-05", name: "Redes no Linux (netstat, ss, curl)" },
        ],
      },
    ],
  },
  {
    id: "redes",
    name: "Redes e Protocolos",
    category: "specific",
    color: "#38bdf8",
    weight: 1.0,
    topics: [
      {
        id: "redes-modelo",
        name: "Modelos OSI e TCP/IP",
        subtopics: [
          { id: "redes-01", name: "Camadas OSI" },
          { id: "redes-02", name: "TCP vs UDP" },
          { id: "redes-03", name: "HTTP/HTTPS e TLS" },
          { id: "redes-04", name: "DNS, DHCP, NAT" },
          { id: "redes-05", name: "WebSockets e HTTP/2" },
        ],
      },
      {
        id: "redes-seguranca",
        name: "Segurança de Redes",
        subtopics: [
          { id: "redes-seg-01", name: "Firewall e VPN" },
          { id: "redes-seg-02", name: "OWASP Top 10" },
          { id: "redes-seg-03", name: "Criptografia simétrica e assimétrica" },
          { id: "redes-seg-04", name: "Certificados digitais e PKI" },
        ],
      },
    ],
  },
  {
    id: "testes",
    name: "Testes de Software",
    category: "specific",
    color: "#a78bfa",
    weight: 1.0,
    topics: [
      {
        id: "testes-tipos",
        name: "Tipos de Testes",
        subtopics: [
          { id: "testes-01", name: "Testes unitários (JUnit 5)" },
          { id: "testes-02", name: "Testes de integração" },
          { id: "testes-03", name: "Testes end-to-end" },
          { id: "testes-04", name: "Testes de performance (JMeter)" },
          { id: "testes-05", name: "TDD e BDD" },
          { id: "testes-06", name: "Mockito e mocking" },
          { id: "testes-07", name: "Cobertura de código" },
        ],
      },
    ],
  },
  {
    id: "clean-code",
    name: "Clean Code e Boas Práticas",
    category: "specific",
    color: "#fbbf24",
    weight: 1.0,
    topics: [
      {
        id: "clean-code-core",
        name: "Clean Code",
        subtopics: [
          { id: "cc-01", name: "Nomenclatura e funções" },
          { id: "cc-02", name: "SOLID principles" },
          { id: "cc-03", name: "DRY, KISS, YAGNI" },
          { id: "cc-04", name: "Refactoring" },
          { id: "cc-05", name: "Code smells" },
        ],
      },
      {
        id: "design-patterns",
        name: "Design Patterns",
        subtopics: [
          { id: "dp-01", name: "Creational: Singleton, Factory, Builder, Prototype" },
          { id: "dp-02", name: "Structural: Adapter, Decorator, Facade, Proxy" },
          { id: "dp-03", name: "Behavioral: Strategy, Observer, Command, Template Method" },
        ],
      },
    ],
  },
  {
    id: "arquitetura",
    name: "Arquitetura de Software",
    category: "specific",
    color: "#e879f9",
    weight: 1.0,
    topics: [
      {
        id: "arq-padroes",
        name: "Padrões Arquiteturais",
        subtopics: [
          { id: "arq-01", name: "MVC, MVP, MVVM" },
          { id: "arq-02", name: "Hexagonal (Ports & Adapters)" },
          { id: "arq-03", name: "Clean Architecture" },
          { id: "arq-04", name: "DDD (Domain-Driven Design)" },
          { id: "arq-05", name: "Event-Driven Architecture" },
        ],
      },
    ],
  },
  {
    id: "mensageria",
    name: "Mensageria e Streaming",
    category: "specific",
    color: "#fb7185",
    weight: 0.8,
    topics: [
      {
        id: "msg-kafka",
        name: "Apache Kafka",
        subtopics: [
          { id: "kafka-01", name: "Conceitos: topics, partitions, consumer groups" },
          { id: "kafka-02", name: "Produtores e consumidores" },
          { id: "kafka-03", name: "Kafka com Spring" },
        ],
      },
      {
        id: "msg-rabbitmq",
        name: "RabbitMQ",
        subtopics: [
          { id: "rmq-01", name: "AMQP e exchanges" },
          { id: "rmq-02", name: "Filas e bindings" },
        ],
      },
    ],
  },
];

export const TOTAL_TOPICS = DATAPREV_CURRICULUM.reduce(
  (acc, subj) => acc + subj.topics.length,
  0
);

export const TOTAL_SUBTOPICS = DATAPREV_CURRICULUM.reduce(
  (acc, subj) =>
    acc + subj.topics.reduce((a, t) => a + t.subtopics.length, 0),
  0
);
