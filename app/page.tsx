"use client";

import { FormEvent, useMemo, useState } from "react";
import { SAMPLE_LESSON } from "@/lib/fixture";
import { AVAILABLE_LANGUAGES, READING_LEVELS, type GenerationResponse, type LanguagePackage } from "@/lib/types";

type PackageState = "draft" | "edited" | "approved";
type PackageKey = "translation" | "simplifiedEnglish" | "comprehensionPrompts";

const initialLanguages = ["Spanish", "Bahasa Indonesia"];

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [languages, setLanguages] = useState<string[]>(initialLanguages);
  const [readingLevel, setReadingLevel] = useState<(typeof READING_LEVELS)[number]>("Grade 5–6");
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [activeLanguage, setActiveLanguage] = useState("");
  const [states, setStates] = useState<Record<string, PackageState>>({});
  const [status, setStatus] = useState<"idle" | "generating" | "regenerating">("idle");
  const [error, setError] = useState("");
  const [canUseFixture, setCanUseFixture] = useState(false);

  const activePackage = useMemo(
    () => result?.packages.find((item) => item.language === activeLanguage) ?? result?.packages[0] ?? null,
    [activeLanguage, result]
  );

  function changeLanguage(language: string) {
    setLanguages((current) => {
      if (current.includes(language)) return current.filter((item) => item !== language);
      if (current.length === 3) return current;
      return [...current, language];
    });
  }

  function loadDemo() {
    setSourceText(SAMPLE_LESSON);
    setFile(null);
    setLanguages(initialLanguages);
    setReadingLevel("Grade 5–6");
    setError("");
    setCanUseFixture(true);
  }

  function formData(mode: "live" | "fixture", targetLanguages = languages) {
    const data = new FormData();
    data.set("sourceText", sourceText);
    data.set("languages", JSON.stringify(targetLanguages));
    data.set("readingLevel", readingLevel);
    data.set("mode", mode);
    if (file) data.set("file", file);
    return data;
  }

  async function generate(mode: "live" | "fixture") {
    setStatus("generating");
    setError("");
    setCanUseFixture(false);
    try {
      const response = await fetch("/api/generate", { method: "POST", body: formData(mode) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "We could not create a package. Your lesson is still here.");
        setCanUseFixture(data.code === "api_unavailable" || data.code === "generation_failed" || data.code === "invalid_output");
        return;
      }
      const generated = data as GenerationResponse;
      setResult(generated);
      setActiveLanguage(generated.packages[0]?.language ?? "");
      setStates(Object.fromEntries(generated.packages.map((item) => [item.language, "draft"])));
    } catch {
      setError("We could not reach the generator. Your lesson is still here—use the fixture demo to continue.");
      setCanUseFixture(true);
    } finally {
      setStatus("idle");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceText.trim() && !file) {
      setError("Add lesson text or choose a text-readable PDF.");
      return;
    }
    if (!languages.length) {
      setError("Select at least one target language.");
      return;
    }
    await generate("live");
  }

  function updatePackage(language: string, update: (current: LanguagePackage) => LanguagePackage) {
    setResult((current) =>
      current
        ? { ...current, packages: current.packages.map((item) => (item.language === language ? update(item) : item)) }
        : current
    );
    setStates((current) => ({ ...current, [language]: "edited" }));
  }

  async function regenerateSection(key: PackageKey) {
    if (!activePackage) return;
    setStatus("regenerating");
    setError("");
    try {
      const response = await fetch("/api/generate", { method: "POST", body: formData("live", [activePackage.language]) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "That section could not be regenerated. Your edits are unchanged.");
        setCanUseFixture(true);
        return;
      }
      const replacement = (data as GenerationResponse).packages[0];
      updatePackage(activePackage.language, (current) => ({ ...current, [key]: replacement[key] }));
    } catch {
      setError("That section could not be regenerated. Your edits are unchanged.");
      setCanUseFixture(true);
    } finally {
      setStatus("idle");
    }
  }

  function approve(language: string) {
    setStates((current) => ({ ...current, [language]: "approved" }));
  }

  const activeState = activePackage ? states[activePackage.language] ?? "draft" : "draft";

  return (
    <main className="app-shell">
      <header className="masthead">
        <a className="brand" href="#start" aria-label="Project Linguist home">
          <span className="brand-mark">L</span>
          <span>Project Linguist</span>
        </a>
        <p>Teacher-reviewed multilingual learning access</p>
      </header>

      <section className="hero" id="start">
        <div>
          <p className="eyebrow">ONE LESSON. MORE LEARNERS INCLUDED.</p>
          <h1>Make tomorrow&apos;s lesson understandable today.</h1>
          <p className="lede">Turn a lesson into clear, reviewable language packages—without replacing your professional judgment.</p>
        </div>
        <button className="text-button" type="button" onClick={loadDemo}>
          Load sample lesson
        </button>
      </section>

      <form className="setup-card" onSubmit={onSubmit}>
        <div className="section-heading">
          <div>
            <p className="step">STEP 1</p>
            <h2>Add the lesson</h2>
          </div>
          <p className="privacy">Use classroom materials only. Do not upload student records or personal information.</p>
        </div>

        <label htmlFor="source">Paste lesson text</label>
        <textarea
          id="source"
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          placeholder="Paste a passage, worksheet, or chapter summary…"
          rows={10}
        />

        <div className="or"><span>or</span></div>
        <label className="file-input" htmlFor="file">
          <span>Upload a text-readable PDF</span>
          <small>{file ? file.name : "Scanned and image-only PDFs are not supported in this MVP."}</small>
          <input id="file" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>

        <div className="settings-grid">
          <fieldset>
            <legend>Target languages <span>(choose up to 3)</span></legend>
            <div className="choice-grid">
              {AVAILABLE_LANGUAGES.map((language) => {
                const checked = languages.includes(language);
                const disabled = !checked && languages.length === 3;
                return (
                  <label className={`choice ${checked ? "selected" : ""}`} key={language}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => changeLanguage(language)} />
                    {language}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="select-label" htmlFor="level">
            Reading level
            <select id="level" value={readingLevel} onChange={(event) => setReadingLevel(event.target.value as typeof readingLevel)}>
              {READING_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
        </div>

        <div className="action-row">
          <div aria-live="polite" className="status-message">
            {status === "generating" ? "Preparing lesson, creating language packages, and checking the output…" : "AI draft — review before using with students."}
          </div>
          <button className="primary-button" type="submit" disabled={status !== "idle"}>
            {status === "generating" ? "Creating packages…" : "Generate packages"}
          </button>
        </div>
        {error && (
          <div className="alert" role="alert">
            <p>{error}</p>
            {canUseFixture && <button type="button" onClick={() => generate("fixture")}>Use fixture demo</button>}
          </div>
        )}
      </form>

      {result && activePackage && (
        <section className="review" aria-labelledby="review-heading">
          <div className="review-heading">
            <div>
              <p className="step">STEP 2</p>
              <h2 id="review-heading">Review the learning package</h2>
              <p>{result.mode === "fixture" ? "Fixture demo — deterministic sample output" : "Live AI draft — teacher review required"}</p>
            </div>
            <span className={`state-pill ${activeState}`}>{activeState}</span>
          </div>
          <div className="review-layout">
            <aside className="source-panel">
              <p className="panel-kicker">SOURCE LESSON</p>
              <pre>{result.sourceText}</pre>
            </aside>
            <section className="package-panel">
              <div className="tabs" role="tablist" aria-label="Language packages">
                {result.packages.map((item) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activePackage.language === item.language}
                    className={activePackage.language === item.language ? "active" : ""}
                    key={item.language}
                    onClick={() => setActiveLanguage(item.language)}
                  >
                    {item.language}
                  </button>
                ))}
              </div>

              <EditableSection
                title="Translation"
                value={activePackage.translation}
                onChange={(value) => updatePackage(activePackage.language, (item) => ({ ...item, translation: value }))}
                onRegenerate={() => regenerateSection("translation")}
                busy={status === "regenerating"}
              />
              <EditableSection
                title={`Simplified English · ${readingLevel}`}
                value={activePackage.simplifiedEnglish}
                onChange={(value) => updatePackage(activePackage.language, (item) => ({ ...item, simplifiedEnglish: value }))}
                onRegenerate={() => regenerateSection("simplifiedEnglish")}
                busy={status === "regenerating"}
              />
              <section className="content-section">
                <h3>Key vocabulary</h3>
                <dl className="vocabulary">
                  {activePackage.keyVocabulary.map((item, index) => (
                    <div key={`${item.term}-${index}`}>
                      <dt>{item.term}</dt><dd>{item.definition}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="content-section">
                <div className="section-title-row"><h3>Comprehension prompts</h3><button type="button" className="text-button small" onClick={() => regenerateSection("comprehensionPrompts")} disabled={status !== "idle"}>Regenerate</button></div>
                <ol>
                  {activePackage.comprehensionPrompts.map((prompt, index) => (
                    <li key={index}><input aria-label={`Comprehension prompt ${index + 1}`} value={prompt} onChange={(event) => updatePackage(activePackage.language, (item) => ({ ...item, comprehensionPrompts: item.comprehensionPrompts.map((value, promptIndex) => promptIndex === index ? event.target.value : value) }))} /></li>
                  ))}
                </ol>
              </section>
              {!!activePackage.uncertaintyFlags.length && <section className="uncertainty"><h3>Review notes</h3><ul>{activePackage.uncertaintyFlags.map((note) => <li key={note}>{note}</li>)}</ul></section>}

              <div className="approval-row">
                <div><strong>{activeState === "approved" ? "Approved for export" : "Review complete?"}</strong><span>{activeState === "approved" ? "Editing this package will require approval again." : "Approval confirms you reviewed this draft."}</span></div>
                <button className="primary-button" type="button" onClick={() => approve(activePackage.language)} disabled={activeState === "approved"}>{activeState === "approved" ? "Approved" : "Approve package"}</button>
              </div>
            </section>
          </div>
        </section>
      )}

      {result && activePackage && activeState === "approved" && (
        <section className="export-card">
          <div><p className="step">STEP 3</p><h2>Ready for students</h2><p>Print the approved {activePackage.language} package or save it as a PDF.</p></div>
          <button className="primary-button" type="button" onClick={() => window.print()}>Print / save as PDF</button>
        </section>
      )}
    </main>
  );
}

function EditableSection({ title, value, onChange, onRegenerate, busy }: { title: string; value: string; onChange: (value: string) => void; onRegenerate: () => void; busy: boolean }) {
  return (
    <section className="content-section">
      <div className="section-title-row"><h3>{title}</h3><button type="button" className="text-button small" onClick={onRegenerate} disabled={busy}>Regenerate</button></div>
      <textarea aria-label={title} value={value} onChange={(event) => onChange(event.target.value)} rows={5} />
    </section>
  );
}
