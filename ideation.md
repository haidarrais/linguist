# Project Linguist — Ideation & Product Rationale

## The idea in one sentence

**Project Linguist helps a teacher turn an existing lesson into a teacher-reviewed multilingual learning package, so a learner who does not yet understand the language of instruction can participate in the same lesson as their peers.**

This is an Education-track project for **OpenAI Build Week**. It is designed around a single observable outcome: a teacher starts with a lesson that is inaccessible to some learners and ends with an approved, printable handout.

## Why this problem

The product begins with a practical classroom tension: teachers are expected to differentiate instruction for a diverse group of learners, but adapting one worksheet into understandable language for several learners takes time they often do not have. Language access is not merely a convenience issue—it determines whether a student can participate in the learning activity at all.

The initial concept could have been framed as a lesson-plan generator. That was deliberately rejected because generic generation is difficult to distinguish and does not make the learner outcome visible. Project Linguist instead treats **multilingual access** as the outcome and **teacher time savings** as the mechanism.

### Primary user

A K–12 teacher with multilingual learners in a mixed-ability classroom.

### Painful moment

The teacher has tomorrow’s lesson ready, but does not have enough time to create understandable, classroom-ready versions for students who are still acquiring the instructional language.

### What success looks like

In one short session, the teacher can add a lesson, select up to three target languages, review an adaptation one language at a time, edit it, approve it, and print it.

## The key product insight

The strongest version of this idea is **not** “AI translates a worksheet.” Translation alone can preserve words while missing comprehension support, unfamiliar vocabulary, or the teacher’s need to verify the material.

The product therefore produces a bounded learning package:

1. A faithful translation in the learner’s target language.
2. A simplified-English version at a teacher-selected reading level.
3. Essential vocabulary with plain-language definitions.
4. Three source-grounded comprehension prompts.
5. Notes for ambiguity or missing source context instead of invented content.

This package links access with learning. It gives the learner a way into the shared lesson while giving the teacher clear material to review.

## Concept evolution

| Option considered | Why it was not the MVP | Decision |
| --- | --- | --- |
| Generic lesson generator | Broad, familiar, and weakly tied to a particular learner outcome | Rejected |
| Fully autonomous translation and distribution | Removes teacher control and makes errors harder to catch | Rejected |
| LMS-wide translation plugin | Requires accounts, integrations, school data, and permissions | Deferred |
| Student chatbot | Risks becoming an answer machine instead of a classroom support tool | Deferred |
| One lesson → teacher-reviewed multilingual package | Specific user, visible equity outcome, focused demo, and feasible vertical slice | Chosen |

## MVP boundary

The MVP is intentionally a focused vertical slice—not a complete school platform.

### It does

- Accept pasted lesson text or a text-readable PDF.
- Let a teacher choose one to three target languages and a reading level.
- Generate a structured language package using GPT-5.6 when an API key is configured.
- Preserve teacher agency through editing, section-level regeneration, and explicit approval.
- Export only approved content through the browser print dialog.
- Offer a clearly labeled deterministic fixture demo when live generation is unavailable.

### It does not do

- Store student information, classroom rosters, lesson history, or generated content.
- Claim certified translation, curriculum alignment, or automated instructional decisions.
- Integrate with an LMS, grade students, or replace teacher judgment.

## Current implementation

The working prototype is a responsive **Next.js + TypeScript** application.

### Teacher journey

```text
Add lesson → select learner needs → generate → review one language → edit → approve → print/export
```

### Technical flow

```text
Teacher browser
  → /api/generate (server route)
  → validate text / extract text from PDF
  → OpenAI Responses API with GPT-5.6 and Structured Outputs
  → typed language packages
  → teacher review and approval in the browser
```

The live call stays server-side. It uses `gpt-5.6`, `reasoning.effort: "medium"`, `store: false`, and a JSON-schema response contract. The schema keeps the UI dependent on predictable package fields rather than free-form prose.

When the API is not configured or returns an error, the app preserves the teacher’s input and explicitly offers a fixture demo. The fixture is never silently passed off as live output, and it always remains paired with its own sample lesson.

## Why GPT-5.6 and Codex are necessary

The project is not using AI only to make text. It needs a reliable, structured transformation of instructional material:

- **GPT-5.6** turns one lesson into multiple constrained outputs while maintaining the source as the grounding authority.
- **Structured Outputs** make the product reliable enough to render, edit, approve, and print individual sections predictably.
- **The Responses API** gives the app a modern server-side boundary for this reasoning and structured workflow.
- **Codex** accelerated the implementation from a research brief to a runnable product: the project structure, type contract, API route, responsive interface, fixture fallback, tests, README, and design documentation were created as a coherent vertical slice.

The technical choice matches the problem: multilingual instructional adaptation requires both language fluency and structure. A teacher needs more than a chat response; they need a reviewable package that fits a real lesson workflow.

## Design rationale

The user is already managing lesson complexity. The UI should remove extra decisions rather than introduce a clever new interface.

| UX decision | Reason |
| --- | --- |
| One setup form with clear defaults | Keeps the initial choice set small. |
| Maximum three target languages | Supports real classroom variation without overwhelming the teacher or the review experience. |
| One active language tab at a time | Makes source comparison and teacher review legible instead of creating a noisy multi-column page. |
| Source lesson remains visible beside the output | Makes grounding and teacher verification easy. |
| Large Generate, Approve, and Export actions near relevant content | Keeps high-value actions easy to find and use. |
| Explicit staged generation status | Acknowledges the teacher’s action immediately and makes longer AI work understandable. |
| Approval gate before export | Makes the human-in-the-loop safeguard visible and consequential. |
| Print-ready ending | Ends with a tangible student-facing artifact rather than an abstract AI response. |

The full Laws of UX rationale is documented in [design.md](design.md).

## Responsible-use decisions

The product is framed as a **drafting and scaffolding assistant**. That framing is a feature, not a disclaimer added at the end.

- Every generated package is marked “AI draft — review before using with students.”
- The teacher can edit any output before approval.
- Editing resets approval, so changed material must be reviewed again before export.
- The model is instructed to list uncertainty instead of inventing facts.
- The app asks teachers not to submit personally identifying student information.
- Source and generated content are not persisted in the MVP.

## Devpost positioning

**Recommended category: Education.** The Build Week brief defines this category for projects advancing AI for students, teachers, or educational organizations. Project Linguist addresses a teacher workflow while making access to instruction more equitable for multilingual learners.

### How the concept addresses the judging criteria

| Devpost criterion | Evidence in Project Linguist |
| --- | --- |
| Technological Implementation | A working Next.js application; server-only GPT-5.6 Responses API call; Structured Outputs; PDF text extraction; typed response validation; fixture fallback; tests. |
| Design | One coherent source-to-handout workflow, responsive layout, explicit status/error states, reviewable source/output relationship, and teacher approval before export. |
| Potential Impact | A specific real audience and a clear access problem: teachers need to make shared lessons understandable for multilingual learners without losing hours to manual adaptation. |
| Quality of Idea | The product is not a generic generator. Its differentiator is the teacher-approved multilingual learning package, which combines translation, simplified English, vocabulary, prompts, grounding, and print-ready handoff. |

### Submission narrative

Start the demo with a teacher’s painful moment: “This lesson is ready, but some students cannot yet access it in the language of instruction.” Show the input and learner choices. Generate the package. Compare the original to the selected language tab. Make a small teacher edit, approve it, and print it. End on the learner outcome: the same lesson is now accessible without asking the teacher to become a translator overnight.

### Submission checklist

- [ ] Select **Education** as the Devpost category.
- [ ] Add the public or judge-shared code repository URL.
- [ ] Keep the README setup instructions and fixture demo path current.
- [ ] Record a public video under three minutes that shows the product working.
- [ ] In the video voiceover, explain both how Codex accelerated the build and how GPT-5.6 powers the structured language package.
- [ ] Add the required `/feedback` Codex session ID to the Devpost form.
- [ ] Include a live demo URL if deployed; otherwise explain how judges can run the deterministic fixture path locally.

## What comes next after the MVP

The most valuable next work should improve confidence in the core outcome, not add unrelated features:

1. Evaluate source fidelity and reading-level fit across more lesson and language fixtures.
2. Test the workflow with teachers and multilingual-learning specialists.
3. Improve PDF extraction for complex documents while keeping scanned-PDF failure states clear.
4. Add export templates only after the core review-and-print flow is trusted.
5. Consider LMS integration only after privacy, permissions, and school workflow requirements are properly understood.

## Supporting documents

- [Strategy and research brief](hackathon.md)
- [Product and UX design](design.md)
- [Build plan](plan.md)
- [Implementation tasks](tasks.md)
- [Run and demo instructions](README.md)

## Sources

- Devpost Hackathons plugin: OpenAI Build Week overview, submission requirements, and judging criteria, retrieved July 16, 2026.
- [OpenAI model guidance for GPT-5.6](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI Responses API guidance](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [OpenAI Structured Outputs guidance](https://developers.openai.com/api/docs/guides/structured-outputs)
