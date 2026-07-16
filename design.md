# Project Linguist — Product & UX Design

## Product brief

**Pitch:** Project Linguist helps a K–12 teacher turn an existing lesson into a teacher-reviewed multilingual learning package, so learners who do not yet understand the classroom language can participate in the same lesson.

- **Primary user:** A K–12 classroom teacher supporting multilingual learners in a mixed-ability class.
- **Painful moment:** Tomorrow’s worksheet is ready, but adapting it for several language needs takes too long to do well.
- **MVP outcome:** In one short session, a teacher can add a lesson, generate language packages for up to three target languages, review one package at a time, approve it, and print a student-ready handout.
- **Evidence:** The strategy brief identifies language barriers and teacher workload as linked, high-impact education problems. See [hackathon.md](hackathon.md).

## Scope

### P0 — Working vertical slice

1. Paste lesson text or upload a text-readable PDF.
2. Choose one to three target languages and a reading level.
3. Generate a package for each selected language.
4. Review, edit, regenerate, and approve individual sections.
5. Print or save an approved package as a PDF from the browser.

### P1 — Credibility and resilience

- A deterministic fixture demo when live generation is unavailable.
- Clear PDF parsing, generation, malformed-output, and network-error recovery.
- Keyboard, focus, contrast, screen-reader status, and mobile-layout checks.

### Non-goals

- Student accounts, class rosters, LMS integration, analytics, saved history, grading, text-to-speech, or automated instructional decisions.
- Claims of certified translation, curriculum alignment, or production compliance.

## Core flow and information architecture

```text
Start → Add lesson → Set learner needs → Generate → Review one language → Approve → Print/export
```

| Screen | Purpose | Essential content | Primary action |
| --- | --- | --- | --- |
| Start | Establish the task | Short promise, demo-fixture option, privacy reminder | Start adapting a lesson |
| Source & settings | Prepare one transformation request | Paste area, PDF upload, language chips, reading-level selector | Generate packages |
| Generation | Preserve trust during model work | Staged status and cancel/retry affordance | Wait, retry, or use fixture |
| Review | Let the teacher make a pedagogical decision | Source reference, selected-language tab, editable package sections | Approve package |
| Export | Deliver the tangible outcome | Approved print preview and success confirmation | Print / Save as PDF |

The review screen keeps the original lesson visible as a reference and shows only one language package in the main work area. Language tabs switch packages; they do not create competing, hard-to-compare columns.

## Inputs, output, and control

### Inputs

- **Source:** Pasted text or PDF with extractable text.
- **Settings:** Target language selection (maximum three) and learner reading level.
- **Privacy boundary:** The UI tells teachers not to upload student records or personally identifying information.

Reject empty, oversized, password-protected, image-only, or unreadable PDFs. Preserve the typed/pasted text and provide an actionable recovery message.

### Generated language package

```ts
type LanguagePackage = {
  language: string;
  translation: string;
  simplifiedEnglish: string;
  keyVocabulary: Array<{ term: string; definition: string }>;
  comprehensionPrompts: string[];
  sourceNotes: string[];
  uncertaintyFlags: string[];
};
```

The model must preserve instructional meaning, avoid invented facts, retain key questions or headings when possible, and surface ambiguity in `uncertaintyFlags` instead of guessing.

### Teacher approval

Every output begins as a **Draft**. Each section can be edited or regenerated individually. A package becomes **Approved** only after an explicit teacher action, which unlocks export. The export includes only approved content.

Visible copy: **“AI draft — review before using with students.”**

## AI and data design

- Call the OpenAI Responses API from the server only; never expose the API key to the browser.
- Use `gpt-5.6` with `reasoning.effort: "medium"` and `store: false`.
- Use Structured Outputs to return the language-package contract above, rather than parsing arbitrary prose.
- When a live request cannot run, offer a clearly labeled deterministic demo fixture. Do not silently substitute fixture content.
- Do not persist source lessons, generated packages, or student information in v1.

The Responses API is OpenAI’s recommended interface for new projects, and Structured Outputs provides schema adherence for predictable UI rendering. See [Responses API guidance](https://developers.openai.com/api/docs/guides/migrate-to-responses), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), and [GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model).

## UX principles and design decisions

| Principle | Design decision |
| --- | --- |
| [Cognitive Load](https://lawsofux.com/cognitive-load/) | Show source, learner settings, and the next action at each stage; group each output with its controls; remove decorative distractions. |
| [Hick’s Law](https://lawsofux.com/hicks-law/) | Default common settings, label recommendations, progressively reveal advanced controls, and cap language selection at three. |
| [Jakob’s Law](https://lawsofux.com/jakobs-law/) | Use familiar upload, select, tab, text-editing, approval, and browser-print patterns. |
| [Fitts’s Law](https://lawsofux.com/fittss-law/) | Make Generate, Approve, and Export large, well-spaced targets close to the relevant content. |
| [Doherty Threshold](https://lawsofux.com/doherty-threshold/) | Acknowledge every interaction immediately; use meaningful generation stages and clear wait states for longer model calls. |
| [Postel’s Law](https://lawsofux.com/postels-law/) | Accept pasted text or valid PDFs, normalize safely, validate at boundaries, and give specific recovery feedback. |
| [Peak-End Rule](https://lawsofux.com/peak-end-rule/) | End the flow with a clean, teacher-approved handout and a succinct success message. |

## Visual and interaction system

- **Tone:** Calm, trustworthy, and classroom-ready; avoid a generic chatbot or dashboard aesthetic.
- **Layout:** A responsive single-column form for setup; split reference/work area on large screens; stacked reference and output panels on small screens.
- **Content grouping:** Use headings, labels, and subtle bounded regions to connect vocabulary, prompts, status, and controls to the output they govern.
- **States:** Design explicit empty, ready, validating, generating, draft, edited, approved, success, and error states.
- **Accessibility:** Semantic controls and labels, visible keyboard focus, live status announcements, readable contrast, sufficiently large targets, and print styles.

## Design tokens

```css
:root {
  --color-surface: #ffffff;
  --color-surface-muted: #f4f7f8;
  --color-text: #172033;
  --color-text-muted: #596579;
  --color-primary: #0f766e;
  --color-primary-hover: #0b5d56;
  --color-success: #167a45;
  --color-warning: #a45300;
  --color-danger: #b42318;
  --color-focus: #2563eb;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
}
```

## Success evidence

- A teacher completes the source-to-approved-handout path without manual recovery.
- Every selected language has a complete, source-grounded, editable package.
- The UI clearly distinguishes draft from approved material.
- The deterministic demo completes without credentials or network access.

## Risks and decisions

| Risk or assumption | Decision or mitigation |
| --- | --- |
| Model output may be inaccurate or culturally inappropriate | Keep source visible, require teacher approval, allow section-level edits, and label output as a draft. |
| Live API access may fail during judging | Provide a clearly labeled deterministic fixture fallback. |
| Scanned PDFs do not expose text | Identify this specific limitation and ask for pasted text or a text-readable PDF. |
| Multiple languages can make review noisy | Generate up to three but review one selected language package at a time. |
