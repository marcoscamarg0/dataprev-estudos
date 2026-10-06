/**
 * Helper utility for Google Gemini AI Integration
 * Models confirmed working on 05/10/2026:
 * - gemini-flash-lite-latest
 * - gemini-3.1-flash-lite-preview
 * - gemini-3.1-flash-lite
 * - gemini-3.5-flash-lite
 */

// ✅ Confirmed working models in priority order
export const WORKING_GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.5-flash-lite",
];

export function getGeminiApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  return key?.trim() || "";
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
  enableSearch?: boolean;
}

/**
 * Robust JSON parser and repair engine:
 * - Strips markdown code blocks (```json ... ``` or ``` ... ```)
 * - Removes single-line and multi-line comments
 * - Cleans trailing commas in objects and arrays
 * - Normalizes unescaped newlines/tabs inside string literals
 * - Extracts outermost JSON boundary ({...} or [...])
 * - Automatically repairs truncated JSON if output token limit was reached
 */
export function safeParseJson<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    throw new Error("Resposta da IA está vazia.");
  }

  let text = rawText.trim();

  // 1. Remove markdown code block fences if present
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const matchFence = text.match(codeBlockRegex);
  if (matchFence && matchFence[1]?.trim()) {
    text = matchFence[1].trim();
  } else {
    // If opening fence exists without closing fence (truncated output)
    const openFence = text.match(/^```(?:json)?\s*([\s\S]*)$/i);
    if (openFence && openFence[1]) {
      text = openFence[1].trim();
    }
  }

  // 2. Direct JSON.parse attempt
  try {
    return JSON.parse(text) as T;
  } catch {}

  // 3. Find JSON boundaries: first '{' or '[' to last '}' or ']'
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let startIdx = -1;
  let isObject = true;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    isObject = false;
  }

  if (startIdx !== -1) {
    const endChar = isObject ? "}" : "]";
    const lastIdx = text.lastIndexOf(endChar);
    if (lastIdx > startIdx) {
      text = text.substring(startIdx, lastIdx + 1);
    } else {
      text = text.substring(startIdx);
    }
  }

  // Try direct parse after boundary extraction
  try {
    return JSON.parse(text) as T;
  } catch {}

  // 4. Remove comments
  let cleaned = text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^\\:])\/\/.*$/gm, "$1");

  // 5. Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(cleaned) as T;
  } catch {}

  // 6. Handle unescaped raw newlines or control characters inside string literals
  let inString = false;
  let isEscaped = false;
  const fixedChars: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '"' && !isEscaped) {
      inString = !inString;
      fixedChars.push(char);
    } else if (inString && char === "\n") {
      fixedChars.push("\\n");
    } else if (inString && char === "\r") {
      fixedChars.push("\\r");
    } else if (inString && char === "\t") {
      fixedChars.push("\\t");
    } else {
      fixedChars.push(char);
    }
    isEscaped = inString && char === "\\" && !isEscaped;
  }

  const fixedString = fixedChars.join("");
  try {
    return JSON.parse(fixedString) as T;
  } catch {}

  // 7. Auto-repair truncated JSON (e.g. hit maxOutputTokens limit)
  let autoRepaired = fixedString.trim();

  // If ending with unclosed string quote
  const unescapedQuotes = (autoRepaired.match(/(?<!\\)"/g) || []).length;
  if (unescapedQuotes % 2 !== 0) {
    autoRepaired += '"';
  }

  // Remove trailing comma
  autoRepaired = autoRepaired.replace(/,\s*$/, "");

  // Balance brackets & braces
  let openBraces = 0;
  let openBrackets = 0;
  let strState = false;
  let escState = false;

  for (let i = 0; i < autoRepaired.length; i++) {
    const c = autoRepaired[i];
    if (c === '"' && !escState) {
      strState = !strState;
    } else if (!strState) {
      if (c === "{") openBraces++;
      else if (c === "}") openBraces = Math.max(0, openBraces - 1);
      else if (c === "[") openBrackets++;
      else if (c === "]") openBrackets = Math.max(0, openBrackets - 1);
    }
    escState = strState && c === "\\" && !escState;
  }

  let suffix = "";
  for (let i = 0; i < openBrackets; i++) suffix += "]";
  for (let i = 0; i < openBraces; i++) suffix += "}";

  if (suffix) {
    try {
      return JSON.parse(autoRepaired + suffix) as T;
    } catch {}
  }

  // 8. If all attempts fail, log preview for debugging
  console.error("❌ [Gemini safeParseJson] Falha ao fazer parse do JSON.");
  console.error("Início do conteúdo bruto:", rawText.slice(0, 300));
  throw new Error("A IA retornou um formato JSON inválido.");
}

/**
 * Builds Gemini contents payload adhering to Gemini API rules:
 * 1. The first message must have role: 'user'
 * 2. Roles must strictly alternate between 'user' and 'model'
 */
function buildGeminiContents(options: CallGeminiOptions): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  if (options.messages && options.messages.length > 0) {
    // Filter out system messages and empty content
    const validMessages = options.messages.filter(
      (m) => m.role !== "system" && m.content && m.content.trim()
    );

    // Skip leading assistant/model messages because Gemini requires the first turn to be 'user'
    let startIndex = 0;
    while (
      startIndex < validMessages.length &&
      (validMessages[startIndex].role === "assistant" || validMessages[startIndex].role === "model")
    ) {
      startIndex++;
    }

    for (let i = startIndex; i < validMessages.length; i++) {
      const msg = validMessages[i];
      const role: "user" | "model" =
        msg.role === "assistant" || msg.role === "model" ? "model" : "user";

      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        // Merge consecutive messages with the same role into parts
        last.parts.push({ text: msg.content });
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }
  } else if (options.prompt) {
    contents.push({ role: "user", parts: [{ text: options.prompt }] });
  }

  if (contents.length === 0) {
    throw new Error("Nenhum conteúdo ou prompt fornecido para o Gemini.");
  }

  return contents;
}

/**
 * Calls a single Gemini model with full error reporting
 */
async function callSingleGeminiModel(
  model: string,
  apiKey: string,
  options: CallGeminiOptions,
  bodyPayload: any
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log(`⏳ [Gemini] Tentando modelo: ${model}...`);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    let shortReason = errText;
    try {
      shortReason = JSON.parse(errText).error?.message || errText;
    } catch {}
    console.warn(`⚠️ [Gemini] ${model} falhou (${res.status}): ${shortReason.slice(0, 120)}`);
    throw new Error(`Gemini API error (${model} [${res.status}]): ${shortReason}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (rawText !== undefined && rawText !== null) {
    console.log(`🎉 [Gemini] SUCESSO com modelo: ${model} (${rawText.length} caracteres recebidos)`);
    return rawText;
  }

  throw new Error(`Gemini retornou resposta vazia com ${model}`);
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

  const customModel = process.env.GEMINI_MODEL;
  const baseModels = options.models ?? WORKING_GEMINI_MODELS;
  const modelsToTry = customModel
    ? [customModel, ...baseModels.filter((m) => m !== customModel)]
    : baseModels;

  console.log(`🤖 [Gemini] Ordem de tentativa: ${modelsToTry.join(" → ")}`);

  const contents = buildGeminiContents(options);

  const bodyPayload: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topP: 0.95,
      // Default to 8192 tokens so long answers/JSON never truncate mid-generation
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      ...(options.responseJson && !options.enableSearch ? { responseMimeType: "application/json" } : {}),
    },
    ...(options.enableSearch ? { tools: [{ googleSearch: {} }] } : {}),
  };

  if (options.systemInstruction) {
    bodyPayload.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const rawText = await callSingleGeminiModel(model, apiKey, options, bodyPayload);
      console.log(`==================================================\n`);
      return rawText;
    } catch (err: any) {
      if (options.enableSearch) {
        // Fallback retry without tools if model does not support Google Search tool
        try {
          console.warn(`⚠️ [Gemini] Tentando modelo ${model} sem ferramenta de busca...`);
          const payloadNoTools = { ...bodyPayload, tools: undefined };
          const fallbackText = await callSingleGeminiModel(model, apiKey, options, payloadNoTools);
          console.log(`==================================================\n`);
          return fallbackText;
        } catch {}
      }
      lastError = err;
    }
  }

  console.error(`\n❌ [Gemini] TODAS AS TENTATIVAS FALHARAM.`);
  console.error(`==================================================\n`);
  throw lastError || new Error("Falha ao comunicar com os modelos Gemini.");
}

/**
 * Helper to call Gemini and parse JSON response reliably:
 * 1. Uses safeParseJson to handle markdown, trailing commas, comments, and truncation
 * 2. If parsing fails, automatically tries the next available model
 */
export async function callGeminiJson<T = any>(options: CallGeminiOptions): Promise<T> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no servidor (.env).");
  }

  const customModel = process.env.GEMINI_MODEL;
  const baseModels = options.models ?? WORKING_GEMINI_MODELS;
  const modelsToTry = customModel
    ? [customModel, ...baseModels.filter((m) => m !== customModel)]
    : baseModels;

  const contents = buildGeminiContents(options);

  const bodyPayload: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      topP: 0.95,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      ...(options.enableSearch ? {} : { responseMimeType: "application/json" }),
    },
    ...(options.enableSearch ? { tools: [{ googleSearch: {} }] } : {}),
  };

  if (options.systemInstruction) {
    bodyPayload.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🤖 [Gemini JSON] Chamando modelo: ${model} (enableSearch: ${!!options.enableSearch})`);
      let rawContent: string;
      try {
        rawContent = await callSingleGeminiModel(model, apiKey, options, bodyPayload);
      } catch (callErr: any) {
        if (options.enableSearch) {
          console.warn(`⚠️ [Gemini JSON] Fallback sem ferramenta de busca no modelo ${model}...`);
          const noSearchPayload = { ...bodyPayload, tools: undefined };
          rawContent = await callSingleGeminiModel(model, apiKey, options, noSearchPayload);
        } else {
          throw callErr;
        }
      }
      
      try {
        const parsed = safeParseJson<T>(rawContent);
        console.log(`✅ [Gemini JSON] JSON válido obtido com sucesso via ${model}`);
        return parsed;
      } catch (parseError) {
        console.warn(`⚠️ [Gemini JSON] Modelo ${model} respondeu mas JSON estava inválido. Tentando fallback sem responseMimeType...`);
        const fallbackPayload = {
          ...bodyPayload,
          tools: undefined,
          generationConfig: {
            ...bodyPayload.generationConfig,
            responseMimeType: undefined,
          },
        };
        try {
          const rawFallback = await callSingleGeminiModel(model, apiKey, options, fallbackPayload);
          const parsedFallback = safeParseJson<T>(rawFallback);
          console.log(`✅ [Gemini JSON] Sucesso com fallback sem responseMimeType no modelo ${model}`);
          return parsedFallback;
        } catch {
          console.warn(`⚠️ [Gemini JSON] Falha definitiva no modelo ${model}. Tentando próximo modelo...`);
          lastError = parseError;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  console.error("❌ [Gemini JSON] Todos os modelos falharam ao gerar JSON válido.");
  throw lastError || new Error("A IA não retornou um formato JSON válido após várias tentativas.");
}

