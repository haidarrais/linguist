import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import { getFixture } from "@/lib/fixture";
import { generatePackages } from "@/lib/openai";
import { MAX_FILE_BYTES, validateRequest } from "@/lib/validation";

export const runtime = "nodejs";

async function textFromPdf(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error("PDF_TOO_LARGE");
  try {
    const result = await pdf(Buffer.from(await file.arrayBuffer()));
    const text = result.text.replace(/\s+/g, " ").trim();
    if (!text) throw new Error("PDF_EMPTY");
    return text;
  } catch (error) {
    if (error instanceof Error && ["PDF_TOO_LARGE", "PDF_EMPTY"].includes(error.message)) throw error;
    throw new Error("PDF_UNREADABLE");
  }
}

export async function POST(request: Request) {
  const form = await request.formData();
  const mode = String(form.get("mode") ?? "live");
  const readingLevel = String(form.get("readingLevel") ?? "Grade 5–6");
  const rawLanguages = String(form.get("languages") ?? "[]");
  let languages: string[] = [];
  try {
    const value = JSON.parse(rawLanguages);
    languages = Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
  } catch {
    return NextResponse.json({ error: "Language selection is invalid.", code: "invalid_input" }, { status: 400 });
  }

  let sourceText = String(form.get("sourceText") ?? "").trim();
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Choose a PDF file or paste the lesson text.", code: "invalid_pdf" }, { status: 400 });
    }
    try {
      const extracted = await textFromPdf(file);
      sourceText = sourceText ? `${sourceText}\n\n${extracted}` : extracted;
    } catch (error) {
      const message = error instanceof Error && error.message === "PDF_TOO_LARGE"
        ? "This PDF is larger than 5 MB. Use a smaller text-readable PDF or paste the lesson text."
        : "We could not read text from this PDF. It may be scanned, password-protected, or image-only. Paste the lesson text instead.";
      return NextResponse.json({ error: message, code: "invalid_pdf" }, { status: 400 });
    }
  }

  const validationError = validateRequest(sourceText, languages);
  if (validationError) return NextResponse.json({ error: validationError, code: "invalid_input" }, { status: 400 });

  if (mode === "fixture") {
    return NextResponse.json(getFixture(languages));
  }

  try {
    const packages = await generatePackages(sourceText, languages, readingLevel);
    return NextResponse.json({ sourceText, packages, mode: "live" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GENERATION_FAILED";
    if (message === "API_KEY_MISSING") {
      return NextResponse.json(
        { error: "Live generation is not configured. Use the fixture demo to continue.", code: "api_unavailable" },
        { status: 503 }
      );
    }
    if (message === "INVALID_OUTPUT") {
      return NextResponse.json(
        { error: "The model returned an incomplete package. Your lesson is still here—try again or use the fixture demo.", code: "invalid_output" },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Live generation is temporarily unavailable. Your lesson is still here—try again or use the fixture demo.", code: "generation_failed" },
      { status: 502 }
    );
  }
}
