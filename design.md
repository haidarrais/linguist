# TeachBack — product and interaction design

## Product promise

TeachBack gives a student a deliberately mistaken simulated novice to teach. The student must explain a source-grounded mechanism and apply it to a new case. The teacher—not the model—uses the resulting trace as one input to the next instructional conversation.

The design goal is not to prove authorship or rank a learner. It is to make a specific reasoning relationship visible in a short, humane interaction.

## People and jobs

| Person | Job | What TeachBack gives them |
| --- | --- | --- |
| Teacher | Turn a short source and learning goal into a focused explanation activity | A reviewable concept map, one bounded misconception, and final human control |
| Student | Show reasoning without being asked to defend a whole finished artifact | A novice to teach, a revision-oriented response, and one novel transfer case |
| Reviewer | Understand what occurred without guessing from a score | Transcript, evidence items, source map, and an explicitly non-prescriptive next step |

## Four-screen information architecture

1. **Set the source** — a teacher enters a title, context, learning goal, and de-identified source packet, or opens the deterministic Greenwater demo.
2. **Approve the twin** — the teacher checks literal source anchors, concept relationships, uncertainty, and the simulated novice’s misconception before release.
3. **Teach it** — the student repairs the misconception in their own words. The twin shows only the simulated concept state, never a hidden learner score.
4. **Review evidence** — after a novel transfer case, the teacher sees a trace and decides whether to use the optional learning note.

The progress header makes the workflow legible. The visual hierarchy deliberately places teacher gates at the moment of release and at the moment of use, rather than hiding safeguards in a settings panel.

## Interaction rules

- The first question asks for a causal explanation from the approved packet.
- The twin gives a concise response about the simulated novice’s missing link; it does not write a polished answer for the student.
- A successful explanation unlocks a genuinely new transfer case. A weak answer stays in the current stage and gets a targeted revision prompt.
- The summary state appears only after transfer. It is labelled a learning trace, not a verdict.
- The fixture is visually labelled **OFFLINE FIXTURE**; the live path is labelled **GPT-5.6 LIVE**. Judges are never asked to confuse a scripted path with a live generation.

## State model

```text
draft source map
  → teacher approved
  → explanation in progress
  → transfer in progress
  → ready for teacher review
  → teacher reviewed locally
```

Each concept node has one visible state: `grounded`, `needs-connection`, or `needs-evidence`. That state belongs to the simulated novice’s usable model of the topic. It is not a psychometric profile of a student.

## Trust-by-design decisions

| Risk | Product response |
| --- | --- |
| A model invents evidence | Every setup quote must be an exact substring of the approved source packet. |
| A model drifts into a different concept map | Turn updates may reference only existing, non-duplicate node IDs. |
| A student begins before review | The API rejects a draft session; a teacher must approve the map first. |
| A model becomes an answer machine | Prompts request a missing relationship or revision, not a full student response. |
| A trace becomes a score | No score, grade, authorship, diagnosis, or integrity label exists in the domain model or UI. |
| Sensitive classroom data is used casually | The product asks for de-identified material and has no account or database in this MVP. |

## Acceptance criteria

- A judge can complete the Greenwater scenario without an API key.
- A teacher can see the original source, three literal evidence anchors, a causal chain, uncertainty, and one misconception before approving.
- A strong explanation visibly moves the session into transfer; a strong transfer produces a teacher-reviewable note.
- A draft or completed session cannot be advanced via the API.
- The page is understandable without an onboarding document: the labels explain what is simulated, what is live, and what requires human judgment.
