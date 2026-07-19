import type { ConceptNode, EvidenceItem, LearningSummary, SourceMap, TeachBackSession, Twin, TwinRequest } from "@/lib/types";

export const MAX_SOURCE_LENGTH = 12000;
export const MAX_RESPONSE_LENGTH = 3000;

const nodeStatuses = new Set<ConceptNode["status"]>(["grounded", "needs-connection", "needs-evidence"]);
const sessionStatuses = new Set<TeachBackSession["status"]>(["draft", "approved", "in-progress", "ready-for-review", "teacher-approved"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isConceptNode(value: unknown): value is ConceptNode {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.label === "string" && typeof value.explanation === "string" && typeof value.sourceAnchor === "string" && typeof value.status === "string" && nodeStatuses.has(value.status as ConceptNode["status"]);
}

function isEvidenceAnchor(value: unknown) {
  return isRecord(value) && typeof value.label === "string" && typeof value.quote === "string";
}

export function isSourceMap(value: unknown): value is SourceMap {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.subject === "string" &&
    typeof value.learningGoal === "string" &&
    Array.isArray(value.conceptNodes) &&
    value.conceptNodes.every(isConceptNode) &&
    isStringArray(value.causalChain) &&
    Array.isArray(value.evidenceAnchors) &&
    value.evidenceAnchors.every(isEvidenceAnchor) &&
    isStringArray(value.uncertainty)
  );
}

export function isTwin(value: unknown): value is Twin {
  if (!isRecord(value)) return false;
  return typeof value.name === "string" && typeof value.role === "string" && typeof value.misconception === "string" && typeof value.openingPrompt === "string" && typeof value.transferPrompt === "string";
}

export function isEvidenceItem(value: unknown): value is EvidenceItem {
  return isRecord(value) && typeof value.label === "string" && (value.status === "shown" || value.status === "not-yet-shown") && typeof value.note === "string";
}

export function isLearningSummary(value: unknown): value is LearningSummary {
  return isRecord(value) && typeof value.headline === "string" && isStringArray(value.demonstrated) && typeof value.nextStep === "string" && typeof value.teacherNote === "string";
}

export function validateCreateInput(input: { lessonText?: string; title?: string; learningGoal?: string }) {
  const lessonText = input.lessonText?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const learningGoal = input.learningGoal?.trim() ?? "";
  if (!lessonText) return "Add a teacher-approved source packet or load the included demo.";
  if (lessonText.length < 80) return "Use at least 80 characters so the twin has enough source material to stay grounded.";
  if (lessonText.length > MAX_SOURCE_LENGTH) return "Keep the source packet to 12,000 characters or fewer for this MVP.";
  if (!title) return "Add a short title for the source packet.";
  if (!learningGoal) return "Add one learning goal before building the twin.";
  if (title.length > 140 || learningGoal.length > 500) return "Keep the title and learning goal concise.";
  return null;
}

export function validateResponse(value: string) {
  const response = value.trim();
  if (!response) return "Ask the learner to write an explanation before sending it to the twin.";
  if (response.length > MAX_RESPONSE_LENGTH) return "Keep this explanation to 3,000 characters or fewer.";
  return null;
}

/**
 * Returns an error when a generated source map cannot be traced back to the
 * exact packet the teacher approved. This deliberately checks literal quotes:
 * a polished paraphrase is not acceptable evidence in TeachBack.
 */
export function validateSourceMapGrounding(sourceText: string, sourceMap: SourceMap) {
  if (!sourceText.trim() || sourceMap.evidenceAnchors.length < 2) return "The source map could not be verified against the approved packet.";
  const nodeIds = new Set<string>();
  for (const node of sourceMap.conceptNodes) {
    if (!node.id.trim() || nodeIds.has(node.id)) return "The source map could not be verified against the approved packet.";
    nodeIds.add(node.id);
  }
  for (const anchor of sourceMap.evidenceAnchors) {
    const quote = anchor.quote.trim();
    if (!quote || !sourceText.includes(quote)) return "The source map could not be verified against the approved packet.";
  }
  return null;
}

/** The model may change only existing concept-state nodes, and never invent a new one. */
export function validateNodeUpdates(sourceMap: SourceMap, updates: Array<{ id: string; status: ConceptNode["status"] }>) {
  const allowedIds = new Set(sourceMap.conceptNodes.map((node) => node.id));
  const usedIds = new Set<string>();
  for (const update of updates) {
    if (!allowedIds.has(update.id) || usedIds.has(update.id) || !nodeStatuses.has(update.status)) return "The twin update did not match the approved source map.";
    usedIds.add(update.id);
  }
  return null;
}

export function validateAdvanceSession(session: TeachBackSession) {
  if (session.stage === "complete" || session.status === "ready-for-review" || session.status === "teacher-approved") return "This learning trace is ready for teacher review and cannot accept another student response.";
  if (session.status !== "approved" && session.status !== "in-progress") return "A teacher must approve the source map and misconception before a student can teach the twin.";
  return validateSourceMapGrounding(session.sourceText, session.sourceMap);
}

export function isTeachBackSession(value: unknown): value is TeachBackSession {
  if (!isRecord(value) || !isSourceMap(value.sourceMap) || !isTwin(value.twin) || !Array.isArray(value.turns)) return false;
  const validTurn = (turn: unknown) => isRecord(turn) && (turn.stage === "explanation" || turn.stage === "transfer") && typeof turn.prompt === "string" && typeof turn.response === "string" && typeof turn.twinReply === "string" && Array.isArray(turn.evidence) && turn.evidence.every(isEvidenceItem) && typeof turn.coachNote === "string";
  return (
    typeof value.id === "string" &&
    typeof value.sourceText === "string" &&
    value.turns.every(validTurn) &&
    (value.stage === "explanation" || value.stage === "transfer" || value.stage === "complete") &&
    typeof value.status === "string" &&
    sessionStatuses.has(value.status as TeachBackSession["status"]) &&
    (value.summary === null || isLearningSummary(value.summary))
  );
}

export function isTwinRequest(value: unknown): value is TwinRequest {
  if (!isRecord(value)) return false;
  if (value.action === "create") return value.mode === "fixture" || value.mode === "live";
  return value.action === "advance" && (value.mode === "fixture" || value.mode === "live") && isTeachBackSession(value.session) && typeof value.response === "string";
}
