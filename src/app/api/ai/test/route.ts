import { NextResponse } from "next/server";
import { getGeminiApiKey } from "@/lib/gemini";

const TEST_PROMPT = "Responda apenas com: ok";

export async function GET() {
  const key = getGeminiApiKey();
  if (!key) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  const maskedKey = `${key.slice(0, 6)}...${key.slice(-4)}`;
  console.log(`\n🔑 [GeminiTest] Chave: ${maskedKey}`);

  // Step 1: List all models available for this key
  console.log("📋 [GeminiTest] Buscando modelos disponíveis...");
  let allModels: string[] = [];
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const listRes = await fetch(listUrl, { headers: { "x-goog-api-key": key } });
    if (!listRes.ok) {
      const errText = await listRes.text();
      console.error("❌ Falha ao listar modelos:", errText);
      return NextResponse.json({ success: false, error: `Falha ao listar modelos: ${errText}` }, { status: 500 });
    }
    const listData = await listRes.json();
    allModels = (listData.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => (m.name || "").replace("models/", ""))
      .filter(Boolean);

    console.log(`✅ ${allModels.length} modelos suportam generateContent:`);
    allModels.forEach((m) => console.log(`   - ${m}`));
  } catch (e: any) {
    console.error("❌ Erro ao listar modelos:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }

  // Step 2: Test each model with a real generateContent call
  console.log("\n🧪 [GeminiTest] Testando cada modelo com uma geração real...\n");

  const working: string[] = [];
  const failed: { model: string; reason: string }[] = [];

  const bodyPayload = {
    contents: [{ role: "user", parts: [{ text: TEST_PROMPT }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 20 },
  };

  for (const model of allModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        const errParsed = JSON.parse(errText).error?.message || errText;
        console.log(`   ❌ ${model}: ${errParsed}`);
        failed.push({ model, reason: errParsed });
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`   ✅ ${model}: "${text.trim()}"`);
        working.push(model);
      } else {
        console.log(`   ⚠️ ${model}: resposta vazia`);
        failed.push({ model, reason: "resposta vazia" });
      }
    } catch (err: any) {
      console.log(`   ❌ ${model}: ${err.message}`);
      failed.push({ model, reason: err.message });
    }
  }

  console.log(`\n📊 [GeminiTest] Resultado: ${working.length} funcionando, ${failed.length} com falha`);
  console.log("✅ Modelos funcionando:", working);

  return NextResponse.json({
    success: working.length > 0,
    keyPreview: maskedKey,
    working,
    failed,
    summary: `${working.length} de ${allModels.length} modelos funcionando`,
  });
}
