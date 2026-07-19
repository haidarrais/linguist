import assert from "node:assert/strict";
import test from "node:test";
import { createFixtureSession } from "../lib/fixture";
import { MAX_RESPONSE_LENGTH, MAX_SOURCE_LENGTH, isTeachBackSession, validateAdvanceSession, validateCreateInput, validateNodeUpdates, validateResponse, validateSourceMapGrounding } from "../lib/validation";

test("requires a bounded, teacher-ready live source packet", () => {
  assert.equal(validateCreateInput({}), "Add a teacher-approved source packet or load the included demo.");
  assert.equal(validateCreateInput({ lessonText: "Too short", title: "A", learningGoal: "B" }), "Use at least 80 characters so the twin has enough source material to stay grounded.");
  assert.equal(validateCreateInput({ lessonText: "x".repeat(MAX_SOURCE_LENGTH + 1), title: "A", learningGoal: "B" }), "Keep the source packet to 12,000 characters or fewer for this MVP.");
  assert.equal(validateCreateInput({ lessonText: "x".repeat(100), title: "", learningGoal: "B" }), "Add a short title for the source packet.");
  assert.equal(validateCreateInput({ lessonText: "x".repeat(100), title: "A", learningGoal: "" }), "Add one learning goal before building the twin.");
  assert.equal(validateCreateInput({ lessonText: "x".repeat(100), title: "A", learningGoal: "B" }), null);
});

test("bounds student responses and recognizes the local session contract", () => {
  assert.equal(validateResponse(""), "Ask the learner to write an explanation before sending it to the twin.");
  assert.equal(validateResponse("x".repeat(MAX_RESPONSE_LENGTH + 1)), "Keep this explanation to 3,000 characters or fewer.");
  assert.equal(validateResponse("I can explain the causal relationship."), null);
  assert.equal(isTeachBackSession(createFixtureSession()), true);
  assert.equal(isTeachBackSession({}), false);
});

test("requires literal source quotes and permits updates only to approved concept nodes", () => {
  const session = createFixtureSession();
  assert.equal(validateSourceMapGrounding(session.sourceText, session.sourceMap), null);
  assert.equal(validateNodeUpdates(session.sourceMap, [{ id: "decomposition", status: "grounded" }]), null);
  assert.match(validateNodeUpdates(session.sourceMap, [{ id: "invented-node", status: "grounded" }]) ?? "", /did not match/i);
  assert.match(validateNodeUpdates(session.sourceMap, [{ id: "decomposition", status: "grounded" }, { id: "decomposition", status: "needs-evidence" }]) ?? "", /did not match/i);

  const tampered = createFixtureSession();
  tampered.status = "approved";
  tampered.sourceMap.evidenceAnchors[0].quote = "A polished paraphrase that never appeared in the packet.";
  assert.match(validateSourceMapGrounding(tampered.sourceText, tampered.sourceMap) ?? "", /could not be verified/i);
  assert.match(validateAdvanceSession(tampered) ?? "", /could not be verified/i);
});
