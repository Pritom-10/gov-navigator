import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function embed(text: string): Promise<number[]> {
  const res = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 1536 },
  });

  const values = res.embeddings?.[0]?.values;
  if (!values) throw new Error("Embedding পাওয়া যায়নি");
  return values;
}