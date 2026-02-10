import { GoogleGenAI } from "@google/genai";
import { SummaryResult, NavStep } from "../types";

// AI Controller: Core brain of the extension
const API_KEY = process.env.API_KEY || "";
if (!API_KEY) console.warn("API_KEY is missing in your environment!");

const ai = new GoogleGenAI({ apiKey: API_KEY });
// Note: Stable v1 is used by default in latest SDK, explicitly setting model configs to ensure alignment.

/**
 * Robust JSON extraction helper
 * Handles cases where the AI might include markdown backticks despite the MIME type setting.
 */
const extractAndParseJson = (text: string) => {
  try {
    // Attempt direct parse
    return JSON.parse(text);
  } catch (e) {
    // Attempt to extract from markdown blocks
    const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e2) {
        throw new Error("AI returned invalid JSON structure even after extraction.");
      }
    }
    throw new Error(`AI returned malformed response: ${text.slice(0, 100)}...`);
  }
};

/**
 * Summarization Engine
 * Uses Gemini 1.5 Flash for speed and cost-efficiency.
 */
export const summarizePage = async (pageContent: string, mode: 'full' | 'short' | 'eli5'): Promise<SummaryResult> => {
  try {
    const prompt = `
      Summarize the following web content.
      Mode: ${mode === 'full' ? 'Comprehensive summary' : mode === 'short' ? 'Concise' : 'ELI5'}.
      
      CONTENT:
      ${pageContent}

      RETURN ONLY A PLAIN JSON OBJECT. NO MARKDOWN. NO BACKTICKS.
      Structure: { "title": string, "content": string, "keyTakeaways": string[] }
    `;

    // Explicit versioning and config for improved 404/400 resilience
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    return extractAndParseJson(result.text);
  } catch (err: any) {
    throw new Error(`Summarization Failed: ${err.message}`);
  }
};

/**
 * Navigation Engine (High Precision)
 * Uses Gemini 1.5 Flash for Hero Navigation.
 */
export const generateNavGuide = async (goal: string, currentUrl: string, pageSchema: string): Promise<NavStep[]> => {
  try {
    const prompt = `
      You are an expert AI Navigation Assistant.
      USER GOAL: "${goal}"
      CURRENT LOCATION: ${currentUrl}
      SCHEMA: ${pageSchema}
      
      Generate a precise, step-by-step navigation path as a JSON array.
      
      CRITICAL INSTRUCTIONS:
      1. If the current page is a landing or search page, identify the link/button that leads to the specific goal.
      2. If the current page is a form (like login, signup, or checkout), identify ALL necessary fields (inputs, buttons).
      3. The instruction should be contextual. If the goal is login and we are on the login page, the first step should be entering the username.
      4. If a step leads to a new page, set 'targetPage' to the expected URL or 'NEXT_PAGE'.

      EACH STEP MUST HAVE: 
      - selector: string (e.g., "#login-btn")
      - instruction: string (e.g., "Enter your email in the username field")
      - action: "click" | "type" | "hover"
      - targetPage: string (current URL, 'NEXT_PAGE', or expected URL)
      - confidenceScore: number (0-1)
      - contextHint?: string (Helpful tip like "Found in the top-right header")

      RETURN ONLY A PLAIN JSON ARRAY. NO MARKDOWN. NO BACKTICKS.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    return extractAndParseJson(result.text);
  } catch (err: any) {
    throw new Error(`Navigation Failure: ${err.message}`);
  }
};

/**
 * Context-Aware Chat
 */
export const chatWithContext = async (query: string, context: string) => {
  const systemInstruction = `You are ShadowLight, a helpful web accessibility assistant. 
  You have the current page content as context. Respond clearly and concisely.
  
  PAGE CONTENT:
  ${context}`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `User Question: ${query}` }] }],
    config: {
      systemInstruction,
      maxOutputTokens: 1000,
    },
  });

  return result.text;
};

export const repurposeContent = async (pageContent: string, format: 'tweet' | 'blog' | 'article'): Promise<string> => {
  const prompt = `Repurpose the following content into a ${format} format. 
  
  CONTENT:
  ${pageContent}`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  return result.text || "";
};


