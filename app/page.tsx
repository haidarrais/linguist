"use client";

import { FormEvent, useMemo, useState } from "react";
import { DEMO_SOURCE, DEMO_STRONG_EXPLANATION, DEMO_STRONG_TRANSFER } from "@/lib/fixture";
import type { CreateSessionResponse, SessionMode, TeachBackSession } from "@/lib/types";
import { activePrompt, activeStage, appStep, approveTeacherSummary, statusLabel, statusSummary } from "@/lib/workflow";

type BusyState = "idle" | "building" | "responding";

const DEFAULT_PACKET = {
  title: "Greenwater Lake field brief",
  subject: "Grade 10 Environmental Science",
  learningGoal: "Explain a causal mechanism with source evidence, while separating a supported explanation from a claim of proof.",
  lessonText: DEMO_SOURCE,
};

const steps = ["Set the source", "Approve the twin", "Teach it", "Review evidence"];

export default function Home() {
  const [session, setSession] = useState<TeachBackSession | null>(null);
  const [mode, setMode] = useState<SessionMode>("fixture");
  const [teacherApproved, setTeacherApproved] = useState(false);
  const [packet, setPacket] = useState(DEFAULT_PACKET);
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState<BusyState>("idle");
  const [error, setError] = useState("");

  const step = appStep(session, teacherApproved);
  const currentPrompt = useMemo(() => (session ? activePrompt(session) : ""), [session]);
  const currentStage = useMemo(() => (session ? activeStage(session) : "explanation"), [session]);
  const currentStepIndex = step === "setup" ? 0 : step === "review" ? 1 : step === "teach" ? 2 : 3;

  async function requestTwin(body: unknown) {
    const result = await fetch("/api/twin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await result.text();
    let payload: { error?: string } | null = null;
    try {
      payload = JSON.parse(raw) as { error?: string };
    } catch {
      throw new Error("TeachBack could not reach its session service. Please try again.");
    }
    if (!result.ok) throw new Error(payload.error ?? "TeachBack could not complete that step.");
    return payload as CreateSessionResponse;
  }

  async function openDemo() {
    setBusy("building");
    setError("");
    try {
      const result = await requestTwin({ action: "create", mode: "fixture" });
      setSession(result.session);
      setMode("fixture");
      setTeacherApproved(false);
      setResponse("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The demo could not open.");
    } finally {
      setBusy("idle");
    }
  }

  async function buildLiveTwin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("building");
    setError("");
    try {
      const result = await requestTwin({ action: "create", mode: "live", ...packet });
      setSession(result.session);
      setMode("live");
      setTeacherApproved(false);
      setResponse("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The twin could not be built.");
    } finally {
      setBusy("idle");
    }
  }

  function approveTwin() {
    setTeacherApproved(true);
    setSession((current) => (current ? { ...current, status: "approved" } : current));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sendExplanation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setBusy("responding");
    setError("");
    try {
      const result = await requestTwin({ action: "advance", mode, session, response });
      setSession(result.session);
      setResponse("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The twin could not respond.");
    } finally {
      setBusy("idle");
    }
  }

  function loadWorkedResponse() {
    setResponse(currentStage === "transfer" ? DEMO_STRONG_TRANSFER : DEMO_STRONG_EXPLANATION);
  }

  function restart() {
    setSession(null);
    setMode("fixture");
    setTeacherApproved(false);
    setResponse("");
    setError("");
  }

  return (
    <main className="site-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="TeachBack home">
          <span className="brand-orbit" aria-hidden="true"><span /></span>
          <span>TeachBack</span>
        </a>
        <div className="masthead-meta">
          <span className="privacy-dot" aria-hidden="true" /> No accounts · No grades · Teacher approved
        </div>
      </header>

      <nav className="progress" aria-label="TeachBack progress">
        <ol>
          {steps.map((label, index) => (
            <li className={index === currentStepIndex ? "active" : index < currentStepIndex ? "done" : ""} key={label}>
              <span>{index < currentStepIndex ? "✓" : index + 1}</span>{label}
            </li>
          ))}
        </ol>
      </nav>

      {!session ? (
        <>
          <section className="hero" id="top">
            <div className="hero-copy">
              <p className="eyebrow">Learning evidence, not surveillance</p>
              <h1>Give every student a learner they must teach.</h1>
              <p className="lede">TeachBack simulates a novice with one calibrated misconception. When the novice tries a new case, the student’s reasoning—and any missing link—becomes visible.</p>
              <div className="hero-actions">
                <button className="button primary" type="button" onClick={openDemo} disabled={busy !== "idle"}>
                  {busy === "building" ? "Opening demo…" : "Open the worked demo"}
                </button>
                <a className="button ghost" href="#build">Build from a source packet</a>
              </div>
              <p className="hero-footnote">A constructive alternative to AI detection: explanation, transfer, and teacher judgment.</p>
            </div>
            <aside className="hero-simulation" aria-label="TeachBack simulation preview">
              <div className="simulation-topline"><span className="live-dot" /> SIMULATED LEARNING STATE</div>
              <div className="simulation-quote">“If algae make oxygen, why did the greener lake have less oxygen at dawn?”</div>
              <div className="simulation-chain">
                <span>Nutrients</span><b>→</b><span>Algal bloom</span><b>→</b><span className="alert-node">Decomposition</span><b>→</b><span>Low O₂</span>
              </div>
              <div className="simulation-answer"><strong>Student teaches:</strong> “The critical change is what happens after the bloom dies…”</div>
              <div className="simulation-status"><span>✓ mechanism visible</span><span>→ transfer next</span></div>
            </aside>
          </section>

          <section className="principles" aria-label="How TeachBack works">
            <article><span>01</span><h2>Ground it</h2><p>The teacher’s source packet becomes a reviewable concept map—not a free-form chatbot prompt.</p></article>
            <article><span>02</span><h2>Teach it</h2><p>The student repairs one plausible novice misconception with explanation and evidence.</p></article>
            <article><span>03</span><h2>Transfer it</h2><p>The twin tries a new case. The teacher reviews what the learner actually made visible.</p></article>
          </section>

          <section className="builder" id="build" aria-labelledby="builder-title">
            <div className="builder-intro">
              <p className="eyebrow">Teacher setup</p>
              <h2 id="builder-title">Build a twin from an approved source packet.</h2>
              <p>Use only de-identified classroom material. TeachBack does not save the packet or create a grade.</p>
              <div className="guardrail-callout"><strong>Before you continue</strong><span>The teacher reviews the source map and misconception before any student interaction begins.</span></div>
            </div>
            <form className="builder-form" onSubmit={buildLiveTwin}>
              <div className="field-row">
                <label>Packet title<input value={packet.title} onChange={(event) => setPacket((current) => ({ ...current, title: event.target.value }))} /></label>
                <label>Subject / context<input value={packet.subject} onChange={(event) => setPacket((current) => ({ ...current, subject: event.target.value }))} /></label>
              </div>
              <label>One learning goal<textarea rows={3} value={packet.learningGoal} onChange={(event) => setPacket((current) => ({ ...current, learningGoal: event.target.value }))} /></label>
              <label>Teacher-approved source packet<textarea rows={10} value={packet.lessonText} onChange={(event) => setPacket((current) => ({ ...current, lessonText: event.target.value }))} /></label>
              <div className="form-footer">
                <button className="button primary" type="submit" disabled={busy !== "idle"}>{busy === "building" ? "Building twin…" : "Build source map with GPT‑5.6"}</button>
                <button className="button text" type="button" onClick={() => setPacket(DEFAULT_PACKET)}>Restore Greenwater packet</button>
              </div>
            </form>
          </section>
        </>
      ) : (
        <>
          <section className="session-header" id="top">
            <div>
              <p className="eyebrow">{mode === "fixture" ? "Deterministic worked demo" : "Teacher source packet"}</p>
              <h1>{session.sourceMap.title}</h1>
              <p>{session.sourceMap.subject} · {session.sourceMap.learningGoal}</p>
            </div>
            <div className={`mode-badge ${mode}`}><span />{mode === "fixture" ? "OFFLINE FIXTURE" : "GPT‑5.6 LIVE"}</div>
          </section>

          {step === "review" && <SourceReview session={session} onApprove={approveTwin} onRestart={restart} />}
          {step === "teach" && (
            <TeachStage
              session={session}
              prompt={currentPrompt}
              stage={currentStage}
              response={response}
              onResponse={setResponse}
              onSubmit={sendExplanation}
              onUseWorkedResponse={mode === "fixture" ? loadWorkedResponse : undefined}
              busy={busy === "responding"}
            />
          )}
          {step === "summary" && <TeacherReview session={session} onUpdate={setSession} onRestart={restart} />}
        </>
      )}

      {error && <div className="toast-error" role="alert"><strong>That step did not complete.</strong><span>{error}</span></div>}
    </main>
  );
}

function SourceReview({ session, onApprove, onRestart }: { session: TeachBackSession; onApprove: () => void; onRestart: () => void }) {
  return (
    <section className="review-stage" aria-labelledby="review-title">
      <div className="stage-title">
        <div><p className="eyebrow">Teacher gate · step 2</p><h2 id="review-title">Review what the twin is allowed to teach.</h2></div>
        <p>Nothing is released to a student until you approve this map.</p>
      </div>
      <div className="review-grid">
        <section className="source-card">
          <div className="card-heading"><span>01</span><div><p>Approved source</p><h3>Evidence anchors</h3></div></div>
          <div className="anchor-list">
            {session.sourceMap.evidenceAnchors.map((anchor) => <blockquote key={anchor.label}><strong>{anchor.label}</strong><p>“{anchor.quote}”</p></blockquote>)}
          </div>
          <details><summary>Read full source packet</summary><pre>{session.sourceText}</pre></details>
        </section>
        <section className="map-card">
          <div className="card-heading"><span>02</span><div><p>Source-grounded map</p><h3>Concept relationships</h3></div></div>
          <ol className="causal-chain">
            {session.sourceMap.causalChain.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}
          </ol>
          <div className="uncertainty"><strong>Boundary</strong>{session.sourceMap.uncertainty.map((item) => <p key={item}>{item}</p>)}</div>
        </section>
        <section className="twin-card">
          <div className="card-heading"><span>03</span><div><p>Simulated novice</p><h3>Nova’s starting misconception</h3></div></div>
          <p className="misconception">{session.twin.misconception}</p>
          <p className="twin-disclosure">Nova is a structured simulation of a novice state. It does not know, remember, or judge the student.</p>
          <div className="twin-preview"><span>NOVA ASKS</span><p>{session.twin.openingPrompt}</p></div>
        </section>
      </div>
      <div className="approval-bar"><div><strong>Ready to let a student teach this twin?</strong><span>Approval confirms that the source, learning goal, and misconception are appropriate for this activity.</span></div><div><button className="button ghost" type="button" onClick={onRestart}>Start over</button><button className="button primary" type="button" onClick={onApprove}>Approve &amp; begin</button></div></div>
    </section>
  );
}

function TeachStage({ session, prompt, stage, response, onResponse, onSubmit, onUseWorkedResponse, busy }: {
  session: TeachBackSession;
  prompt: string;
  stage: "explanation" | "transfer" | "complete";
  response: string;
  onResponse: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUseWorkedResponse?: () => void;
  busy: boolean;
}) {
  const isTransfer = stage === "transfer";
  return (
    <section className="teach-stage" aria-labelledby="teach-title">
      <div className="stage-title"><div><p className="eyebrow">Student experience · step 3</p><h2 id="teach-title">Teach Nova your reasoning.</h2></div><p>{isTransfer ? "Transfer the idea to a new case—without reaching beyond the evidence." : "Explain the relationship, then show Nova where the evidence stops."}</p></div>
      <div className="teach-grid">
        <section className="dialogue-card" aria-label="TeachBack conversation">
          <div className="dialogue-top"><div className="nova-avatar">N</div><div><strong>Nova</strong><span>Simulated novice · asks, does not grade</span></div><span className="stage-chip">{isTransfer ? "TRANSFER" : "TEACH-BACK"}</span></div>
          <div className="conversation">
            {session.turns.map((turn, index) => (
              <div className="turn-pair" key={`${turn.stage}-${index}`}>
                <div className="bubble student"><span>You taught</span><p>{turn.response}</p></div>
                <div className="bubble nova"><span>Nova updated</span><p>{turn.twinReply}</p></div>
                <div className="coach-line"><strong>Coach note</strong>{turn.coachNote}</div>
              </div>
            ))}
            <div className="bubble nova current"><span>Nova asks now</span><p>{prompt}</p></div>
          </div>
          <form className="response-form" onSubmit={onSubmit}>
            <label htmlFor="teach-response">Your explanation</label>
            <textarea id="teach-response" value={response} onChange={(event) => onResponse(event.target.value)} rows={5} placeholder={isTransfer ? "State what the new observation may suggest, then what cannot be concluded yet…" : "Teach Nova the causal chain in your own words. Use the source packet…"} />
            <div className="response-actions"><span>{isTransfer ? "Aim for a careful conclusion, not a guess." : "Name the mechanism and the limit of the evidence."}</span><div>{onUseWorkedResponse && <button className="button text" type="button" onClick={onUseWorkedResponse}>Use worked demo reply</button>}<button className="button primary" type="submit" disabled={busy}>{busy ? "Nova is updating…" : isTransfer ? "Try the new case" : "Teach Nova"}</button></div></div>
          </form>
        </section>
        <aside className="state-card" aria-label="Simulated learning state">
          <div className="state-heading"><div><p>SIMULATED LEARNING STATE</p><h3>What Nova can now use</h3></div><span>{statusSummary(session)}</span></div>
          <ul className="concept-state">
            {session.sourceMap.conceptNodes.map((node) => <li className={node.status} key={node.id}><span className="node-icon">{node.status === "grounded" ? "✓" : node.status === "needs-connection" ? "↗" : "?"}</span><div><strong>{node.label}</strong><p>{node.explanation}</p><small>{statusLabel(node.status)} · {node.sourceAnchor}</small></div></li>)}
          </ul>
          <div className="state-disclosure"><strong>Why this is visible</strong><p>The map is a transparent simulation state, not an estimate of a student’s intelligence or authorship.</p></div>
        </aside>
      </div>
    </section>
  );
}

function TeacherReview({ session, onUpdate, onRestart }: { session: TeachBackSession; onUpdate: (session: TeachBackSession) => void; onRestart: () => void }) {
  const approved = session.status === "teacher-approved";
  const summary = session.summary;
  return (
    <section className="summary-stage" aria-labelledby="summary-title">
      <div className="stage-title"><div><p className="eyebrow">Teacher review · step 4</p><h2 id="summary-title">A learning trace—not a verdict.</h2></div><p>Use the evidence for the next instructional conversation. Do not treat it as an automated grade or an integrity finding.</p></div>
      <div className="summary-hero">
        <div className="summary-mark">✓</div>
        <div><p className="eyebrow">Transfer complete</p><h3>{summary?.headline ?? "The student completed the transfer check."}</h3><p>{summary?.teacherNote}</p></div>
        <span className={approved ? "approval-state done" : "approval-state"}>{approved ? "TEACHER REVIEWED" : "AWAITING REVIEW"}</span>
      </div>
      <div className="summary-grid">
        <section className="evidence-summary"><h3>Evidence made visible</h3><ul>{summary?.demonstrated.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section>
        <section className="next-step"><p>Suggested next step</p><h3>{summary?.nextStep}</h3><span>This is a draft for teacher judgment, not a prescribed intervention.</span></section>
      </div>
      <section className="trace-card"><div><p>Conversation trace</p><h3>What the student taught; what Nova could then transfer.</h3></div><ol>{session.turns.map((turn, index) => <li key={`${turn.stage}-${index}`}><span>{index + 1}</span><div><strong>{turn.stage === "explanation" ? "Teach-back" : "Transfer"}</strong><p>{turn.response}</p><small>{turn.coachNote}</small></div></li>)}</ol></section>
      <div className="approval-bar"><div><strong>{approved ? "Teacher review recorded locally" : "Review this learning trace before using it."}</strong><span>{approved ? "Nothing has been saved to an account in this MVP." : "Approval is the final human gate; it does not change a grade."}</span></div><div><button className="button ghost" type="button" onClick={onRestart}>New session</button>{!approved && <button className="button primary" type="button" onClick={() => onUpdate(approveTeacherSummary(session))}>Approve learning note</button>}{approved && <button className="button primary" type="button" onClick={() => window.print()}>Print learning note</button>}</div></div>
    </section>
  );
}
