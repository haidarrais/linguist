import type { LanguagePackage } from "@/lib/types";
import { isLanguagePackage } from "@/lib/validation";

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["packages"],
  properties: {
    packages: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "language",
          "translation",
          "simplifiedEnglish",
          "keyVocabulary",
          "comprehensionPrompts",
          "sourceNotes",
          "uncertaintyFlags",
        ],
        properties: {
          language: { type: "string" },
          translation: { type: "string" },
          simplifiedEnglish: { type: "string" },
          keyVocabulary: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["term", "definition"],
              properties: { term: { type: "string" }, definition: { type: "string" } },
            },
          },
          comprehensionPrompts: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          sourceNotes: { type: "array", items: { type: "string" } },
          uncertaintyFlags: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

function buildPrompt(sourceText: string, languages: string[], readingLevel: string) {
  return `You are Project Linguist, a careful drafting assistant for K–12 teachers.

Create one learning package for each requested target language. The learner reading level is ${readingLevel}.

Hard requirements:
- Use only information in the source lesson. Never add facts, examples, learning objectives, or citations not present in it.
- Translate the lesson faithfully into the named target language.
- Write simplified English at the stated reading level while preserving the lesson's instructional meaning.
- Choose 3–8 essential terms from the source and define them in plain English.
- Provide exactly three comprehension prompts that require understanding of the source, not AI use.
- If wording is ambiguous or the source is incomplete, list the issue in uncertaintyFlags. Do not guess.
- Return all requested languages in the same order: ${languages.join(", ")}.

SOURCE LESSON:
---
${sourceText}
---`;
}

function outputText(data: Record<string, unknown>) {
  if (typeof data.output_text === "string") return data.output_text;
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

export async function generatePackages(sourceText: string, languages: string[], readingLevel: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-5.6",
      store: false,
      reasoning: { effort: "medium" },
      input: buildPrompt(sourceText, languages, readingLevel),
      text: {
        format: {
          type: "json_schema",
          name: "language_packages",
          strict: true,
          schema: outputSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OPENAI_${response.status}:${detail.slice(0, 240)}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const text = outputText(data);
  if (!text) throw new Error("INVALID_OUTPUT");
  let parsed: { packages?: unknown };
  try {
    parsed = JSON.parse(text) as { packages?: unknown };
  } catch {
    throw new Error("INVALID_OUTPUT");
  }

  if (!Array.isArray(parsed.packages) || parsed.packages.length !== languages.length || !parsed.packages.every(isLanguagePackage)) {
    throw new Error("INVALID_OUTPUT");
  }
  return parsed.packages as LanguagePackage[];
}
