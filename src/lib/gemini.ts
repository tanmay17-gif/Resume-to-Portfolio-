// Gemini pooled client — round-robin + retry/backoff per api-data-contract.md
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
].filter(Boolean);

let roundRobinIndex = 0;

function getNextKey(): string {
  const key = GEMINI_KEYS[roundRobinIndex % GEMINI_KEYS.length];
  roundRobinIndex = (roundRobinIndex + 1) % GEMINI_KEYS.length;
  return key;
}

export async function geminiGenerate({
  prompt,
  imageBase64,
  model = "gemini-3.6-flash",
  retries = 2,
}: {
  prompt: string;
  imageBase64?: string; // for vision fallback
  model?: string;
  retries?: number;
}) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const key = getNextKey();
    try {
      const parts: Array<Record<string, unknown>> = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: imageBase64,
          },
        });
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || `Gemini error ${res.status}`);
      }
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No text in Gemini response");
      return { text, raw: json, used_model: model, attempt };
    } catch (e) {
      lastError = e;
      // exponential backoff
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}
