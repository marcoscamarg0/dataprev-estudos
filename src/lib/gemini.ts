/**
 * Helper utility for Google Gemini AI Integration
 * Models are discovered dynamically via ListModels API
 */

// ✅ Confirmed working models (tested 05/10/2026)
export const FALLBACK_GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
];

// Runtime cache so we only call ListModels once per process lifecycle
let _cachedModels: string[] | null = null;

export function getGeminiApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  return key?.trim() || "";
}

/**
 * Fetches and caches the list of models available for the current API key
 * that support generateContent. Falls back to FALLBACK_GEMINI_MODELS on error.
 */
export async function getAvailableModels(): Promise<string[]> {
  if (_cachedModels !== null) return _cachedModels;

  const apiKey = getGeminiApiKey();
  if (!apiKey) return FALLBACK_GEMINI_MODELS;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url, { headers: { "x-goog-api-key": apiKey } });
    if (!res.ok) {
      console.warn(`⚠️ [Gemini] Não foi possível listar modelos (${res.status}), usando fallback.`);
      return FALLBACK_GEMINI_MODELS;
    }
    const data = await res.json();
    const models: string[] = (data.models || [])
      .filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        // Exclude TTS, image-only, robotics, deep-research, audio-only models for text chat
        !m.name?.includes("-tts") &&
        !m.name?.includes("transcribe") &&
        !m.name?.includes("-image") &&
        !m.name?.includes("robotics") &&
        !m.name?.includes("deep-research") &&
        !m.name?.includes("lyria") &&
        !m.name?.includes("computer-use") &&
        !m.name?.includes("preview-tts")
      )
      .map((m: any) => (m.name || "").replace("models/", ""))
      .filter(Boolean);

    console.log(`📋 [Gemini] ${models.length} modelos disponíveis para geração de texto:`, models);
    _cachedModels = models.length > 0 ? models : FALLBACK_GEMINI_MODELS;
    return _cachedModels;
  } catch (e: any) {
    console.warn("⚠️ [Gemini] Erro ao listar modelos, usando fallback:", e.message);
    return FALLBACK_GEMINI_MODELS;
  }
}

export interface GeminiMessage {
  role: "user" | "model" | "assistant" | "system";
  content: string;
}

export interface CallGeminiOptions {
  systemInstruction?: string;
  messages?: GeminiMessage[];
  prompt?: string;
  responseJson?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  models?: string[];
}

/**
 * Calls Google Gemini REST API with automatic model fallback
 */
export async function callGemini(options: CallGeminiOptions): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error("❌ [Gemini] GEMINI_API_KEY não configurada.");
    throw new Error("GEMINI_API_KEY não configurada no servidor (.env).");
  }

  const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  console.log(`\n==================================================`);
  console.log(`🚀 [Gemini] Iniciando chamada | Chave: ${maskedKey}`);

  // Use provided models, or discover dynamically
  const modelsToTry = options.models ?? await getAvailableModels();
  const customModel = process.env.GEMINI_MODEL;
  const finalModels = customModel
    ? [customModel, ...modelsToTry.filter((m) => m !== customModel)]
    : modelsToTry;

  // Build contents array
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  if (options.messages && options.messages.length > 0) {
    for (const msg of options.messages) {
      if (msg.role === "system") continue;
      const role = msg.role === "assistant" ? "model" : "user";
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  } else if (options.prompt) {
    contents.push({ role: "user", parts: [{ text: options.prompt }] });
  }

  if (contents.length === 0) {
    throw new Error("Nenhum conteúdo ou prompt fornecido para o Gemini.");
  }

  const bodyPayload: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topP: 0.95,
      ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
      ...(options.responseJson ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (options.systemInstruction) {
    bodyPayload.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  let lastError: any = null;

  for (const model of finalModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`⏳ [Gemini] Testando modelo: ${model}...`);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        const shortErr = (() => {
          try { return JSON.parse(errText).error?.message || errText; } catch { return errText; }
        })();
        console.warn(`⚠️ [Gemini] ${model} falhou (${res.status}): ${shortErr.slice(0, 120)}`);
        lastError = new Error(`Gemini API error (${model}): ${errText}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText !== undefined && rawText !== null) {
        console.log(`🎉 [Gemini] SUCESSO com modelo: ${model}`);
        console.log(`==================================================\n`);
        return rawText;
      }

      console.warn(`⚠️ [Gemini] ${model} retornou resposta vazia.`);
      lastError = new Error(`Gemini retornou resposta vazia com ${model}`);
    } catch (err: any) {
      console.error(`⚠️ [Gemini] Erro de rede com ${model}:`, err?.message);
      lastError = err;
    }
  }

  console.error(`\n❌ [Gemini] TODAS AS TENTATIVAS FALHARAM.`);
  console.error(`==================================================\n`);
  throw lastError || new Error("Falha ao comunicar com os modelos Gemini.");
}

/**
 * Helper to call Gemini and parse JSON response reliably
 */
export async function callGeminiJson<T = any>(options: CallGeminiOptions): Promise<T> {
  const rawContent = await callGemini({ ...options, responseJson: true });

  let jsonStr = rawContent.trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const match = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (match) jsonStr = match[0];

  try {
    const parsed = JSON.parse(jsonStr) as T;
    console.log(`✅ [Gemini] JSON parseado com sucesso.`);
    return parsed;
  } catch {
    console.error("❌ [Gemini] Falha ao fazer parse do JSON. Conteúdo bruto:", rawContent);
    throw new Error("A IA retornou um formato JSON inválido.");
  }
}
