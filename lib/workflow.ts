import type { NodeStatus, TeachBackSession } from "@/lib/types";

export type AppStep = "setup" | "review" | "teach" | "summary";

export function appStep(session: TeachBackSession | null, teacherApproved: boolean): AppStep {
  if (!session) return "setup";
  if (!teacherApproved) return "review";
  if (session.status === "ready-for-review" || session.status === "teacher-approved") return "summary";
  return "teach";
}

export function activePrompt(session: TeachBackSession) {
  const lastTurn = session.turns.at(-1);
  if (lastTurn?.stage === session.stage) return lastTurn.twinReply;
  return session.stage === "explanation" ? session.twin.openingPrompt : session.twin.transferPrompt;
}

export function activeStage(session: TeachBackSession) {
  return session.stage;
}

export function statusLabel(status: NodeStatus) {
  if (status === "grounded") return "Grounded";
  if (status === "needs-connection") return "Connect";
  return "Evidence check";
}

export function statusSummary(session: TeachBackSession) {
  const grounded = session.sourceMap.conceptNodes.filter((node) => node.status === "grounded").length;
  return `${grounded} of ${session.sourceMap.conceptNodes.length} concepts grounded`;
}

export function approveTeacherSummary(session: TeachBackSession): TeachBackSession {
  return { ...session, status: "teacher-approved" };
}
