export type SessionMode = "fixture" | "live";

export type NodeStatus = "grounded" | "needs-connection" | "needs-evidence";

export type ConceptNode = {
  id: string;
  label: string;
  explanation: string;
  sourceAnchor: string;
  status: NodeStatus;
};

export type EvidenceAnchor = {
  label: string;
  quote: string;
};

export type SourceMap = {
  title: string;
  subject: string;
  learningGoal: string;
  conceptNodes: ConceptNode[];
  causalChain: string[];
  evidenceAnchors: EvidenceAnchor[];
  uncertainty: string[];
};

export type Twin = {
  name: string;
  role: string;
  misconception: string;
  openingPrompt: string;
  transferPrompt: string;
};

export type EvidenceItem = {
  label: string;
  status: "shown" | "not-yet-shown";
  note: string;
};

export type TeachBackTurn = {
  stage: "explanation" | "transfer";
  prompt: string;
  response: string;
  twinReply: string;
  evidence: EvidenceItem[];
  coachNote: string;
};

export type LearningSummary = {
  headline: string;
  demonstrated: string[];
  nextStep: string;
  teacherNote: string;
};

export type TeachBackSession = {
  id: string;
  sourceText: string;
  sourceMap: SourceMap;
  twin: Twin;
  turns: TeachBackTurn[];
  stage: "explanation" | "transfer" | "complete";
  status: "draft" | "approved" | "in-progress" | "ready-for-review" | "teacher-approved";
  summary: LearningSummary | null;
};

export type CreateSessionResponse = {
  mode: SessionMode;
  session: TeachBackSession;
};

export type AdvanceSessionResponse = {
  mode: SessionMode;
  session: TeachBackSession;
};

export type CreateSessionRequest = {
  action: "create";
  mode: SessionMode;
  lessonText?: string;
  title?: string;
  subject?: string;
  learningGoal?: string;
};

export type AdvanceSessionRequest = {
  action: "advance";
  mode: SessionMode;
  session: TeachBackSession;
  response: string;
};

export type TwinRequest = CreateSessionRequest | AdvanceSessionRequest;
