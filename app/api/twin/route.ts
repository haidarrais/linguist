import { NextResponse } from "next/server";
import { advanceFixtureSession, createFixtureSession } from "@/lib/fixture";
import { advanceLiveSession, createLiveSession } from "@/lib/openai";
import type { TwinRequest } from "@/lib/types";
import { isTwinRequest, validateAdvanceSession, validateCreateInput, validateResponse } from "@/lib/validation";

export const runtime = "nodejs";

function error(message: string, code: string, status = 400) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Send a valid TeachBack request.", "invalid_request");
  }
  if (!isTwinRequest(body)) return error("Send a valid TeachBack request.", "invalid_request");
  const input = body as TwinRequest;

  if (input.action === "create") {
    if (input.mode === "fixture") return NextResponse.json({ mode: "fixture", session: createFixtureSession() });
    const validationError = validateCreateInput(input);
    if (validationError) return error(validationError, "invalid_input");
    try {
      const session = await createLiveSession({
        lessonText: input.lessonText!.trim(),
        title: input.title!.trim(),
        subject: input.subject?.trim() || "Teacher-provided learning context",
        learningGoal: input.learningGoal!.trim(),
      });
      return NextResponse.json({ mode: "live", session });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "GENERATION_FAILED";
      if (message === "API_KEY_MISSING") return error("Live GPT-5.6 setup needs an OPENAI_API_KEY. The complete Greenwater demo works offline.", "api_unavailable", 503);
      if (message === "INVALID_OUTPUT") return error("The twin could not create a reliable source map. Check the source packet or use the included demo.", "invalid_output", 502);
      return error("The twin could not be created right now. Your source packet has not been stored.", "generation_failed", 502);
    }
  }

  const sessionError = validateAdvanceSession(input.session);
  if (sessionError) {
    const code = input.session.status === "draft" ? "teacher_approval_required" : "invalid_session";
    const status = input.session.status === "draft" ? 403 : 409;
    return error(sessionError, code, status);
  }
  const responseError = validateResponse(input.response);
  if (responseError) return error(responseError, "invalid_input");
  try {
    const session = input.mode === "fixture"
      ? advanceFixtureSession(input.session, input.response.trim())
      : await advanceLiveSession(input.session, input.response.trim());
    return NextResponse.json({ mode: input.mode, session });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "GENERATION_FAILED";
    if (message === "API_KEY_MISSING") return error("Live GPT-5.6 setup needs an OPENAI_API_KEY. The Greenwater demo works offline.", "api_unavailable", 503);
    if (message === "INVALID_OUTPUT") return error("The twin could not produce a safe, structured update. Your response is still on this device. Try again.", "invalid_output", 502);
    return error("The twin could not respond right now. Your response is still on this device. Try again.", "generation_failed", 502);
  }
}
