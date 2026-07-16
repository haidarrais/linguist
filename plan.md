# Project Linguist — One-Week Build Plan

## Goal

Deliver a responsive Next.js + TypeScript MVP that lets a teacher transform pasted text or a text-readable PDF into teacher-approved multilingual learning packages, then print an approved package.

The product requirements and UX decisions live in [design.md](design.md). This file is the execution checklist.

## Build plan

| Priority | Task | Done when | Dependency | Timebox |
| --- | --- | --- | --- | --- |
| P0 | Scaffold the app | Next.js + TypeScript runs locally; environment template documents `OPENAI_API_KEY` | None | 2 hours |
| P0 | Add design tokens and app shell | Setup, loading, review, error, and export layouts use the shared visual system | Scaffold | 3 hours |
| P0 | Build source input | Teacher can paste text or select a PDF; inputs validate before submission | App shell | 4 hours |
| P0 | Extract and validate PDF text | Text-readable PDFs become normalized source text; unsupported files receive actionable errors | Source input | 4 hours |
| P0 | Define output schema and API route | Server route validates input and returns typed multilingual packages | Scaffold | 4 hours |
| P0 | Implement live OpenAI generation | Route calls the Responses API with `gpt-5.6`, Structured Outputs, `reasoning.effort: "medium"`, and `store: false` | API route | 4 hours |
| P0 | Add deterministic fixture fallback | Demo lesson and multi-language outputs work when an API request is unavailable | API route | 3 hours |
| P0 | Build setup-to-generation flow | Teacher selects one to three languages and a reading level, receives immediate progress feedback, and cannot submit twice | Source input, API route | 4 hours |
| P0 | Build review and approval | Original text remains visible; tabs show one language at a time; sections edit/regenerate; export remains locked until approval | Generation flow | 6 hours |
| P0 | Build print/export | Approved content renders in a clean print stylesheet and opens the browser print dialog | Review and approval | 3 hours |
| P1 | Add tests and demo fixtures | Core validation, error, fallback, approval, and export scenarios are repeatable | P0 flow | 5 hours |
| P1 | Accessibility and responsive pass | Keyboard flow, focus, live status, contrast, and narrow-screen layout are verified | P0 flow | 3 hours |
| P1 | README and demo script | New contributor can run fixture demo; video follows the complete P0 path | P0 flow | 3 hours |
| P2 | Expand quality evaluation | Three lessons across three languages are evaluated and limitations documented | P1 | 4 hours |

## Step-by-step sequence

### Day 1 — Foundation and source input

1. Create the Next.js TypeScript project and repository basics.
2. Add the semantic tokens and responsive application shell specified in `design.md`.
3. Build the start and source/settings screen.
4. Implement pasted-text validation, PDF selection, and draft-preserving input errors.
5. Add the sample lesson entry point for the deterministic demo.

### Day 2 — Server boundary and generation contract

1. Define TypeScript types for requests, language packages, generation states, and approval states.
2. Add server-side PDF text extraction and reject unreadable or image-only documents.
3. Implement the generation route with length and language-count limits.
4. Create the source-grounded prompt and Structured Outputs schema.
5. Add the live OpenAI client with `store: false` and a configuration-safe error path.

### Day 3 — Reliable end-to-end demo

1. Add deterministic multilingual fixture packages.
2. Route failed or unconfigured live generation to an explicit “Use fixture demo” choice.
3. Implement staged generation feedback: preparing lesson, creating packages, checking output.
4. Prevent duplicate submission and preserve source/settings on every failure.
5. Manually verify pasted-text and text-PDF paths.

### Day 4 — Review, editing, and approval

1. Build the side-by-side reference and active-package review layout.
2. Implement language tabs, with only one package open at a time.
3. Add editable translation, simplified English, vocabulary, prompts, and source-note sections.
4. Add section-level regeneration that never alters other sections without approval.
5. Implement Draft, Edited, and Approved states; require approval before export.

### Day 5 — Export and UX hardening

1. Build a print-only handout rendering only approved material.
2. Add the browser print action and verify PDF save output.
3. Add specific recovery UI for empty input, bad PDFs, slow/failing generation, and invalid model output.
4. Review the implementation against the Laws of UX table in `design.md`.
5. Verify responsive behavior and keyboard navigation.

### Day 6 — Test and evaluate

1. Unit-test source validation, PDF outcomes, request validation, structured parsing, and fixture fallback.
2. Component-test language selection, generation states, tab navigation, editing, approval gating, and export availability.
3. Evaluate three sample lessons across three selected languages for completeness and source grounding.
4. Record limitations rather than presenting outputs as certified translation or autonomous instruction.

### Day 7 — Submission readiness

1. Write the README: installation, environment setup, fixture-demo instructions, sample input, privacy limits, and known limitations.
2. Create a deterministic reset path to the sample lesson.
3. Record a two-minute demo: inaccessible source lesson → multilingual package → teacher edit/approval → printable handout.
4. Run the final design review and fix only P0/P1 issues.

## API and behavior contract

- **Request:** `sourceText`, `targetLanguages` (1–3), `readingLevel`, and optional section regeneration context.
- **Response:** A schema-validated array of `LanguagePackage` objects defined in `design.md`.
- **Live mode:** Server-only call to the OpenAI Responses API using `gpt-5.6`.
- **Fallback mode:** Clearly labeled static sample output; never silently show mock content as live generation.
- **Data policy:** No source or generated content is persisted. Do not submit student-identifying information.

## Verification checklist

- [ ] Paste text → select three languages → generate → review one tab → edit → approve → print works.
- [ ] Text-readable PDF follows the same path.
- [ ] Image-only, password-protected, empty, oversized, and malformed sources yield clear recovery guidance.
- [ ] Missing API credentials and API failures offer the fixture demo without losing user input.
- [ ] Output schema failures do not render incomplete content as approved material.
- [ ] All critical controls work by keyboard with visible focus and clear labels.
- [ ] The narrow layout remains legible and the print layout excludes draft or unapproved content.

## Cut line

If time runs short, stop after the deterministic fixture-backed review-and-print flow. Keep pasted text, one target language, editable sections, approval, and print. Defer PDF upload, live API integration, multi-language generation, and section-level regeneration.
