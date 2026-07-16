import type { GenerationResponse, LanguagePackage } from "@/lib/types";

export const SAMPLE_LESSON = `How do plants move water from their roots to their leaves?

Plants need water to live. Roots take in water from the soil. Tiny tubes inside the stem carry water upward to the leaves. This movement is called transpiration. When water leaves through tiny openings in the leaves, it helps pull more water upward from the roots.

Questions
1. Where do plants get water?
2. What do the tiny tubes in the stem do?
3. Why is transpiration important?`;

function makePackage(language: string, translation: string): LanguagePackage {
  return {
    language,
    translation,
    simplifiedEnglish:
      "Plants need water to live. Their roots take water from the soil. Small tubes in the stem move water up to the leaves. Water leaves the leaves through tiny openings. This helps pull more water up from the roots.",
    keyVocabulary: [
      { term: "roots", definition: "The parts of a plant that take in water from soil." },
      { term: "stem", definition: "The plant part that holds it up and carries water." },
      { term: "transpiration", definition: "When water leaves a plant through tiny openings in its leaves." },
    ],
    comprehensionPrompts: [
      "Point to the part of a plant that takes in water.",
      "Explain how water travels from the roots to the leaves.",
      "What might happen if a plant could not move water upward?",
    ],
    sourceNotes: ["Vocabulary and questions are based only on the source lesson."],
    uncertaintyFlags: [],
  };
}

const TRANSLATIONS: Record<string, string> = {
  Spanish:
    "Las plantas necesitan agua para vivir. Las raíces absorben agua del suelo. Tubos pequeños dentro del tallo llevan el agua hacia las hojas. Este movimiento se llama transpiración. Cuando el agua sale por pequeñas aberturas en las hojas, ayuda a subir más agua desde las raíces.",
  "Bahasa Indonesia":
    "Tumbuhan membutuhkan air untuk hidup. Akar menyerap air dari tanah. Tabung kecil di dalam batang membawa air ke atas menuju daun. Pergerakan ini disebut transpirasi. Ketika air keluar melalui bukaan kecil di daun, air membantu menarik lebih banyak air dari akar ke atas.",
  Arabic:
    "تحتاج النباتات إلى الماء لتعيش. تمتص الجذور الماء من التربة. تنقل أنابيب صغيرة داخل الساق الماء إلى الأعلى نحو الأوراق. تسمى هذه الحركة بالنتح. عندما يخرج الماء من فتحات صغيرة في الأوراق، يساعد ذلك على سحب مزيد من الماء إلى الأعلى من الجذور.",
};

export function getFixture(languages: string[]): GenerationResponse {
  const selected = languages.length ? languages : ["Spanish"];
  return {
    sourceText: SAMPLE_LESSON,
    packages: selected.map((language) =>
      makePackage(
        language,
        TRANSLATIONS[language] ?? `A teacher-reviewed ${language} draft is available in live mode.`
      )
    ),
    mode: "fixture",
  };
}
