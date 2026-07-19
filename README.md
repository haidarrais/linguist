# TeachBack

**Give every student a learner they must teach.**

TeachBack is a teacher-controlled learning interaction for the AI era. A teacher supplies a short, de-identified source packet and learning goal. GPT-5.6 builds a reviewable concept map and a deliberately mistaken simulated novice (“Nova”). A student explains the idea to Nova, tests it in a new case, and leaves a teacher-reviewable trace of the reasoning they made visible.

This is deliberately **not** an AI detector, proctor, grade, authorship judgment, or generic tutor. It is a constructive way to practice explanation and transfer when a finished answer alone is a weak signal of learning.

## Why this problem matters now

Generative AI makes it easier to produce polished final work without making the underlying reasoning visible. UNESCO argues that assessment should put more weight on process, dialogue, and explanation rather than escalating a detection arms race. [UNESCO’s assessment guidance](https://www.unesco.org/en/articles/whats-worth-measuring-future-assessment-ai-age) and [IES guidance on technology-enabled feedback](https://ies.ed.gov/learn/blog/using-technology-classroom-feedback) both point toward feedback and evidence that support learning, not surveillance.

TeachBack turns that need into a small instructional loop:

```text
Teacher-approved packet
        ↓
Source map + one calibrated misconception
        ↓ teacher approval
Student teaches the simulated novice
        ↓ visible state update
Novel transfer case
        ↓
Teacher reviews a learning trace
```

## Run it locally

```bash
npm install
npm run dev
```

Open the local address shown in the terminal, then choose **Open the worked demo**. The complete Greenwater Lake experience works offline and needs no API key.

To create a live twin from a teacher packet:

```bash
cp .env.example .env.local
```

Set `OPENAI_API_KEY` in `.env.local`, restart the app, and use **Build source map with GPT-5.6**. The key stays server-side. The live request uses the Responses API with `gpt-5.6`, Structured Outputs, `reasoning.effort: "medium"`, and `store: false`.

## What to try

The included deterministic Greenwater scenario demonstrates the full story:

1. Review the source map, verbatim evidence anchors, and Nova’s misconception: “Greener water should always mean more oxygen.”
2. Approve the twin as the teacher.
3. Let the student explain why a dying algal bloom can lower dissolved oxygen. The **Use worked demo reply** button makes the path repeatable for a video.
4. Let Nova test the idea on a warmer, clear pond with incomplete evidence.
5. Review—not grade—the resulting trace and optionally mark it teacher reviewed.

The visual state is intentionally labelled as **simulated learning state**. It describes what Nova can use next; it is not a claim about the student’s intelligence, identity, authorship, or inner state.

## How the agentic loop is grounded

The live path has two structured GPT-5.6 calls:

| Stage | GPT-5.6 produces | Guardrail |
| --- | --- | --- |
| Setup | A 3–5-node concept map, short evidence quotes, one bounded misconception, and two prompts | Every displayed evidence quote must occur verbatim in the teacher packet before a session is created. |
| Turn update | A concise twin reply, evidence items, updated node states, and (only after transfer) a teacher-review draft | Updated node IDs must already exist in the approved map; unknown or duplicate updates are rejected. |

The API will not accept a student turn until the session carries teacher approval. It also refuses more turns after the trace reaches teacher review. This is a prototype-level workflow gate—not a substitute for identity, authorization, or school data systems.

## Safety and privacy boundaries

- Use de-identified classroom material only. The MVP has no accounts, database, analytics, or student-record storage.
- A live source packet is sent to the OpenAI API only to create or update that one interaction. `store: false` disables response storage for the API request; review your organization’s data policy before using real classroom material.
- The app surfaces uncertainty rather than inventing unsupported facts, and it asks for revision rather than writing a student answer.
- Teachers approve both the source/misconception before interaction and the final learning note before using it outside the session.
- TeachBack does not make legal, compliance, grading, cheating, or diagnostic decisions. UNESCO’s [learner-rights guidance](https://www.unesco.org/en/articles/ai-and-education-protecting-rights-learners) is a useful broader reference for responsible deployment.

## Technical map

- `app/page.tsx` — the teacher setup, approval, student interaction, and review experience.
- `app/api/twin/route.ts` — validated JSON boundary for fixture and live sessions.
- `lib/openai.ts` — GPT-5.6 Responses API calls with strict JSON schemas.
- `lib/validation.ts` — input limits, literal quote verification, node-update validation, and session gate.
- `lib/fixture.ts` — the deterministic Greenwater demo, so judges can run the complete loop without credentials.
- `tests/` — contracts for validation, workflow progression, and API behavior.

## Verify before submitting

```bash
npm test
npm run lint
npm run build
```

The tests cover the offline flow, invalid input, literal source quotes, invented node IDs, and the route-level teacher-approval gate.

## Recommended 2–3 minute demo video

1. **0:00–0:20 — The problem.** “A polished answer is no longer enough evidence of reasoning. TeachBack gives a student a simulated novice they must teach.”
2. **0:20–0:45 — Grounding.** Open the Greenwater demo. Show the teacher-approved source, literal evidence anchors, concept chain, and Nova’s single misconception.
3. **0:45–1:30 — Teach-back.** Approve Nova. Submit the worked explanation and point to the visible state change: decomposition, oxygen, fish behavior, and the evidence boundary become grounded.
4. **1:30–2:10 — Transfer.** Submit the worked transfer response. Explain that Nova asks a genuinely new case, so the student must separate a possible explanation from what the evidence proves.
5. **2:10–2:35 — Teacher judgment.** Show the learning trace and state plainly: “This is not a grade or an AI-use finding; the teacher decides what to do next.”
6. **2:35–2:55 — Technical proof.** Briefly show the live builder or code: GPT-5.6 produces structured source maps and turn updates; literal quotes and approved node IDs are validated server-side. Mention Codex’s contribution below.

Record one successful live setup before recording the final video, then use the clearly labelled deterministic Greenwater path for a reliable walkthrough.

## Codex contribution

Codex was used as a design and implementation partner to:

- compare education concepts against the hackathon’s technical, design, impact, and originality criteria;
- turn the chosen idea into a tight source → misconception → teach-back → transfer → review state machine;
- implement the Next.js experience, structured GPT-5.6 calls, deterministic fixture, typed contracts, and tests;
- identify and harden two failure modes that would undermine trust in a judging demo: fabricated source quotes and unapproved student turns;
- run the complete browser flow and production checks.

Before submission, replace this paragraph only if your team’s actual Codex contribution differs. Add the required feedback-session identifier in the Devpost submission and README once it is available.

## Scope intentionally left out

No accounts, LMS integration, browser monitoring, voice recording, answer detection, automated grading, subject analytics, or claims that an AI literally learns. Those features would weaken the one thing this prototype must prove: a teacher can make a student’s explanation and transfer reasoning visible without turning assessment into surveillance.
