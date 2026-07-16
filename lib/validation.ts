import type { LanguagePackage } from "@/lib/types";

export const MAX_SOURCE_LENGTH = 30000;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function validateRequest(sourceText: string, languages: string[]) {
  if (!sourceText.trim()) return "Add lesson text or choose a text-readable PDF.";
  if (sourceText.length > MAX_SOURCE_LENGTH) return "This lesson is too long for the MVP. Use 30,000 characters or fewer.";
  if (languages.length < 1 || languages.length > 3) return "Select between one and three target languages.";
  return null;
}

export function isLanguagePackage(value: unknown): value is LanguagePackage {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.language === "string" &&
    typeof item.translation === "string" &&
    typeof item.simplifiedEnglish === "string" &&
    Array.isArray(item.keyVocabulary) &&
    Array.isArray(item.comprehensionPrompts) &&
    Array.isArray(item.sourceNotes) &&
    Array.isArray(item.uncertaintyFlags)
  );
}
