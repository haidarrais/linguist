"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
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

function BrandLockup() {
  return (
    <span className="brand-lockup">
      <span className="brand-grid" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="brand-name">TeachBack</span>
    </span>
  );
}

function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

export default function Home() {
  const [session, setSession] = useState<TeachBackSession | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mode, setMode] = useState<SessionMode>("fixture");
  const [teacherApproved, setTeacherApproved] = useState(false);
  const [packet, setPacket] = useState(DEFAULT_PACKET);
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState<BusyState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);

  const step = appStep(session, teacherApproved);
  const currentPrompt = useMemo(() => (session ? activePrompt(session) : ""), [session]);
  const currentStage = useMemo(() => (session ? activeStage(session) : "explanation"), [session]);
  const currentStepIndex = step === "setup" ? 0 : step === "review" ? 1 : step === "teach" ? 2 : 3;
  const liveStatus = busy === "building" ? "Preparing a TeachBack session." : busy === "responding" ? "Nova is updating the learning trace." : "";

  async function requestTwin(body: unknown) {
    const result = await fetch("/api/twin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await result.text();
    let payload: { error?: string };
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
      scrollToTop();
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
      scrollToTop();
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
    scrollToTop();
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
      scrollToTop();
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
    scrollToTop();
  }

  return (
    <main className="site-shell" data-theme={theme}>
      <span className="screen-reader-status" aria-live="polite">{liveStatus}</span>
      <header className="masthead">
        {session ? (
          <button className="brand brand-button" type="button" onClick={restart} aria-label="Start a new TeachBack lesson"><BrandLockup /></button>
        ) : (
          <a className="brand" href="#top" aria-label="TeachBack home"><BrandLockup /></a>
        )}
        <div className="masthead-actions">
          <p className="masthead-meta"><span>No accounts</span><span>No grades</span><span>Teacher approved</span></p>
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label={theme === "light" ? "Use dark theme" : "Use light theme"}>{theme === "light" ? "Dark theme" : "Light theme"}</button>
        </div>
      </header>

      <nav className="progress" aria-label="TeachBack progress">
        <ol>
          {steps.map((label, index) => (
            <li className={index === currentStepIndex ? "active" : index < currentStepIndex ? "done" : ""} key={label}>
              <span className="progress-number">{index < currentStepIndex ? "Done" : index + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mobile-progress" role="status" aria-label={`Stage ${currentStepIndex + 1} of ${steps.length}: ${steps[currentStepIndex]}`}>
        <span>{currentStepIndex + 1} / {steps.length}</span><strong>{steps[currentStepIndex]}</strong>
      </div>

      {!session ? (
        <Landing
          packet={packet}
          busy={busy}
          onOpenDemo={openDemo}
          onBuildLiveTwin={buildLiveTwin}
          onPacketChange={setPacket}
          onRestorePacket={() => setPacket(DEFAULT_PACKET)}
        />
      ) : (
        <>
          <section className="session-header" id="top">
            <div>
              <p className="session-context">{mode === "fixture" ? "Worked Greenwater lesson" : "Teacher source packet"}</p>
              <h1>{session.sourceMap.title}</h1>
              <p>{session.sourceMap.subject} / {session.sourceMap.learningGoal}</p>
            </div>
            <div className={`mode-badge ${mode}`}><span>{mode === "fixture" ? "Fixture" : "Live"}</span>{mode === "fixture" ? "Offline demo" : "GPT-5.6"}</div>
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

function Landing({ packet, busy, onOpenDemo, onBuildLiveTwin, onPacketChange, onRestorePacket }: {
  packet: typeof DEFAULT_PACKET;
  busy: BusyState;
  onOpenDemo: () => void;
  onBuildLiveTwin: (event: FormEvent<HTMLFormElement>) => void;
  onPacketChange: (packet: typeof DEFAULT_PACKET | ((current: typeof DEFAULT_PACKET) => typeof DEFAULT_PACKET)) => void;
  onRestorePacket: () => void;
}) {
  return (
    <>
      <section className="landing-hero" id="top">
        <div className="hero-copy">
          <p className="hero-kicker">Learning evidence, not surveillance.</p>
          <h1>Teach what you know.</h1>
          <p className="hero-lede">A teacher-approved twin makes reasoning visible through explanation and transfer.</p>
          <div className="hero-actions">
            <button className="button primary" type="button" onClick={onOpenDemo} disabled={busy !== "idle"} aria-busy={busy === "building"}>
              {busy === "building" ? "Opening lesson..." : "Preview the lesson"}
            </button>
            <a className="button ghost" href="#build">Teacher setup</a>
          </div>
        </div>
        <figure className="hero-photo">
          <Image src="/images/teachback-collaboration.jpg" alt="Three learners discussing their work around a table." width={1800} height={1200} priority sizes="(max-width: 900px) 100vw, 55vw" />
        </figure>
      </section>

      <section className="evidence-section" aria-labelledby="evidence-title">
        <div className="evidence-intro">
          <p className="section-kicker">A source sets the boundary.</p>
          <h2 id="evidence-title">Make the thinking visible, then test whether it travels.</h2>
        </div>
        <div className="evidence-layout">
          <figure className="evidence-photo">
            <Image src="/images/teachback-review.jpg" alt="Hands writing and reviewing notes in an open notebook." width={1400} height={933} sizes="(max-width: 900px) 100vw, 42vw" />
          </figure>
          <ol className="reasoning-list">
            <li><strong>Start with what the teacher approves.</strong><span>The source packet becomes a visible concept map and a bounded misconception.</span></li>
            <li><strong>Let the student repair one idea.</strong><span>Nova asks for the causal link and the limit of the evidence, not a polished answer.</span></li>
            <li><strong>Try a new case.</strong><span>Transfer shows whether the explanation still holds when the details change.</span></li>
          </ol>
          <div className="evidence-signal" aria-label="TeachBack learning sequence">
            <span>Source</span><b>creates</b><span>Explanation</span><b>tests</b><span>Transfer</span>
          </div>
        </div>
      </section>

      <section className="builder" id="build" aria-labelledby="builder-title">
        <div className="builder-intro">
          <h2 id="builder-title">Start from the lesson you already teach.</h2>
          <p>Build a reviewable twin from a short, de-identified packet. The teacher approves every source anchor before a student begins.</p>
          <dl className="builder-promises">
            <div><dt>Source grounded</dt><dd>Evidence quotes must appear in the teacher packet.</dd></div>
            <div><dt>Human judgment</dt><dd>No grade, authorship claim, or automated verdict.</dd></div>
          </dl>
        </div>
        <form className="builder-form" onSubmit={onBuildLiveTwin}>
          <div className="field-row">
            <label>Packet title<input value={packet.title} onChange={(event) => onPacketChange((current) => ({ ...current, title: event.target.value }))} /></label>
            <label>Subject or context<input value={packet.subject} onChange={(event) => onPacketChange((current) => ({ ...current, subject: event.target.value }))} /></label>
          </div>
          <label>One learning goal<textarea rows={3} value={packet.learningGoal} onChange={(event) => onPacketChange((current) => ({ ...current, learningGoal: event.target.value }))} /></label>
          <label>Teacher-approved source packet<textarea rows={10} value={packet.lessonText} onChange={(event) => onPacketChange((current) => ({ ...current, lessonText: event.target.value }))} /></label>
          <div className="form-footer">
            <button className="button primary" type="submit" disabled={busy !== "idle"} aria-busy={busy === "building"}>{busy === "building" ? "Building twin..." : "Build with GPT-5.6"}</button>
            <button className="button text" type="button" onClick={onRestorePacket}>Restore Greenwater lesson</button>
          </div>
        </form>
      </section>
    </>
  );
}

function SourceReview({ session, onApprove, onRestart }: { session: TeachBackSession; onApprove: () => void; onRestart: () => void }) {
  return (
    <section className="review-stage" aria-labelledby="review-title">
      <div className="stage-title">
        <h2 id="review-title">See exactly what Nova may use.</h2>
        <p>The teacher checks the source, the causal map, and the misconception before any student interaction begins.</p>
      </div>
      <div className="review-grid">
        <section className="source-panel">
          <p className="panel-label">Approved source</p>
          <h3>Evidence anchors</h3>
          <div className="anchor-list">
            {session.sourceMap.evidenceAnchors.map((anchor) => <blockquote key={anchor.label}><strong>{anchor.label}</strong><p>“{anchor.quote}”</p></blockquote>)}
          </div>
          <details><summary>Read the full source packet</summary><pre>{session.sourceText}</pre></details>
        </section>
        <section className="map-panel">
          <p className="panel-label">Source map</p>
          <h3>Concept relationships</h3>
          <ol className="causal-chain">
            {session.sourceMap.causalChain.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}
          </ol>
          <div className="uncertainty"><strong>What the source cannot prove</strong>{session.sourceMap.uncertainty.map((item) => <p key={item}>{item}</p>)}</div>
        </section>
        <aside className="twin-panel">
          <p className="panel-label">Simulated novice</p>
          <h3>Nova starts here.</h3>
          <p className="misconception">{session.twin.misconception}</p>
          <p className="twin-disclosure">Nova is a structured simulation. It does not know, remember, or judge the student.</p>
          <div className="twin-preview"><strong>Nova asks</strong><p>{session.twin.openingPrompt}</p></div>
        </aside>
      </div>
      <div className="approval-bar"><div><strong>Release this twin to a student?</strong><span>Approval confirms the source, learning goal, and misconception are appropriate for this activity.</span></div><div><button className="button ghost" type="button" onClick={onRestart}>Start over</button><button className="button primary" type="button" onClick={onApprove}>Approve and begin</button></div></div>
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
      <div className="stage-title"><h2 id="teach-title">Teach Nova your reasoning.</h2><p>{isTransfer ? "Apply the idea to a new case without reaching beyond the evidence." : "Explain the relationship, then name where the evidence stops."}</p></div>
      <div className="teach-grid">
        <section className="dialogue-card" aria-label="TeachBack conversation">
          <div className="dialogue-top"><div className="nova-avatar" aria-hidden="true">N</div><div><strong>Nova</strong><span>Simulated novice, asks and does not grade</span></div><span className="stage-chip">{isTransfer ? "Transfer" : "Teach back"}</span></div>
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
            <textarea id="teach-response" value={response} onChange={(event) => onResponse(event.target.value)} rows={5} placeholder={isTransfer ? "State what the new observation may suggest, then what cannot be concluded yet." : "Teach Nova the causal chain in your own words. Use the source packet."} />
            <div className="response-actions"><span>{isTransfer ? "Aim for a careful conclusion, not a guess." : "Name the mechanism and the limit of the evidence."}</span><div>{onUseWorkedResponse && <button className="button text" type="button" onClick={onUseWorkedResponse}>Use worked reply</button>}<button className="button primary" type="submit" disabled={busy} aria-busy={busy}>{busy ? "Nova is updating..." : isTransfer ? "Try the new case" : "Teach Nova"}</button></div></div>
          </form>
        </section>
        <aside className="state-card" aria-label="Simulated learning state">
          <div className="state-heading"><div><p>Simulated learning state</p><h3>What Nova can now use</h3></div><span>{statusSummary(session)}</span></div>
          <ul className="concept-state">
            {session.sourceMap.conceptNodes.map((node) => <li className={node.status} key={node.id}><span className="node-status">{statusLabel(node.status)}</span><div><strong>{node.label}</strong><p>{node.explanation}</p><small>{node.sourceAnchor}</small></div></li>)}
          </ul>
          <div className="state-disclosure"><strong>What this means</strong><p>This is Nova’s transparent simulation state, not an estimate of a student’s intelligence or authorship.</p></div>
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
      <div className="stage-title"><h2 id="summary-title">A learning trace, not a verdict.</h2><p>Use this evidence for the next instructional conversation. It is not an automated grade or integrity finding.</p></div>
      <div className="summary-hero">
        <div><p className="summary-label">Transfer complete</p><h3>{summary?.headline ?? "The student completed the transfer check."}</h3><p>{summary?.teacherNote}</p></div>
        <span className={approved ? "approval-state done" : "approval-state"}>{approved ? "Teacher reviewed" : "Awaiting review"}</span>
      </div>
      <div className="summary-grid">
        <section className="evidence-summary"><h3>Evidence made visible</h3><ul>{summary?.demonstrated.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="next-step"><p>Suggested next move</p><h3>{summary?.nextStep}</h3><span>This is a draft for teacher judgment, not a prescribed intervention.</span></section>
      </div>
      <section className="trace-card"><div><p className="panel-label">Conversation trace</p><h3>What the student taught, then transferred.</h3></div><ol>{session.turns.map((turn, index) => <li key={`${turn.stage}-${index}`}><span>{turn.stage === "explanation" ? "Teach back" : "Transfer"}</span><div><p>{turn.response}</p><small>{turn.coachNote}</small></div></li>)}</ol></section>
      <div className="approval-bar"><div><strong>{approved ? "Teacher review recorded locally." : "Review the learning trace before using it."}</strong><span>{approved ? "Nothing has been saved to an account in this MVP." : "Approval is the final human gate and does not change a grade."}</span></div><div><button className="button ghost" type="button" onClick={onRestart}>New lesson</button>{!approved && <button className="button primary" type="button" onClick={() => onUpdate(approveTeacherSummary(session))}>Approve learning note</button>}{approved && <button className="button primary" type="button" onClick={() => window.print()}>Print learning note</button>}</div></div>
    </section>
  );
}
