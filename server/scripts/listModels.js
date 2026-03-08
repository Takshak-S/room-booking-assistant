import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const result = await ai.models.list();
    const models = result.models || result.pageInternal || [];
    console.log("Found Models:");
    models.forEach((m) => console.log(`- ${m.name}`));
  } catch (err) {
    console.error("Error Listing Models:", err);
  }
}

main();
