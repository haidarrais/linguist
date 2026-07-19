import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/twin/route";
import { DEMO_STRONG_EXPLANATION, DEMO_STRONG_TRANSFER } from "../lib/fixture";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/twin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

test("creates a labeled deterministic fixture without any live model request", async () => {
  const response = await POST(jsonRequest({ action: "create", mode: "fixture" }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.mode, "fixture");
  assert.equal(body.session.id, "greenwater-fixture");
  assert.equal(body.session.stage, "explanation");
  assert.match(body.session.twin.misconception, /greener water/i);
});

test("advances only through the fixture’s safe, reviewable learning loop", async () => {
  const created = await POST(jsonRequest({ action: "create", mode: "fixture" }));
  const first = await created.json();
  const approvedSession = { ...first.session, status: "approved" };
  const explanation = await POST(jsonRequest({ action: "advance", mode: "fixture", session: approvedSession, response: DEMO_STRONG_EXPLANATION }));
  assert.equal(explanation.status, 200);
  const afterExplanation = await explanation.json();
  assert.equal(afterExplanation.session.stage, "transfer");

  const transfer = await POST(jsonRequest({ action: "advance", mode: "fixture", session: afterExplanation.session, response: DEMO_STRONG_TRANSFER }));
  assert.equal(transfer.status, 200);
  const complete = await transfer.json();
  assert.equal(complete.session.status, "ready-for-review");
  assert.match(complete.session.summary.teacherNote, /not a grade/i);
});

test("rejects malformed requests and validates live input before trying the model", async () => {
  const malformed = await POST(jsonRequest({ action: "nope" }));
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: "Send a valid TeachBack request.", code: "invalid_request" });

  const missingLiveInput = await POST(jsonRequest({ action: "create", mode: "live" }));
  assert.equal(missingLiveInput.status, 400);
  assert.deepEqual(await missingLiveInput.json(), { error: "Add a teacher-approved source packet or load the included demo.", code: "invalid_input" });
});

test("requires teacher approval and a source-grounded session before accepting a student turn", async () => {
  const created = await POST(jsonRequest({ action: "create", mode: "fixture" }));
  const first = await created.json();
  const blocked = await POST(jsonRequest({ action: "advance", mode: "fixture", session: first.session, response: DEMO_STRONG_EXPLANATION }));
  assert.equal(blocked.status, 403);
  assert.deepEqual(await blocked.json(), {
    error: "A teacher must approve the source map and misconception before a student can teach the twin.",
    code: "teacher_approval_required",
  });

  const tamperedSession = structuredClone(first.session);
  tamperedSession.status = "approved";
  tamperedSession.sourceMap.evidenceAnchors[0].quote = "An unsupported, made-up source quotation.";
  const tampered = await POST(jsonRequest({ action: "advance", mode: "fixture", session: tamperedSession, response: DEMO_STRONG_EXPLANATION }));
  assert.equal(tampered.status, 409);
  assert.deepEqual(await tampered.json(), {
    error: "The source map could not be verified against the approved packet.",
    code: "invalid_session",
  });
});
