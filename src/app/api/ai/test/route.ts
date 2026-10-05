import { NextResponse } from "next/server";
import { callGemini, callGeminiJson, getGeminiApiKey, WORKING_GEMINI_MODELS } from "@/lib/gemini";

export async function GET() {
  const key = getGeminiApiKey();
  if (!key) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY não configurada no .env" },
      { status: 500 }
    );
  }

  const maskedKey = `${key.slice(0, 6)}...${key.slice(-4)}`;
  console.log(`\n==================================================`);
  console.log(`🧪 [Gemini Quick Test] Iniciando teste com chave: ${maskedKey}`);

  const results: any = {
    keyPreview: maskedKey,
    activeModels: WORKING_GEMINI_MODELS,
    textTest: null,
    jsonTest: null,
  };

  // 1. Test Text Generation
  try {
    console.log("1️⃣ Testando geração de texto padrão...");
    const textResponse = await callGemini({
      prompt: "Responda apenas com a palavra: FUNCIONANDO",
      temperature: 0.1,
      maxOutputTokens: 20,
    });
    console.log("✅ [Texto OK]:", textResponse.trim());
    results.textTest = { success: true, response: textResponse.trim() };
  } catch (err: any) {
    console.error("❌ [Texto Falhou]:", err.message);
    results.textTest = { success: false, error: err.message };
  }

  // 2. Test JSON Generation (what was previously failing)
  try {
    console.log("2️⃣ Testando geração de JSON com callGeminiJson...");
    const jsonResponse = await callGeminiJson<{ status: string; modelo: string }>({
      prompt: "Retorne um JSON com os campos 'status' (valor 'ok') e 'modelo' (nome de um modelo). Sem markdown.",
      temperature: 0.1,
      maxOutputTokens: 100,
    });
    console.log("✅ [JSON OK]:", jsonResponse);
    results.jsonTest = { success: true, parsed: jsonResponse };
  } catch (err: any) {
    console.error("❌ [JSON Falhou]:", err.message);
    results.jsonTest = { success: false, error: err.message };
  }

  const overallSuccess = results.textTest?.success && results.jsonTest?.success;

  return NextResponse.json({
    success: overallSuccess,
    results,
  });
}
