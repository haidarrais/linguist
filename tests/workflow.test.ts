import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_STRONG_EXPLANATION, DEMO_STRONG_TRANSFER, advanceFixtureSession, createFixtureSession } from "../lib/fixture";
import { activePrompt, activeStage, appStep, approveTeacherSummary, statusSummary } from "../lib/workflow";

test("holds the student at the source-map review until a teacher approves", () => {
  const session = createFixtureSession();
  assert.equal(appStep(null, false), "setup");
  assert.equal(appStep(session, false), "review");
  assert.equal(appStep(session, true), "teach");
  assert.equal(activeStage(session), "explanation");
  assert.match(activePrompt(session), /Teach me the causal chain/i);
});

test("keeps a weak explanation in the teach-back stage with a targeted revision", () => {
  const session = advanceFixtureSession(createFixtureSession(), "Nutrients made algae grow and algae make oxygen.");
  assert.equal(session.stage, "explanation");
  assert.equal(session.status, "in-progress");
  assert.equal(session.summary, null);
  assert.match(activePrompt(session), /what happens after a dense bloom dies/i);
  assert.equal(session.sourceMap.conceptNodes.find((node) => node.id === "decomposition")?.status, "needs-connection");
});

test("makes the mechanism visible, tests transfer, then reaches teacher review", () => {
  const afterExplanation = advanceFixtureSession(createFixtureSession(), DEMO_STRONG_EXPLANATION);
  assert.equal(afterExplanation.stage, "transfer");
  assert.equal(afterExplanation.status, "in-progress");
  assert.match(activePrompt(afterExplanation), /nearby pond/i);
  assert.equal(afterExplanation.sourceMap.conceptNodes.find((node) => node.id === "decomposition")?.status, "grounded");

  const complete = advanceFixtureSession(afterExplanation, DEMO_STRONG_TRANSFER);
  assert.equal(complete.stage, "complete");
  assert.equal(complete.status, "ready-for-review");
  assert.ok(complete.summary);
  assert.equal(appStep(complete, true), "summary");
  assert.equal(statusSummary(complete), "4 of 4 concepts grounded");
  assert.equal(approveTeacherSummary(complete).status, "teacher-approved");
});
