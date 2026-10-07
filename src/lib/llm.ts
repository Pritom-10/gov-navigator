import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";


const makeConfig = (system: string) => ({
  systemInstruction: system,
  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
});

export async function explain(prompt: string, system: string): Promise<string> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: makeConfig(system),
  });
  return res.text ?? "";
}


export async function* explainStream(prompt: string, system: string) {
  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: prompt,
    config: makeConfig(system),
  });

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}