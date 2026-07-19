# TeachBack — why this idea won the restart

## The current education problem

When generative AI can help produce a convincing finished artifact, educators need better ways to invite explanation and transfer without turning school into a surveillance system. The useful question is not “Can we catch AI?” It is “Can a learner make the causal model behind their work visible, and can a teacher respond to that evidence?”

TeachBack turns that question into a short classroom activity. A student teaches a novice that begins with one plausible misconception, then applies the repaired idea to a new case. The activity builds understanding even when no assessment decision follows.

## Alternatives considered

| Direction | Why it was not selected as the primary entry |
| --- | --- |
| AI-use detection | High false-positive and rights risk; frames the student as a suspect rather than a learner. |
| Oral-defense / viva tool | Strong provenance signal but feels punitive, familiar, and hard to make inclusive in a hackathon MVP. |
| Generic AI tutor | Helpful but crowded; the agentic mechanism is hard to distinguish from an ordinary chat interface. |
| Multilingual lesson adapter | Valuable and feasible, but the core interaction reads as content transformation rather than a new learning loop. |
| Evidence-first lesson adaptation | Safe and teacher-friendly, but less memorable in a three-minute demo. |
| **Misconception Twin / TeachBack** | A visible, stateful, source-grounded loop: packet → misconception → explanation → transfer → teacher review. |

## Why TeachBack has a competitive ceiling

- **Impact:** It offers a constructive response to a timely assessment problem and keeps the teacher in charge.
- **Technical implementation:** GPT-5.6 does two constrained reasoning tasks—create the source map/twin, then update a known state through explanation and transfer—rather than merely producing prose.
- **Design:** The entire product tells one memorable story: “Give every student a learner they must teach.”
- **Originality:** The visible state belongs to a simulated novice, which avoids pretending to measure an opaque learner model.

## The smallest credible proof

The Greenwater Lake scenario was chosen because it requires both mechanism and epistemic restraint:

1. Nutrients can speed algal growth.
2. A living bloom and a dying bloom are different moments.
3. Bacteria decomposing a dead bloom consume dissolved oxygen.
4. The observed lake comparison supports that mechanism but does not prove runoff alone caused the low oxygen.

A student who merely repeats “algae make oxygen” cannot advance Nova’s state. A student who explains the post-bloom decomposition step and the limit of the evidence can. The transfer pond then tests whether that rule travels to a new case.

## Non-negotiables

- No authorship detection, grading, proctoring, diagnosis, or claims about a student’s ability.
- No model-generated source quote can reach the review screen unless it occurs verbatim in the source.
- A teacher must approve the source map before the route accepts a student response.
- A deterministic, labelled fixture must remain available even if the live API is unavailable.
- One polished vertical slice beats multiple half-built subject areas or integrations.
