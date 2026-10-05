import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DATAPREV_CURRICULUM, SubjectData } from "@/lib/curriculum";

export interface StudySummary {
  id: string;
  subjectName: string;
  title: string;
  keyPoints: string[];
  theorySummary: string;
  examTips: string;
}

export interface StudyFlashcard {
  id: string;
  front: string;
  back: string;
  subjectName: string;
  difficulty?: "fácil" | "médio" | "difícil";
}

export interface DailyPlan {
  day: string;
  subjects: string[];
  focus: string;
  estimatedMinutes: number;
}

export interface StudyMaterialBundle {
  overview?: string;
  studyPlan?: {
    weekGoal: string;
    dailySchedule: DailyPlan[];
  };
  summaries: StudySummary[];
  flashcards: StudyFlashcard[];
  keyTopicsPriority?: Array<{
    subject: string;
    relevance: "Alta" | "Média" | "Baixa";
    weight: number;
  }>;
}

export interface EditalData {
  id: string;
  title: string;
  role?: string;
  banca?: string;
  overview?: string;
  createdAt: string;
  curriculum: SubjectData[];
  studyMaterials?: StudyMaterialBundle;
}

// ==================== 1. DATAPREV 2026 ====================
export const DEFAULT_DATAPREV_MATERIALS: StudyMaterialBundle = {
  overview: "O concurso Dataprev 2026 para Desenvolvimento de Software (banca FGV) prioriza fortemente Java 17+, Spring Boot, microsserviços, SQL/PostgreSQL e DevOps (Docker/Kubernetes). O peso da prova prática e teórica exige domínio de conceitos arquiteturais e boas práticas (Clean Architecture, SOLID e Design Patterns).",
  studyPlan: {
    weekGoal: "Dominar o núcleo de Java/Spring, PostgreSQL e resolver 150 questões FGV",
    dailySchedule: [
      {
        day: "Segunda-feira",
        subjects: ["Java", "Língua Portuguesa"],
        focus: "Streams API, Lambdas, Optional e Sintaxe/Interpretação FGV",
        estimatedMinutes: 120,
      },
      {
        day: "Terça-feira",
        subjects: ["Spring Framework", "Banco de Dados"],
        focus: "Spring Boot, IoC/DI, Spring Data JPA e Normalização/SQL",
        estimatedMinutes: 120,
      },
      {
        day: "Quarta-feira",
        subjects: ["Microsserviços & REST", "Raciocínio Lógico"],
        focus: "Padrões Saga, Circuit Breaker, CQRS e Proposições Lógicas",
        estimatedMinutes: 90,
      },
      {
        day: "Quinta-feira",
        subjects: ["Docker e Kubernetes", "DevOps/CI-CD"],
        focus: "Dockerfile multistage, Pods, Deployments e Pipelines GitHub Actions",
        estimatedMinutes: 120,
      },
      {
        day: "Sexta-feira",
        subjects: ["Testes e Clean Code", "Segurança (OAuth2/JWT)"],
        focus: "JUnit 5, Mockito, OWASP Top 10 e Princípios SOLID",
        estimatedMinutes: 90,
      },
      {
        day: "Sábado",
        subjects: ["Simulado Geral FGV", "Revisão"],
        focus: "Simulado cronometrado de 40 questões e análise detalhada dos erros",
        estimatedMinutes: 180,
      },
      {
        day: "Domingo",
        subjects: ["Flashcards & Revisão Espaçada"],
        focus: "Revisão leve de 30 flashcards e recuperação mental",
        estimatedMinutes: 45,
      },
    ],
  },
  summaries: [
    {
      id: "sum-java-core",
      subjectName: "Java",
      title: "Apostila: Java Moderno, Streams API & Concorrência",
      keyPoints: [
        "Streams são preguiçosas (lazy evaluation) e não modificam a fonte original.",
        "Optional<T> foi criado para evitar NullPointerException em retornos de métodos.",
        "CompletableFuture permite encadear tarefas assíncronas de forma não-bloqueante.",
        "Records introduzem classes imutáveis concisas para DTOs sem boilerplate.",
      ],
      theorySummary: "A banca FGV adora cobrar a diferença entre operações intermediárias (filter, map, flatMap, sorted) e operações terminais (collect, forEach, reduce, count). Lembre-se: uma Stream só executa quando uma operação terminal é invocada!",
      examTips: "Atenção: 'map()' transforma 1 elemento em 1 elemento. 'flatMap()' achata fluxos e transforma 1 elemento em múltiplos elementos (Stream de Streams).",
    },
    {
      id: "sum-spring-boot",
      subjectName: "Spring Framework",
      title: "Apostila: Inversão de Controle, Injeção de Dependência & JPA",
      keyPoints: [
        "IoC (Inversion of Control) transfere o gerenciamento de objetos para o Spring Container.",
        "Injeção por construtor é a melhor prática recomendada (permite imutabilidade com final).",
        "@Transactional gerencia transações ACID automaticamente através de proxies dinâmicos.",
        "Escopos de Beans: Singleton (padrão, 1 por container) e Prototype (nova instância a cada requisição).",
      ],
      theorySummary: "No Spring Data JPA, queries derivadas (findBy...) são convertidas em SQL pelo framework. Para queries complexas, use @Query com JPQL ou nativeQuery = true. Cuidado com o problema N+1 ao carregar coleções Lazy!",
      examTips: "Na FGV, questões sobre ciclo de vida de beans costumam perguntar sobre as anotações @PostConstruct e @PreDestroy.",
    },
    {
      id: "sum-docker-k8s",
      subjectName: "Docker e Kubernetes",
      title: "Apostila: Containers, Imagens Multistage & Pods K8s",
      keyPoints: [
        "Containers compartilham o kernel do SO hospedeiro, ao contrário de Máquinas Virtuais.",
        "Dockerfile multistage gera imagens finais mínimas, separando o build do runtime.",
        "Pod é a menor unidade executável no Kubernetes, contendo 1 ou mais containers.",
        "Deployments garantem alta disponibilidade através de ReplicaSets e rolling updates.",
      ],
      theorySummary: "Para persistência em Docker, utilize Volumes gerenciados pelo Docker Daemon em vez de Bind Mounts em produção. No Kubernetes, ConfigMaps guardam dados não-sensíveis e Secrets guardam dados criptografados em base64.",
      examTips: "Diferença clássica de prova: ENTRYPOINT define o comando principal executado; CMD define argumentos padrão que podem ser sobrescritos pelo usuário na linha de comando.",
    },
    {
      id: "sum-bd-sql",
      subjectName: "Banco de Dados",
      title: "Apostila: Normalização, Índices B-Tree & Transações ACID",
      keyPoints: [
        "Propriedades ACID: Atomicidade (tudo ou nada), Consistência (regras válidas), Isolamento (concorrência segura), Durabilidade (permanente).",
        "1FN: Valores atômicos sem repetições. 2FN: Dependência funcional total da chave primária. 3FN: Sem dependências transitivas.",
        "Índices B-Tree aceleram buscas por igualdade e intervalo (O(log n)), mas aumentam custo de escrita (INSERT/UPDATE).",
      ],
      theorySummary: "Níveis de isolamento de transações: Read Uncommitted (leitura suja), Read Committed (leitura não-repetível evitada), Repeatable Read (leituras consistentes), Serializable (isolamento estrito).",
      examTips: "A FGV frequentemente coloca tabelas desnormalizadas e pede para identificar se fere a 2FN ou 3FN. Lembre-se: dependência transitiva (A -> B -> C) fere a 3FN!",
    },
  ],
  flashcards: [
    {
      id: "fc-1",
      subjectName: "Java",
      front: "Qual a diferença entre ArrayList e LinkedList em Java em termos de complexidade de acesso por índice?",
      back: "ArrayList possui acesso direto O(1) por ser indexado em array. LinkedList possui acesso O(n) porque precisa percorrer os nós da lista encadeada.",
      difficulty: "médio",
    },
    {
      id: "fc-2",
      subjectName: "Spring Framework",
      front: "Por que a injeção de dependência por construtor é preferida em relação a @Autowired no atributo?",
      back: "Garante imutabilidade (atributos 'final'), facilita testes unitários sem precisar do contexto Spring e previne NullPointerExceptions em tempo de compilação.",
      difficulty: "médio",
    },
    {
      id: "fc-3",
      subjectName: "Docker",
      front: "Qual a finalidade de um build 'multi-stage' em um Dockerfile?",
      back: "Reduzir o tamanho final da imagem, compilando o código em um estágio com SDK pesado e copiando apenas o artefato final para uma imagem leve de produção.",
      difficulty: "fácil",
    },
    {
      id: "fc-4",
      subjectName: "Banco de Dados",
      front: "O que caracteriza a 3ª Forma Normal (3FN)?",
      back: "Estar na 2FN e nenhum atributo não-chave depender de outro atributo não-chave (ausência de dependência transitiva).",
      difficulty: "médio",
    },
  ],
  keyTopicsPriority: [
    { subject: "Java", relevance: "Alta", weight: 3 },
    { subject: "Spring Framework", relevance: "Alta", weight: 3 },
    { subject: "Banco de Dados", relevance: "Alta", weight: 2.5 },
    { subject: "Docker e Kubernetes", relevance: "Alta", weight: 2 },
    { subject: "Língua Portuguesa", relevance: "Média", weight: 1.5 },
  ],
};

const DEFAULT_EDITAL: EditalData = {
  id: "dataprev-2026",
  title: "Dataprev 2026 - Desenvolvedor",
  role: "Desenvolvimento de Software",
  banca: "FGV",
  createdAt: new Date().toISOString(),
  curriculum: DATAPREV_CURRICULUM,
  studyMaterials: DEFAULT_DATAPREV_MATERIALS,
};

// ==================== 2. CÂMARA DOS DEPUTADOS ====================
export const CAMARA_CURRICULUM: SubjectData[] = [
  {
    id: "camara-portugues",
    name: "Língua Portuguesa",
    category: "general",
    color: "#6366f1",
    weight: 1.0,
    topics: [
      { id: "c-port-1", name: "Compreensão e Tipologia Textual", subtopics: [{ id: "c-port-1-1", name: "Argumentação e Coesão" }] },
      { id: "c-port-2", name: "Morfossintaxe e Concordância", subtopics: [{ id: "c-port-2-1", name: "Regência e Crase" }] },
      { id: "c-port-3", name: "Redação Oficial (Manual da Presidência)", subtopics: [{ id: "c-port-3-1", name: "Padrão Ofício e Correio Eletrônico" }] },
    ],
  },
  {
    id: "camara-const-adm",
    name: "Direito Constitucional & Administrativo",
    category: "general",
    color: "#0ea5e9",
    weight: 1.5,
    topics: [
      { id: "c-dir-1", name: "Organização dos Poderes e Poder Legislativo", subtopics: [{ id: "c-dir-1-1", name: "Processo Legislativo Constitucional" }] },
      { id: "c-dir-2", name: "Princípios da Administração Pública & Lei 14.133", subtopics: [{ id: "c-dir-2-1", name: "Contratações de TI" }] },
      { id: "c-dir-3", name: "Lei 8.112/90 e Regime dos Servidores", subtopics: [{ id: "c-dir-3-1", name: "Deveres, Proibições e Responsabilidades" }] },
    ],
  },
  {
    id: "camara-eng-software",
    name: "Engenharia de Software & Metodologias Ágeis",
    category: "specific",
    color: "#10b981",
    weight: 2.5,
    topics: [
      { id: "c-eng-1", name: "Scrum, Kanban e Práticas Ágeis", subtopics: [{ id: "c-eng-1-1", name: "Sprints, Cerimônias e Backlog" }] },
      { id: "c-eng-2", name: "Engenharia de Requisitos & User Stories", subtopics: [{ id: "c-eng-2-1", name: "Critérios de Aceite e INVEST" }] },
      { id: "c-eng-3", name: "Qualidade, Testes (TDD/BDD) & CI/CD", subtopics: [{ id: "c-eng-3-1", name: "Pirâmide de Testes e Cobertura" }] },
    ],
  },
  {
    id: "camara-arquitetura",
    name: "Arquitetura de Software & Microsserviços",
    category: "specific",
    color: "#f59e0b",
    weight: 3.0,
    topics: [
      { id: "c-arq-1", name: "Padrões Arquiteturais (Hexagonal, Clean Arch, DDD)", subtopics: [{ id: "c-arq-1-1", name: "Entidades, Agregados e Value Objects" }] },
      { id: "c-arq-2", name: "Microsserviços, API Gateway & Service Mesh", subtopics: [{ id: "c-arq-2-1", name: "Resiliência com Circuit Breaker" }] },
      { id: "c-arq-3", name: "Comunicação Assíncrona & Mensageria (Kafka/RabbitMQ)", subtopics: [{ id: "c-arq-3-1", name: "Event Sourcing e CQRS" }] },
    ],
  },
  {
    id: "camara-dev-backend",
    name: "Desenvolvimento Backend (Java, Python, APIs REST)",
    category: "specific",
    color: "#8b5cf6",
    weight: 3.0,
    topics: [
      { id: "c-dev-1", name: "Java 17+ e Spring Boot Framework", subtopics: [{ id: "c-dev-1-1", name: "Spring Security e JPA" }] },
      { id: "c-dev-2", name: "Python para Integração e Automação", subtopics: [{ id: "c-dev-2-1", name: "FastAPI e Manipulação de Dados" }] },
      { id: "c-dev-3", name: "APIs RESTful, OpenAPI/Swagger e GraphQL", subtopics: [{ id: "c-dev-3-1", name: "Idempotência, HATEOAS e HTTP Status" }] },
    ],
  },
  {
    id: "camara-dados",
    name: "Banco de Dados & Engenharia de Dados",
    category: "specific",
    color: "#ec4899",
    weight: 2.5,
    topics: [
      { id: "c-bd-1", name: "PostgreSQL, Modelagem Relacional & Tuning SQL", subtopics: [{ id: "c-bd-1-1", name: "Planos de Execução (EXPLAIN ANALYZE)" }] },
      { id: "c-bd-2", name: "Bancos NoSQL (Documentos, Chave-Valor, Grafos)", subtopics: [{ id: "c-bd-2-1", name: "MongoDB e Redis" }] },
      { id: "c-bd-3", name: "Data Warehouse, Data Lakes & Pipelines ETL", subtopics: [{ id: "c-bd-3-1", name: "Modelagem Dimensional Star Schema" }] },
    ],
  },
  {
    id: "camara-seguranca",
    name: "Segurança da Informação, Criptografia & LGPD",
    category: "specific",
    color: "#ef4444",
    weight: 2.0,
    topics: [
      { id: "c-seg-1", name: "OWASP Top 10 e Segurança em Aplicações Web", subtopics: [{ id: "c-seg-1-1", name: "Injeção SQL, XSS, CSRF e Broken Auth" }] },
      { id: "c-seg-2", name: "Autenticação e Autorização (OAuth 2.0, OIDC, JWT)", subtopics: [{ id: "c-seg-2-1", name: "Tokens de Acesso e Refresh" }] },
      { id: "c-seg-3", name: "Lei Geral de Proteção de Dados (LGPD) e Anonimização", subtopics: [{ id: "c-seg-3-1", name: "Bases Legais e Direitos do Titular" }] },
    ],
  },
  {
    id: "camara-governanca",
    name: "Governança de TI (ITIL v4, COBIT 2019)",
    category: "specific",
    color: "#14b8a6",
    weight: 1.5,
    topics: [
      { id: "c-gov-1", name: "ITIL v4: Sistema de Valor de Serviço (SVS) e Práticas", subtopics: [{ id: "c-gov-1-1", name: "Gestão de Incidentes, Mudanças e Problemas" }] },
      { id: "c-gov-2", name: "COBIT 2019: Governança vs Gerenciamento de TI", subtopics: [{ id: "c-gov-2-1", name: "Princípios e Fatores de Design" }] },
    ],
  },
];

export const CAMARA_MATERIALS: StudyMaterialBundle = {
  overview: "O concurso da Câmara dos Deputados para Analista Legislativo - Informática Legislativa é um dos mais disputados e bem remunerados do país. A banca examinadora (FGV/Cebraspe) cobra rigor técnico absoluto em Arquitetura de Software, Engenharia de Dados, Microsserviços e Segurança (OAuth2/OWASP), além de Governança de TI e Processo Legislativo.",
  studyPlan: {
    weekGoal: "Dominar Arquitetura Limpa, Microsserviços, SQL avançado e Legislação da Câmara",
    dailySchedule: [
      { day: "Segunda-feira", subjects: ["Arquitetura de Software", "Língua Portuguesa"], focus: "Clean Architecture, DDD e Interpretação FGV", estimatedMinutes: 120 },
      { day: "Terça-feira", subjects: ["Desenvolvimento Backend", "Banco de Dados"], focus: "Spring Boot, REST APIs e Tuning PostgreSQL", estimatedMinutes: 120 },
      { day: "Quarta-feira", subjects: ["Engenharia de Software", "Direito Constitucional"], focus: "Scrum, TDD e Poder Legislativo na CF/88", estimatedMinutes: 90 },
      { day: "Quinta-feira", subjects: ["Segurança da Informação", "LGPD"], focus: "OWASP Top 10, OAuth2 e Princípios LGPD", estimatedMinutes: 120 },
      { day: "Sexta-feira", subjects: ["Governança de TI", "DevOps"], focus: "ITIL v4 SVS, COBIT e Containers Docker", estimatedMinutes: 90 },
      { day: "Sábado", subjects: ["Simulado Analista Câmara"], focus: "Simulado completo de conhecimentos específicos com gabarito", estimatedMinutes: 180 },
      { day: "Domingo", subjects: ["Revisão Espaçada & Flashcards"], focus: "Fixação de termos técnicos e repouso", estimatedMinutes: 45 },
    ],
  },
  summaries: [
    {
      id: "sum-camara-arq",
      subjectName: "Arquitetura de Software",
      title: "Apostila: Clean Architecture, DDD e Microsserviços na Câmara",
      keyPoints: [
        "A Regra da Dependência estabelece que o código-fonte só pode apontar para dentro (em direção às regras de negócio de mais alto nível).",
        "No DDD, Entidades possuem identidade única e ciclo de vida; Value Objects são definidos puramente por seus atributos (imutáveis).",
        "O padrão Saga orquestra transações distribuídas em microsserviços via compensação (Coreografia ou Orquestração).",
      ],
      theorySummary: "Na Clean Architecture de Robert C. Martin, os Círculos Concêntricos separam: 1. Enterprise Business Rules (Entities), 2. Application Business Rules (Use Cases), 3. Interface Adapters (Controllers, Gateways, Presenters), 4. Frameworks & Drivers (Web, DB, Devices). O núcleo nunca conhece banco de dados ou frameworks externos!",
      examTips: "Atenção em provas da FGV para a Câmara: O padrão CQRS (Command Query Responsibility Segregation) separa os modelos de leitura (Query) e escrita (Command), permitindo otimizar cada um de forma independente.",
    },
    {
      id: "sum-camara-sec",
      subjectName: "Segurança da Informação",
      title: "Apostila: OAuth 2.0, JWT & OWASP Top 10",
      keyPoints: [
        "OAuth 2.0 é um framework de AUTORIZAÇÃO; OpenID Connect (OIDC) adiciona AUTENTICAÇÃO sobre o OAuth 2.0.",
        "JWT (JSON Web Token) possui três partes separadas por pontos: Header, Payload e Signature.",
        "O fluxo Authorization Code Grant com PKCE é o padrão mais seguro recomendado para SPAs e Apps móveis.",
      ],
      theorySummary: "JWT não é criptografado por padrão, é apenas codificado em Base64Url e assinado digitalmente! Qualquer um pode ler o Payload, portanto NUNCA coloque senhas ou dados confidenciais nele. A assinatura com chave secreta ou chave pública/privada (RS256) garante a integridade.",
      examTips: "Pegadinha comum: No OWASP Top 10, 'Broken Access Control' (Controle de Acesso Quebrado) passou a ser a vulnerabilidade número 1 em aplicações modernas.",
    },
    {
      id: "sum-camara-gov",
      subjectName: "Governança de TI",
      title: "Apostila: COBIT 2019 vs ITIL v4",
      keyPoints: [
        "COBIT foca em GOVERNANÇA (avaliar, direcionar e monitorar - EDM) e GERENCIAMENTO (PBDM).",
        "ITIL v4 foca em SERVIÇO e no Sistema de Valor de Serviço (SVS) com as 4 dimensões do gerenciamento.",
        "Governança garante que as necessidades das partes interessadas sejam avaliadas e direcionadas por objetivos corporativos.",
      ],
      theorySummary: "O COBIT 2019 divide os 40 objetivos de governança e gerenciamento em 5 domínios: 1 de Governança (EDM - Evaluate, Direct, Monitor) e 4 de Gerenciamento (APO, BAI, DSS, MEA).",
      examTips: "Questão clássica de concurso legislativo: 'Governança é de responsabilidade da alta administração (Board/Conselho); Gerenciamento é responsabilidade da diretoria executiva sob liderança do CEO/CIO.'",
    },
  ],
  flashcards: [
    {
      id: "fc-cam-1",
      subjectName: "Arquitetura de Software",
      front: "No Domain-Driven Design (DDD), qual a principal diferença conceitual entre uma Entidade e um Value Object?",
      back: "Uma Entidade possui uma identidade única e contínua ao longo do tempo (ex: Usuário com ID), enquanto um Value Object é definido unicamente pelo valor de seus atributos e é imutável (ex: Endereço, Dinheiro).",
      difficulty: "médio",
    },
    {
      id: "fc-cam-2",
      subjectName: "Segurança",
      front: "Qual a diferença entre Autenticação e Autorização em sistemas web?",
      back: "Autenticação verifica QUEM você é (identidade, ex: login e senha). Autorização verifica O QUE você tem permissão para fazer ou acessar (privilégios e papéis).",
      difficulty: "fácil",
    },
    {
      id: "fc-cam-3",
      subjectName: "Engenharia de Software",
      front: "O que diz o princípio 'Open/Closed' (Aberto/Fechado) do SOLID?",
      back: "Entidades de software (classes, módulos, funções) devem estar abertas para extensão, mas fechadas para modificação.",
      difficulty: "médio",
    },
    {
      id: "fc-cam-4",
      subjectName: "Governança",
      front: "Quais são as 4 dimensões do gerenciamento de serviço segundo o ITIL v4?",
      back: "1. Organizações e Pessoas; 2. Informação e Tecnologia; 3. Parceiros e Fornecedores; 4. Fluxos de Valor e Processos.",
      difficulty: "difícil",
    },
  ],
  keyTopicsPriority: [
    { subject: "Arquitetura de Software & Microsserviços", relevance: "Alta", weight: 3 },
    { subject: "Desenvolvimento Backend", relevance: "Alta", weight: 3 },
    { subject: "Banco de Dados & SQL", relevance: "Alta", weight: 2.5 },
    { subject: "Segurança da Informação", relevance: "Alta", weight: 2.5 },
    { subject: "Governança de TI", relevance: "Média", weight: 2 },
  ],
};

const DEFAULT_CAMARA_EDITAL: EditalData = {
  id: "camara-dos-deputados",
  title: "Câmara dos Deputados - Analista Legislativo (TI)",
  role: "Informática Legislativa / Desenvolvedor",
  banca: "FGV",
  overview: "Concurso de excelência da Câmara dos Deputados (banca FGV). Foco total em Engenharia de Software, Arquitetura de Sistemas, Banco de Dados, Segurança e Governança de TI.",
  createdAt: new Date().toISOString(),
  curriculum: CAMARA_CURRICULUM,
  studyMaterials: CAMARA_MATERIALS,
};

interface CurriculumState {
  editais: EditalData[];
  activeEditalId: string;
  isSyncing: boolean;

  fetchEditais: () => Promise<void>;
  addEdital: (edital: Omit<EditalData, "id" | "createdAt">) => Promise<void>;
  updateEdital: (id: string, data: Partial<Omit<EditalData, "id" | "createdAt">>) => Promise<void>;
  removeEdital: (id: string) => Promise<void>;
  setActiveEdital: (id: string) => void;
  setEditalStudyMaterials: (id: string, materials: StudyMaterialBundle) => void;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      // Both Dataprev and Câmara are ready out-of-the-box
      editais: [DEFAULT_EDITAL, DEFAULT_CAMARA_EDITAL],
      activeEditalId: "dataprev-2026",
      isSyncing: false,

      fetchEditais: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/editais");
          if (res.ok) {
            const data = await res.json();
            if (data.editais && data.editais.length > 0) {
              set((state) => {
                // Merge DB editais with existing editais without losing local ones or defaults
                const existingMap = new Map(state.editais.map((e) => [e.id, e]));
                data.editais.forEach((dbEd: EditalData) => {
                  const curr = existingMap.get(dbEd.id);
                  existingMap.set(dbEd.id, {
                    ...dbEd,
                    banca: dbEd.banca || curr?.banca || "FGV",
                    studyMaterials: dbEd.studyMaterials || curr?.studyMaterials,
                  });
                });
                const merged = Array.from(existingMap.values());
                return {
                  editais: merged,
                  activeEditalId: state.activeEditalId || merged[0]?.id || "dataprev-2026",
                };
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch editais:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      addEdital: async (editalData) => {
        try {
          const res = await fetch("/api/editais", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editalData),
          });
          if (res.ok) {
            const data = await res.json();
            const newEdital: EditalData = {
              ...data.edital,
              banca: editalData.banca || data.edital?.banca || "FGV",
              studyMaterials: editalData.studyMaterials,
            };
            set((state) => ({
              editais: [newEdital, ...state.editais.filter((e) => e.id !== newEdital.id)],
              activeEditalId: newEdital.id,
            }));
          } else {
            // Local fallback
            const localId = `edital-${Date.now()}`;
            const localEdital: EditalData = {
              id: localId,
              title: editalData.title,
              role: editalData.role,
              banca: editalData.banca || "FGV",
              overview: editalData.overview,
              createdAt: new Date().toISOString(),
              curriculum: editalData.curriculum,
              studyMaterials: editalData.studyMaterials,
            };
            set((state) => ({
              editais: [localEdital, ...state.editais],
              activeEditalId: localId,
            }));
          }
        } catch (error) {
          console.error("Failed to add edital:", error);
          const localId = `edital-${Date.now()}`;
          const localEdital: EditalData = {
            id: localId,
            title: editalData.title,
            role: editalData.role,
            banca: editalData.banca || "FGV",
            overview: editalData.overview,
            createdAt: new Date().toISOString(),
            curriculum: editalData.curriculum,
            studyMaterials: editalData.studyMaterials,
          };
          set((state) => ({
            editais: [localEdital, ...state.editais],
            activeEditalId: localId,
          }));
        }
      },

      updateEdital: async (id, data) => {
        try {
          await fetch(`/api/editais/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch {}
        set((state) => ({
          editais: state.editais.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));
      },

      setEditalStudyMaterials: (id, materials) => {
        set((state) => ({
          editais: state.editais.map((e) =>
            e.id === id ? { ...e, studyMaterials: materials } : e
          ),
        }));
      },

      removeEdital: async (id) => {
        if (id === "dataprev-2026") return;
        try {
          await fetch(`/api/editais/${id}`, { method: "DELETE" });
        } catch {}
        set((state) => ({
          editais: state.editais.filter((e) => e.id !== id),
          activeEditalId:
            state.activeEditalId === id
              ? state.editais.find((e) => e.id !== id)?.id || "dataprev-2026"
              : state.activeEditalId,
        }));
      },

      setActiveEdital: (id) => set({ activeEditalId: id }),
    }),
    {
      name: "trampo-hub-curriculum",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useActiveCurriculum = (): SubjectData[] => {
  const { editais, activeEditalId } = useCurriculumStore();
  const active = editais.find((e) => e.id === activeEditalId);
  return active?.curriculum || DATAPREV_CURRICULUM;
};

export const useActiveEdital = (): EditalData => {
  const { editais, activeEditalId } = useCurriculumStore();
  const active = editais.find((e) => e.id === activeEditalId);
  return active || DEFAULT_EDITAL;
};

export const useActiveEditalBanca = (): string => {
  const { editais, activeEditalId } = useCurriculumStore();
  const active = editais.find((e) => e.id === activeEditalId);
  return active?.banca || "FGV";
};

export const useActiveEditalTitle = () => {
  const activeId = useCurriculumStore((s) => s.activeEditalId);
  return useCurriculumStore((s) => s.editais.find((e) => e.id === activeId)?.title || "Edital Desconhecido");
};

export const useActiveEditalOverview = () => {
  const activeId = useCurriculumStore((s) => s.activeEditalId);
  return useCurriculumStore((s) => s.editais.find((e) => e.id === activeId)?.overview || "");
};

export const useActiveEditalMaterials = (): StudyMaterialBundle | undefined => {
  const activeId = useCurriculumStore((s) => s.activeEditalId);
  const active = useCurriculumStore((s) => s.editais.find((e) => e.id === activeId));
  return active?.studyMaterials || (activeId === "camara-dos-deputados" ? CAMARA_MATERIALS : DEFAULT_DATAPREV_MATERIALS);
};
