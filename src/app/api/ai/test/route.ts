import { NextResponse } from "next/server";
import { getGeminiApiKey } from "@/lib/gemini";

const TEST_PROMPT = "Responda apenas com: ok";

export async function GET() {
  const key = getGeminiApiKey();
  if (!key) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  const maskedKey = `${key.slice(0, 6)}...${key.slice(-4)}`;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔑 [GeminiTest] Chave: ${maskedKey}`);

  // Step 1: List ALL models
  console.log("📋 [GeminiTest] Buscando todos os modelos disponíveis...");
  let allModels: string[] = [];
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const listRes = await fetch(listUrl, { headers: { "x-goog-api-key": key } });
    if (!listRes.ok) {
      const errText = await listRes.text();
      return NextResponse.json({ success: false, error: `Falha ao listar modelos: ${errText}` }, { status: 500 });
    }
    const listData = await listRes.json();
    // Filter ONLY text generateContent — skip TTS, audio, image-only, robotics
    allModels = (listData.models || [])
      .filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        !m.name?.includes("-tts") &&
        !m.name?.includes("transcribe") &&
        !m.name?.includes("robotics") &&
        !m.name?.includes("deep-research") &&
        !m.name?.includes("lyria") &&
        !m.name?.includes("computer-use") &&
        !m.name?.includes("preview-tts") &&
        !m.name?.includes("-image") &&
        !m.name?.includes("image-preview")
      )
      .map((m: any) => (m.name || "").replace("models/", ""))
      .filter(Boolean);

    console.log(`\n✅ ${allModels.length} modelos para testar:`);
    allModels.forEach((m, i) => console.log(`   ${i + 1}. ${m}`));
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }

  // Step 2: Test EVERY model
  console.log(`\n${"=".repeat(60)}`);
  console.log("🧪 Testando cada modelo com uma geração real...\n");

  const working: string[] = [];
  const failed: { model: string; status: number; reason: string }[] = [];

  const bodyPayload = {
    contents: [{ role: "user", parts: [{ text: TEST_PROMPT }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
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
        let reason = errText;
        try { reason = JSON.parse(errText).error?.message || errText; } catch {}
        // Truncate long messages
        const shortReason = reason.length > 100 ? reason.slice(0, 100) + "..." : reason;
        console.log(`   ❌ [${res.status}] ${model}: ${shortReason}`);
        failed.push({ model, status: res.status, reason });
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`   ✅ ${model}: "${text.trim()}"`);
        working.push(model);
      } else {
        console.log(`   ⚠️ ${model}: resposta vazia`);
        failed.push({ model, status: 200, reason: "resposta vazia" });
      }
    } catch (err: any) {
      console.log(`   ❌ ${model}: ${err.message}`);
      failed.push({ model, status: 0, reason: err.message });
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 RESULTADO FINAL:`);
  console.log(`   ✅ Funcionando (${working.length}): ${working.join(", ")}`);
  console.log(`   ❌ Com falha   (${failed.length}): ${failed.map((f) => f.model).join(", ")}`);
  console.log(`${"=".repeat(60)}\n`);

  return NextResponse.json({
    success: working.length > 0,
    keyPreview: maskedKey,
    summary: `${working.length} de ${allModels.length} modelos funcionando`,
    working,
    failed: failed.map((f) => ({ model: f.model, status: f.status, reason: f.reason.slice(0, 200) })),
  });
}
