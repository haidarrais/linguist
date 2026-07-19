# TeachBack — top-30 execution plan

This plan optimizes for a reviewable, memorable, technically credible Education submission. It deliberately resists feature expansion: a perfect two-turn loop is more valuable than a dashboard full of incomplete AI features.

## Phase 1 — establish the winning vertical slice ✅

1. Choose the problem: constructive learning evidence rather than AI detection.
2. Build the Greenwater Lake source packet and a single, plausible misconception.
3. Implement source map → teacher approval → explanation → transfer → teacher review.
4. Add a deterministic fixture so the full demo works with no credentials.
5. Connect the live builder to structured GPT-5.6 Responses API calls.

## Phase 2 — make the demo trustworthy ✅

1. Validate every displayed evidence quote literally against the teacher packet.
2. Reject model updates that introduce unknown or duplicate concept-node IDs.
3. Reject student turns until the source map is teacher approved.
4. Reject further turns once a trace is ready for review.
5. Run the complete click path and add tests for the route and state machine.

## Phase 3 — submission proof (next, highest leverage)

1. **Record a live setup once.** Use the Greenwater packet and show the GPT-5.6 LIVE badge, source map, literal quotes, and misconception. Keep this short; it proves the live capability.
2. **Record the deterministic walkthrough.** Use the labelled fixture for the teacher approval, worked explanation, transfer, and review. This keeps the key 90 seconds reliable.
3. **Narrate the distinction.** Say the fixture is a deterministic demo and the live path uses GPT-5.6. Never blur the two.
4. **Prepare Devpost copy.** Use `hackathon.md` for a short description, long description, video beats, and judging proof.
5. **Add the feedback-session ID.** Put the exact required `/feedback` ID in the Devpost submission and README before final submission.

## Phase 4 — final quality gate

| Check | Pass condition |
| --- | --- |
| Judge setup | `npm install`, `npm run dev`, then **Open the worked demo** completes without an API key. |
| Live capability | One successful de-identified packet produces a reviewable source map with literal quotes. |
| Narrative | The video answers: what problem, what is simulated, what GPT-5.6 does, why transfer matters, and where teacher judgment stays. |
| Technical proof | `npm test`, `npm run lint`, and `npm run build` pass. |
| Trust | No copy claims detection, grading, AI authorship, or a model literally learning. |
| Submission | Public repo/demo instructions, video, README Codex contribution, and required feedback-session ID are present. |

## Features to refuse before deadline

- accounts, database, LMS integration, analytics, multi-subject dashboards;
- voice recording, browser monitoring, plagiarism signals, or AI-use scoring;
- auto-grades, suggested grades, or learner profiles;
- more than one polished demo scenario.

If an addition does not strengthen the source → teach-back → transfer → teacher-review story in a three-minute video, it should not be built before submission.
