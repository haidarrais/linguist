import assert from "node:assert/strict";
import test from "node:test";
import { getFixture } from "../lib/fixture";
import { isLanguagePackage, MAX_SOURCE_LENGTH, validateRequest } from "../lib/validation";

test("validates required source and language boundaries", () => {
  assert.equal(validateRequest("", ["Spanish"]), "Add lesson text or choose a text-readable PDF.");
  assert.equal(validateRequest("lesson", []), "Select between one and three target languages.");
  assert.equal(validateRequest("lesson", ["Spanish", "Arabic", "French", "Hindi"]), "Select between one and three target languages.");
  assert.equal(validateRequest("x".repeat(MAX_SOURCE_LENGTH + 1), ["Spanish"]), "This lesson is too long for the MVP. Use 30,000 characters or fewer.");
  assert.equal(validateRequest("lesson", ["Spanish"]), null);
});

test("fixture packages conform to the UI contract", () => {
  const fixture = getFixture(["Spanish", "Bahasa Indonesia"]);
  assert.equal(fixture.mode, "fixture");
  assert.equal(fixture.packages.length, 2);
  assert.ok(fixture.packages.every(isLanguagePackage));
  assert.equal(fixture.packages[0].comprehensionPrompts.length, 3);
});
