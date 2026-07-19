import type { ConceptNode, EvidenceItem, TeachBackSession } from "@/lib/types";

export const DEMO_SOURCE = `Greenwater Lake field brief

After heavy spring rain, a Grade 10 field team compared two arms of Greenwater Lake. The arm below crop fields had higher nitrate and phosphate readings, greener water, lower dissolved oxygen at dawn, and fish gathering near the surface. The protected arm had lower nutrient readings, clearer water, and higher dissolved oxygen at dawn.

Scientists explain that extra nutrients can speed algal growth. Living algae can make oxygen in sunlight. But when a dense algal bloom dies, bacteria decomposing the dead material use dissolved oxygen. Repeated nutrient inputs can therefore contribute to low oxygen, especially overnight or after a bloom dies. Fish may gather near the surface when dissolved oxygen is low.

The comparison supports a plausible explanation, but it does not prove runoff alone caused low oxygen. Water temperature, flow, and other differences between the two arms may also matter. Repeated sampling and better controls would strengthen a causal claim.`;

const baseNodes: ConceptNode[] = [
  {
    id: "nutrients",
    label: "Nutrients and algal growth",
    explanation: "Higher nitrate and phosphate readings can help explain greener water because extra nutrients can speed algal growth.",
    sourceAnchor: "Field brief, paragraph 2",
    status: "grounded",
  },
  {
    id: "decomposition",
    label: "The oxygen-consuming step",
    explanation: "A dense bloom has a different effect after it dies: bacteria decomposing dead material use dissolved oxygen.",
    sourceAnchor: "Field brief, paragraph 2",
    status: "needs-connection",
  },
  {
    id: "fish",
    label: "Low oxygen and fish behavior",
    explanation: "Low dissolved oxygen is a plausible reason fish gathered near the surface at dawn.",
    sourceAnchor: "Field brief, paragraphs 1–2",
    status: "needs-evidence",
  },
  {
    id: "causation",
    label: "Explanation is not proof",
    explanation: "The two-arm comparison supports a plausible mechanism, but it cannot prove runoff alone caused lower oxygen.",
    sourceAnchor: "Field brief, paragraph 3",
    status: "needs-evidence",
  },
];

export const DEMO_STRONG_EXPLANATION = "The higher nutrient readings can help algae grow, but living algae and a dying bloom are not the same moment. After a dense bloom dies, bacteria decomposing it use dissolved oxygen. That explains why the green arm could have lower oxygen at dawn and why fish might gather near the surface. The comparison supports that explanation, but it does not prove runoff alone caused it because temperature and flow could also differ.";

export const DEMO_STRONG_TRANSFER = "The warm, clear pond could still have lower dissolved oxygen at dawn, and warm water may be one possible factor. But because there is no nutrient-runoff measurement and we do not know about flow or repeated samples, we cannot conclude fertilizer runoff caused the low oxygen. We would need more evidence before making that causal claim.";

export function createFixtureSession(): TeachBackSession {
  return {
    id: "greenwater-fixture",
    sourceText: DEMO_SOURCE,
    sourceMap: {
      title: "Greenwater Lake field brief",
      subject: "Grade 10 Environmental Science",
      learningGoal: "Explain a causal mechanism with source evidence, while separating a supported explanation from a claim of proof.",
      conceptNodes: baseNodes.map((node) => ({ ...node })),
      causalChain: [
        "Nutrient runoff can increase available nitrate and phosphate.",
        "Extra nutrients can speed algal growth.",
        "When a dense bloom dies, bacteria decomposing it use dissolved oxygen.",
        "Lower dissolved oxygen can contribute to fish gathering near the surface.",
      ],
      evidenceAnchors: [
        { label: "Field observation", quote: "The arm below crop fields had higher nitrate and phosphate readings, greener water, lower dissolved oxygen at dawn, and fish gathering near the surface." },
        { label: "Mechanism", quote: "But when a dense algal bloom dies, bacteria decomposing the dead material use dissolved oxygen." },
        { label: "Boundary", quote: "The comparison supports a plausible explanation, but it does not prove runoff alone caused low oxygen." },
      ],
      uncertainty: ["The field brief does not isolate water temperature, flow, or every other difference between the two lake arms."],
    },
    twin: {
      name: "Nova",
      role: "Simulated novice",
      misconception: "“Algae are plants and plants make oxygen, so greener water should always mean more dissolved oxygen.”",
      openingPrompt: "I can see that the crop-field arm was greener and had less oxygen at dawn. But algae make oxygen in sunlight, so I am stuck: why could the greener arm still have less oxygen and fish near the surface? Teach me the causal chain using the field brief.",
      transferPrompt: "Try a new case with me: a nearby pond has clear water, no nutrient-runoff measurement, warm water, and lower dissolved oxygen at dawn. What could we reasonably say? What can we not conclude yet?",
    },
    turns: [],
    stage: "explanation",
    status: "draft",
    summary: null,
  };
}

function includesAny(value: string, terms: string[]) {
  const lower = value.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function updateNodes(session: TeachBackSession, ids: string[], status: ConceptNode["status"]) {
  return session.sourceMap.conceptNodes.map((node) => (ids.includes(node.id) ? { ...node, status } : node));
}

function explanationEvidence(strong: boolean): EvidenceItem[] {
  return [
    {
      label: "Different roles over time",
      status: strong ? "shown" : "not-yet-shown",
      note: strong ? "The explanation distinguishes living algae from a dying bloom." : "Name the change that happens after a dense bloom dies.",
    },
    {
      label: "Oxygen-consuming mechanism",
      status: strong ? "shown" : "not-yet-shown",
      note: strong ? "The explanation connects decomposition by bacteria to dissolved oxygen falling." : "Connect decomposition, bacteria, and dissolved oxygen explicitly.",
    },
    {
      label: "Evidence boundary",
      status: strong ? "shown" : "not-yet-shown",
      note: strong ? "The explanation treats the field comparison as support, not proof." : "State one reason the comparison cannot prove runoff was the only cause.",
    },
  ];
}

function transferEvidence(strong: boolean): EvidenceItem[] {
  return [
    {
      label: "Claim stays inside the evidence",
      status: strong ? "shown" : "not-yet-shown",
      note: strong ? "The response offers a possible factor without asserting a cause." : "Separate a possible explanation from a proven cause.",
    },
    {
      label: "New evidence needed",
      status: strong ? "shown" : "not-yet-shown",
      note: strong ? "The response identifies missing measurements or controls." : "Name evidence that would strengthen a causal claim in this new pond.",
    },
  ];
}

export function advanceFixtureSession(session: TeachBackSession, response: string): TeachBackSession {
  const current = structuredClone(session) as TeachBackSession;
  const nextStage = current.stage;

  if (nextStage === "explanation") {
    const strong = includesAny(response, ["decompos", "bacteria"]) && includesAny(response, ["oxygen"]) && includesAny(response, ["bloom", "algae"]);
    const bounded = includesAny(response, ["not prove", "cannot prove", "does not prove", "temperature", "flow", "other difference"]);
    const complete = strong && bounded;
    current.turns.push({
      stage: "explanation",
      prompt: current.twin.openingPrompt,
      response,
      twinReply: complete
        ? "That changes my picture. I was treating living algae and a dying bloom as the same moment. Your explanation gave me the missing link: after a dense bloom dies, bacteria use dissolved oxygen. I also hear that the lake comparison supports this mechanism without proving runoff was the only cause. Let me try a new case."
        : "I hear that nutrients and algae matter, but I am still missing the step that makes dissolved oxygen fall. Please teach me what happens after a dense bloom dies, and tell me one reason the comparison does not prove runoff was the only cause.",
      evidence: explanationEvidence(complete),
      coachNote: complete
        ? "You made the mechanism and its evidence boundary visible. Now test whether the same reasoning transfers to a new situation."
        : "Revision prompt: add the post-bloom decomposition step, then distinguish a plausible explanation from a claim of proof.",
    });
    current.sourceMap.conceptNodes = updateNodes(current, ["decomposition"], complete ? "grounded" : "needs-connection");
    current.sourceMap.conceptNodes = updateNodes(current, ["fish", "causation"], complete ? "grounded" : "needs-evidence");
    current.stage = complete ? "transfer" : "explanation";
    current.status = "in-progress";
    return current;
  }

  const strong = includesAny(response, ["cannot conclude", "cannot say", "not conclude", "not enough", "need more", "more evidence"]) && includesAny(response, ["warm", "temperature", "flow", "measurement", "sample"]);
  current.turns.push({
    stage: "transfer",
    prompt: current.twin.transferPrompt,
    response,
    twinReply: strong
      ? "I can now separate what the pond observation suggests from what it proves. Warm water may be relevant, but the field brief does not let me claim nutrient runoff caused this pond’s oxygen level without measurements and controls. Thank you for giving me a rule I can use in a new case."
      : "I still need help separating a possible explanation from a causal conclusion. What observation or control would we need before saying nutrient runoff caused low oxygen in this new pond?",
    evidence: transferEvidence(strong),
    coachNote: strong
      ? "Transfer succeeded: the reasoning stayed inside the available evidence."
      : "Revision prompt: name one possible factor, then name the evidence or control needed before claiming cause.",
  });
  current.sourceMap.conceptNodes = updateNodes(current, ["causation"], strong ? "grounded" : "needs-evidence");
  current.stage = strong ? "complete" : "transfer";
  current.status = strong ? "ready-for-review" : "in-progress";
  current.summary = strong
    ? {
      headline: "The learner made the mechanism—and its boundary—visible.",
      demonstrated: [
        "Explained why a green lake can still have low dissolved oxygen at dawn.",
        "Connected decomposition by bacteria to oxygen use.",
        "Applied the evidence boundary to a new pond without overclaiming causation.",
      ],
      nextStep: "Ask the student to revise one sentence in their field-brief explanation so the post-bloom decomposition step is explicit.",
      teacherNote: "Review the transcript and decide whether this is enough evidence for your instructional purpose. This is not a grade or an integrity finding.",
    }
    : null;
  return current;
}
