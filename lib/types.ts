export const AVAILABLE_LANGUAGES = [
  "Spanish",
  "Bahasa Indonesia",
  "Arabic",
  "French",
  "Hindi",
  "Vietnamese",
] as const;

export const READING_LEVELS = ["Grade 3–4", "Grade 5–6", "Grade 7–8", "Grade 9–10"] as const;

export type LanguagePackage = {
  language: string;
  translation: string;
  simplifiedEnglish: string;
  keyVocabulary: Array<{ term: string; definition: string }>;
  comprehensionPrompts: string[];
  sourceNotes: string[];
  uncertaintyFlags: string[];
};

export type GenerationResponse = {
  sourceText: string;
  packages: LanguagePackage[];
  mode: "live" | "fixture";
};

export type GenerationError = {
  error: string;
  code: "invalid_input" | "invalid_pdf" | "api_unavailable" | "generation_failed" | "invalid_output";
};
