/**
 * Helper utility for Google Gemini AI Integration
 */

export const DEFAULT_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
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
}

/**
 * Calls Google Gemini REST API with automatic model fallback
 */
export async function callGemini(options: CallGeminiOptions): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no servidor (.env).");
  }

  const customModel = process.env.GEMINI_MODEL;
  const modelsToTry = options.models || (customModel ? [customModel, ...DEFAULT_GEMINI_MODELS] : DEFAULT_GEMINI_MODELS);

  // Build contents array
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  if (options.messages && options.messages.length > 0) {
    for (const msg of options.messages) {
      if (msg.role === "system") continue; // system prompt handled in systemInstruction
      const role = msg.role === "assistant" ? "model" : "user";
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  } else if (options.prompt) {
    contents.push({
      role: "user",
      parts: [{ text: options.prompt }],
    });
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
    bodyPayload.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`🤖 [Gemini] Chamando modelo: ${model}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini Error com ${model} (status ${response.status}):`, errText);
        lastError = new Error(`Gemini API error (${model}): ${errText}`);
        continue; // Try fallback model
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText !== undefined && rawText !== null) {
        console.log(`✅ [Gemini] Resposta obtida com sucesso usando o modelo: ${model}`);
        return rawText;
      }

      lastError = new Error(`Gemini retornou resposta vazia com ${model}`);
    } catch (err: any) {
      console.error(`Gemini fetch error com ${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Falha ao comunicar com os modelos Gemini.");
}

/**
 * Helper to call Gemini and parse JSON response reliably
 */
export async function callGeminiJson<T = any>(options: CallGeminiOptions): Promise<T> {
  const rawContent = await callGemini({
    ...options,
    responseJson: true,
  });

  let jsonStr = rawContent.trim();
  
  // Clean markdown blocks if present
  jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

  // If not pure json, try regex matching
  const match = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (match) {
    jsonStr = match[0];
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (parseError) {
    console.error("Falha ao fazer parse do JSON do Gemini. Conteúdo:", rawContent);
    throw new Error("A IA retornou um formato JSON inválido.");
  }
}
