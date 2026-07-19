# TeachBack — submission kit

## One-line description

TeachBack gives every student a learner they must teach: a teacher-approved Misconception Twin that makes explanation and transfer visible without AI detection or automated grading.

## Short Devpost description

Finished work is becoming a weaker signal of reasoning in the AI era. TeachBack is a constructive alternative: a teacher turns a source packet into a reviewable concept map and a simulated novice with one plausible misconception. The student teaches the novice, applies the idea to a new case, and leaves a teacher-reviewable learning trace. GPT-5.6 powers the structured setup and state updates; literal source quotes, teacher gates, and a deterministic offline demo keep the interaction grounded and testable.

## Long Devpost description

### The problem

When AI can help create a polished final artifact, educators need more opportunities to see the thinking behind it. Detection alone is a poor answer: it can create adversarial classrooms and does not teach the underlying idea. TeachBack shifts the interaction from surveillance to learning.

### The solution

TeachBack gives the student a deliberately mistaken, clearly labelled simulated novice named Nova. A teacher provides a short, de-identified source packet and learning goal. GPT-5.6 creates a source-grounded concept map, short literal evidence anchors, one calibrated misconception, and two prompts. The teacher reviews all of it before a student can begin.

The student explains the idea to Nova. Rather than issuing a score, Nova shows what relationships its simulated state can now use and identifies a missing causal link or evidence boundary. Nova then tries a genuinely new case. The teacher reviews the resulting explanation-and-transfer trace and decides what to do next.

Our Greenwater Lake demo makes this concrete. The student must distinguish living algae from a dying algal bloom: bacteria decomposing a dead bloom consume dissolved oxygen. The student must also state that an observed lake comparison supports a mechanism but does not prove runoff alone caused the result. A new pond scenario tests whether that evidence boundary transfers.

### Technical implementation

The app is a Next.js/TypeScript prototype using the OpenAI Responses API with `gpt-5.6`, strict JSON schemas, `reasoning.effort: "medium"`, and `store: false`.

GPT-5.6 has two distinct jobs:

1. **Setup:** create a 3–5 node source map, short verbatim evidence anchors, a bounded misconception, and two student prompts.
2. **State update:** evaluate a student’s explanation only against that approved map, update existing concept-node states, and create a teacher-review draft only after the transfer case.

The implementation validates every evidence quote against the exact source text, rejects updates to unknown or duplicate node IDs, and rejects unapproved or completed sessions at the API boundary. A labelled deterministic fixture makes the entire demo runnable without an API key.

### Why it matters

TeachBack does not claim to measure a student’s intelligence, detect AI use, grade work, or make a diagnosis. It creates a small, repeatable learning interaction where explanation and transfer can be visible, while the teacher keeps judgment and context.

## Video script (about 2:45)

| Time | Visual | Voiceover |
| --- | --- | --- |
| 0:00–0:18 | TeachBack landing screen | “When AI can help produce a polished answer, the answer alone is weaker evidence of reasoning. TeachBack is a constructive alternative to AI detection.” |
| 0:18–0:40 | Open Greenwater worked demo | “A teacher provides a source packet and learning goal. GPT-5.6 turns it into a concept map and a simulated novice with one calibrated misconception.” |
| 0:40–1:02 | Source-review screen | “Before any student interaction, the teacher sees literal source anchors, the causal chain, the uncertainty, and Nova’s misconception. The teacher must approve.” |
| 1:02–1:35 | Student explanation and state map | “The student teaches Nova why a greener lake can still have less oxygen at dawn. Nova’s visible simulated state moves only when the explanation includes the post-bloom decomposition mechanism and the evidence boundary.” |
| 1:35–1:58 | Transfer case | “Nova now tries a new pond. The student must separate a possible factor from what the new evidence can actually prove.” |
| 1:58–2:20 | Teacher review screen | “The result is a learning trace, not a grade or an integrity finding. The teacher decides whether and how to use it.” |
| 2:20–2:42 | Live builder or code/README | “GPT-5.6 provides structured setup and update calls. We validate every evidence quote literally and refuse unknown state updates or unapproved turns. The included offline fixture makes this exact flow testable.” |
| 2:42–2:50 | Landing / tagline | “Give every student a learner they must teach.” |

## How this answers the rubric

| Criterion | Evidence judges can see |
| --- | --- |
| Technical implementation | Two structured GPT-5.6 reasoning roles, strict schemas, source quote verification, state-machine API gates, tests, and an offline fixture. |
| Design | One four-step workflow, clearly labelled live/fixture states, approachable student interaction, and teacher approval at both consequential moments. |
| Impact | A student-centered way to practice causal explanation and evidence boundaries in an AI-saturated assessment environment. |
| Quality of idea | The simulated novice makes the model’s state visible without pretending to infer the student’s hidden state. Transfer makes the interaction more than a scripted explanation. |

## Final submission checklist

- Verify the current official rules, deadline, category, public-repository/demo requirements, video limit, and feedback-session requirement.
- Add the public video URL and public code/demo URL.
- Add the exact required `/feedback` session ID to the submission and `README.md`.
- State clearly in the video which moment is GPT-5.6 LIVE and which is the labelled deterministic fixture.
- Do not claim detection, grading, provenance, or a real learner model.
