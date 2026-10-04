import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small", // 1536 dimension, schema-র vector(1536) এর সাথে মেলে
    input: text,
  });
  return res.data[0].embedding;
}