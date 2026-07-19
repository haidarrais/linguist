import type { ConceptNode, EvidenceItem, LearningSummary, TeachBackSession } from "@/lib/types";
import { isEvidenceItem, isLearningSummary, isSourceMap, isTwin, validateNodeUpdates, validateSourceMapGrounding } from "@/lib/validation";

const createSchema = {
  type: "object",
  additionalProperties: false,
  required: ["sourceMap", "twin"],
  properties: {
    sourceMap: {
      type: "object",
      additionalProperties: false,
      required: ["title", "subject", "learningGoal", "conceptNodes", "causalChain", "evidenceAnchors", "uncertainty"],
      properties: {
        title: { type: "string" },
        subject: { type: "string" },
        learningGoal: { type: "string" },
        conceptNodes: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "label", "explanation", "sourceAnchor", "status"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              explanation: { type: "string" },
              sourceAnchor: { type: "string" },
              status: { type: "string", enum: ["grounded", "needs-connection", "needs-evidence"] },
            },
          },
        },
        causalChain: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        evidenceAnchors: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "quote"],
            properties: { label: { type: "string" }, quote: { type: "string" } },
          },
        },
        uncertainty: { type: "array", maxItems: 3, items: { type: "string" } },
      },
    },
    twin: {
      type: "object",
      additionalProperties: false,
      required: ["name", "role", "misconception", "openingPrompt", "transferPrompt"],
      properties: {
        name: { type: "string" },
        role: { type: "string" },
        misconception: { type: "string" },
        openingPrompt: { type: "string" },
        transferPrompt: { type: "string" },
      },
    },
  },
} as const;

const advanceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["twinReply", "evidence", "coachNote", "updatedNodes", "complete", "summary"],
  properties: {
    twinReply: { type: "string" },
    evidence: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "status", "note"],
        properties: {
          label: { type: "string" },
          status: { type: "string", enum: ["shown", "not-yet-shown"] },
          note: { type: "string" },
        },
      },
    },
    coachNote: { type: "string" },
    updatedNodes: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "status"],
        properties: {
          id: { type: "string" },
          status: { type: "string", enum: ["grounded", "needs-connection", "needs-evidence"] },
        },
      },
    },
    complete: { type: "boolean" },
    summary: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["headline", "demonstrated", "nextStep", "teacherNote"],
          properties: {
            headline: { type: "string" },
            demonstrated: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
            nextStep: { type: "string" },
            teacherNote: { type: "string" },
          },
        },
      ],
    },
  },
} as const;

function outputText(data: Record<string, unknown>) {
  if (typeof data.output_text === "string") return data.output_text;
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") return (part as { text: string }).text;
    }
  }
  return null;
}

async function structuredResponse(name: string, schema: object, input: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-5.6",
      store: false,
      reasoning: { effort: "medium" },
      input,
      text: { format: { type: "json_schema", name, strict: true, schema } },
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OPENAI_${response.status}:${detail.slice(0, 240)}`);
  }
  const text = outputText((await response.json()) as Record<string, unknown>);
  if (!text) throw new Error("INVALID_OUTPUT");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("INVALID_OUTPUT");
  }
}

export async function createLiveSession(input: { lessonText: string; title: string; subject: string; learningGoal: string }): Promise<TeachBackSession> {
  const result = await structuredResponse("teachback_setup", createSchema, `You are TeachBack, a careful K–12 learning-design assistant. Build a teacher-reviewable, source-grounded Misconception Twin from the approved packet below.

The student will teach the twin; this is not a quiz, grade, cheating detector, or claim about a model literally learning. The twin must be a simulated novice with one plausible, bounded misconception. It should solicit explanation, not reveal the answer. Use only the source packet. Quote short excerpts exactly in evidenceAnchors. If the packet does not support a detail, list that limitation in uncertainty instead of inventing facts.

Return 3–5 concept nodes. Each node must be a precise relationship that can become visible in a student explanation. Make a 3–5 step causal or reasoning chain. Give the twin one opening question and one genuinely new transfer case; neither may contain the solution.

Teacher title: ${input.title}
Subject/context: ${input.subject}
Learning goal: ${input.learningGoal}

APPROVED SOURCE PACKET:
---
${input.lessonText}
---`);
  if (!result || typeof result !== "object") throw new Error("INVALID_OUTPUT");
  const parsed = result as { sourceMap?: unknown; twin?: unknown };
  if (!isSourceMap(parsed.sourceMap) || !isTwin(parsed.twin)) throw new Error("INVALID_OUTPUT");
  if (validateSourceMapGrounding(input.lessonText, parsed.sourceMap)) throw new Error("INVALID_OUTPUT");
  return {
    id: crypto.randomUUID(),
    sourceText: input.lessonText,
    sourceMap: parsed.sourceMap,
    twin: parsed.twin,
    turns: [],
    stage: "explanation",
    status: "draft",
    summary: null,
  };
}

type AdvanceOutput = {
  twinReply: string;
  evidence: EvidenceItem[];
  coachNote: string;
  updatedNodes: Array<{ id: string; status: ConceptNode["status"] }>;
  complete: boolean;
  summary: LearningSummary | null;
};

function isAdvanceOutput(value: unknown): value is AdvanceOutput {
  if (!value || typeof value !== "object") return false;
  const output = value as Partial<AdvanceOutput>;
  const validUpdate = (update: unknown): update is { id: string; status: ConceptNode["status"] } => !!update && typeof update === "object" && typeof (update as { id?: unknown }).id === "string" && ["grounded", "needs-connection", "needs-evidence"].includes((update as { status?: unknown }).status as string);
  return typeof output.twinReply === "string" && Array.isArray(output.evidence) && output.evidence.every(isEvidenceItem) && typeof output.coachNote === "string" && Array.isArray(output.updatedNodes) && output.updatedNodes.every(validUpdate) && typeof output.complete === "boolean" && (output.summary === null || isLearningSummary(output.summary));
}

export async function advanceLiveSession(session: TeachBackSession, response: string): Promise<TeachBackSession> {
  if (session.stage === "complete") throw new Error("INVALID_SESSION");
  const stage = session.stage;
  const activePrompt = stage === "explanation" ? session.twin.openingPrompt : session.twin.transferPrompt;
  const result = await structuredResponse("teachback_turn", advanceSchema, `You are the internal evaluator for TeachBack, a teacher-approved learning interaction. Evaluate only the student response against the approved source map. Never infer AI use, cheating, ability, identity, or a grade. Never make a diagnosis. Keep the simulated twin honest: it should describe what idea it can now use or what link it still lacks, then ask for a revision or move to the transfer case. Do not write a complete student answer.

Current stage: ${stage}
Prompt shown to student: ${activePrompt}
Student response: ${response}

SOURCE MAP:
${JSON.stringify(session.sourceMap)}

TWIN:
${JSON.stringify(session.twin)}

PREVIOUS TURNS:
${JSON.stringify(session.turns)}

For evidence, make 2–4 concise items tied to source-map concepts. Keep node ids exactly as supplied. For an explanation turn, complete may be true only if the key mechanism and an evidence boundary are both made visible; summary must be null. For a transfer turn, complete may be true only when the learner separates a possible explanation from what the new evidence proves. When transfer is complete, return a supportive teacher-review summary with a small next step; otherwise summary is null.`);
  if (!isAdvanceOutput(result)) throw new Error("INVALID_OUTPUT");
  if (validateNodeUpdates(session.sourceMap, result.updatedNodes)) throw new Error("INVALID_OUTPUT");
  if ((stage === "explanation" && result.summary !== null) || (stage === "transfer" && result.complete !== (result.summary !== null))) throw new Error("INVALID_OUTPUT");
  const current = structuredClone(session) as TeachBackSession;
  current.turns.push({ stage, prompt: activePrompt, response, twinReply: result.twinReply, evidence: result.evidence, coachNote: result.coachNote });
  current.sourceMap.conceptNodes = current.sourceMap.conceptNodes.map((node) => {
    const update = result.updatedNodes.find((item) => item.id === node.id);
    return update ? { ...node, status: update.status } : node;
  });
  current.stage = result.complete ? (stage === "explanation" ? "transfer" : "complete") : stage;
  current.status = result.complete && stage === "transfer" ? "ready-for-review" : "in-progress";
  current.summary = result.complete && stage === "transfer" ? result.summary : null;
  return current;
}
