# Project Linguist — Implementation Tasks

Task source: [design.md](design.md) defines the product; [plan.md](plan.md) defines the one-week schedule. Complete P0 tasks in order before beginning P1 work.

## P0 — End-to-end demo

| ID | Task | Depends on | Done when | Estimate | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P0-01 | Initialize Next.js app | None | A TypeScript Next.js app starts locally, lint/typecheck scripts run, and `.env.example` documents `OPENAI_API_KEY`. | 2h | Unassigned | Not started |
| P0-02 | Create application types and constants | P0-01 | Shared types represent source input, learner settings, language packages, generation states, and approval states; language selection is limited to three. | 2h | Unassigned | Not started |
| P0-03 | Add visual tokens and global shell | P0-01 | Semantic color, spacing, typography, radius, focus, and state tokens from `design.md` are applied to a responsive shell. | 3h | Unassigned | Not started |
| P0-04 | Build source and settings form | P0-02, P0-03 | Teacher can paste text, choose a PDF, select one to three languages, choose reading level, and receive inline validation. | 4h | Unassigned | Not started |
| P0-05 | Implement PDF text extraction | P0-02 | Text-readable PDFs return normalized text; empty, image-only, password-protected, or failed documents display specific recovery guidance. | 4h | Unassigned | Not started |
| P0-06 | Define generation schema and prompt | P0-02 | A Structured Outputs schema matches `LanguagePackage`; the prompt requires source grounding, age-appropriate language, and explicit uncertainty flags. | 3h | Unassigned | Not started |
| P0-07 | Implement generation API route | P0-06 | Server route validates normalized text input, calls the Responses API with `gpt-5.6`, `reasoning.effort: "medium"`, and `store: false`, then returns schema-validated data. | 4h | Unassigned | Not started |
| P0-08 | Create deterministic demo fixture | P0-02 | A sample lesson and three complete language-package fixtures produce the full review flow without API credentials or network access. | 3h | Unassigned | Not started |
| P0-09 | Add live-generation fallback behavior | P0-07, P0-08, P0-10 | Missing credentials, rate limits, network failures, and safe-generation failures preserve input and offer a clearly labeled fixture-demo option. | 2h | Unassigned | Not started |
| P0-10 | Build generation state | P0-04, P0-08 | Submit disables duplicates, announces immediate status, shows meaningful generation stages, and can complete with the deterministic fixture. | 3h | Unassigned | Not started |
| P0-11 | Build language-package review | P0-03, P0-10 | Original source remains visible; one active language package is shown at a time through tabs; all package sections render clearly. | 4h | Unassigned | Not started |
| P0-12 | Add section editing and regeneration | P0-07, P0-11 | Teacher can edit a section locally and regenerate only that section without changing unapproved sections. | 4h | Unassigned | Not started |
| P0-13 | Add approval gate | P0-11 | Packages have Draft, Edited, and Approved states; the package cannot export until the teacher explicitly approves it. | 2h | Unassigned | Not started |
| P0-14 | Implement print/export | P0-13 | A print stylesheet includes only approved content and the Export button opens the browser print dialog. | 3h | Unassigned | Not started |

## P1 — Quality and submission readiness

| ID | Task | Depends on | Done when | Estimate | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P1-01 | Test validation and API behavior | P0-09 | Automated tests cover empty/oversized input, PDF error outcomes, request validation, schema failures, and fixture fallback. | 3h | Unassigned | Not started |
| P1-02 | Test core teacher workflow | P0-14 | Automated component tests cover generation state, language tabs, editing, approval gating, and export availability. | 2h | Unassigned | Not started |
| P1-03 | Run accessibility and responsive review | P0-14 | Keyboard-only path, focus visibility, labels, live status, contrast, narrow layout, and print layout are manually verified. | 3h | Unassigned | Not started |
| P1-04 | Evaluate fixture quality | P0-08, P0-14 | Three lessons across three languages are checked for complete sections, source grounding, and understandable limitations. | 3h | Unassigned | Not started |
| P1-05 | Write README and demo script | P1-01, P1-03 | README covers setup, fixture demo, sample input, privacy, and limitations; a two-minute recording script shows the whole P0 path. | 3h | Unassigned | Not started |

## P2 — Only after P0 and P1

| ID | Task | Depends on | Done when | Estimate | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P2-01 | Add a quality-evaluation rubric | P1-04 | A repeatable rubric scores translation faithfulness, reading-level fit, vocabulary usefulness, and prompt relevance. | 2h | Unassigned | Not started |
| P2-02 | Improve live-generation observability | P1-01 | Development-only request timing, fallback reason, and schema-validation result are visible without storing lesson content. | 2h | Unassigned | Not started |

## Task order

```text
P0-01 → P0-02 → P0-03 → P0-04 → P0-10 → P0-11 → P0-13 → P0-14
            ↘ P0-06 → P0-07 → P0-09 ↗
             ↘ P0-08 → P0-10 ────────┘
P0-02 → P0-05 (adds PDF source support)
P0-07 + P0-11 → P0-12
P0-14 → P1-01, P1-02, P1-03, P1-04 → P1-05
```

## Definition of done for every task

- The stated completion condition is demonstrably true.
- The work follows the relevant requirements in `design.md`.
- Loading, success, and failure states are considered for user-facing changes.
- New behavior has a targeted test or deterministic manual verification step.
- No student-identifying data is stored or added to demo fixtures.

## Cut line

If time runs short, deliver the reduced demo sequence **P0-01 → P0-02 → P0-03 → P0-04 (paste text only) → P0-08 → P0-10 → P0-11 → P0-13 → P0-14**. It must still show one target language, deterministic fixture output, explicit approval, and browser print. Mark PDF extraction, live API generation, multi-language selection, and section-level regeneration as deferred rather than weakening the complete demo flow.
