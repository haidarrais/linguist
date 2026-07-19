# TeachBack — a Misconception Twin for visible learning

## Decision

TeachBack is a student-facing, teacher-controlled learning loop for the AI era. It does **not** detect AI use, proctor students, assign grades, or make an academic-integrity judgment. Instead, it asks a more useful question: can a learner teach the causal thinking behind their work to a deliberately mistaken novice?

The product starts with a teacher-approved source packet and one learning goal. It creates a structured concept map and a clearly labelled simulated novice (“the Misconception Twin”). The student explains the idea; the twin updates its visible *simulated learning state*, attempts a novel transfer problem, and makes the exact missing connection visible. The teacher then reviews the evidence and chooses whether to use the suggested next step.

## Why this problem, now

Generative AI makes a finished artifact a weaker signal of a learner’s reasoning. UNESCO’s 2025 assessment guidance argues that assessment needs to attend to process, dialogue, and the learner’s own explanation rather than escalating a detection arms race. TeachBack makes that shift constructive: the interaction itself is a learning experience, not a surveillance event.

## Single demo story

**Teacher:** Ms. Rivera, Grade 10 Environmental Science

**Source packet:** a short field investigation on fertilizer runoff, algal blooms, dissolved oxygen, and fish stress.

**Learning goal:** Explain a causal mechanism using evidence while distinguishing a supported explanation from a claim of proof.

**Twin misconception:** “Algae are plants and plants make oxygen, so a lake with more algae should always have more oxygen.”

**Student win:** The student teaches that nutrient runoff can increase algae; when blooms die, decomposition consumes dissolved oxygen. The twin then tries a new lake scenario. If the explanation skips the causal link or overclaims causation, the state map identifies that precise connection and offers a small revision step.

## One end-to-end vertical slice

1. Teacher loads the included de-identified source packet or enters a short packet and learning goal.
2. The agent produces a source-grounded concept map, one calibrated misconception, and the first twin prompt.
3. Teacher approves the map before a student can begin.
4. Student teaches the twin in two typed turns: explanation, then transfer.
5. The app shows evidence found, unresolved connections, and a teacher-reviewed next step.

## Guardrails

- No student names, grades, accounts, uploads, or persistence in the MVP.
- The twin is explicitly a simulation; it does not claim to learn, remember, or assess a person.
- The agent works only from the teacher-provided source packet and surfaces uncertainty instead of inventing facts.
- No answer dumping: feedback names a missing relationship and asks for a revision, rather than writing the student’s response.
- Teacher approval gates both the source map and any summary used outside the interaction.
- The fixture is deterministic so the complete demo works without an API key; the live path uses GPT-5.6 structured outputs when configured.

## Deliberate cuts

No voice, browser monitoring, AI authorship detection, auto-grading, LMS integration, accounts, multi-subject analytics, or a generic chatbot. Those would dilute the learning loop and make the claim less credible.

## Hackathon proof points

- **Impact:** turns a fraught assessment problem into practice with explanation and transfer.
- **Technical implementation:** visible agent state from source map → misconception model → evidence update → transfer check → teacher review.
- **Design:** one understandable story rather than a control-panel demo.
- **Quality:** offline fixture, human approval, explicit privacy and safety boundaries, and testable API contracts.
