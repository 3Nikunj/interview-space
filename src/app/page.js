"use client";

import { useMemo, useRef, useState } from "react";

export default function HomePage() {
  const [companyId, setCompanyId] = useState("tcs");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const canRecord = useMemo(
    () => typeof window !== "undefined" && !!navigator?.mediaDevices,
    [],
  );

  async function startInterview() {
    setError("");
    setStatus("processing");
    setTranscript("");
    setAiText("");

    try {
      const form = new FormData();
      form.append("companyId", companyId);
      const res = await fetch("/api/interview/session", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSessionId(data.sessionId || "");
      setAiText(data.aiText || "");
      if (data.aiAudioBase64 && audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${data.aiAudioBase64}`;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setStatus("idle");
    }
  }

  async function startRecording() {
    setError("");
    setStatus("recording");
    setTranscript("");
    setAiText("");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      try {
        setStatus("processing");
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], "answer.webm", { type: blob.type });

        const form = new FormData();
        form.append("companyId", companyId);
        if (sessionId) form.append("sessionId", sessionId);
        form.append("audio", file);

        const res = await fetch("/api/interview/turn", { method: "POST", body: form });
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        if (data.sessionId && !sessionId) setSessionId(data.sessionId);
        setTranscript(data.transcript || "");
        setAiText(data.aiText || "");

        if (data.aiAudioBase64 && audioRef.current) {
          audioRef.current.src = `data:audio/wav;base64,${data.aiAudioBase64}`;
          audioRef.current.play().catch(() => {});
        }

        setStatus("idle");
      } catch (e) {
        setError(e?.message || String(e));
        setStatus("idle");
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  }

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Interview Simulation (STT → LLM → TTS)</h1>
      <p style={{ marginTop: 6, color: "#555" }}>
        Trial UI for Hugging Face Spaces. This will be embedded into your “Round 3: Technical/Personal Interview”
        page later.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Company</span>
          <input
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="tcs"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", minWidth: 220 }}
          />
        </label>

        <button
          onClick={startInterview}
          disabled={status !== "idle"}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #0b5",
            background: status === "idle" ? "#0b5" : "#999",
            color: "white",
            cursor: status === "idle" ? "pointer" : "not-allowed",
          }}
        >
          Start Interview
        </button>

        <button
          onClick={startRecording}
          disabled={!canRecord || status !== "idle"}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: status === "idle" ? "#111" : "#999",
            color: "white",
            cursor: status === "idle" ? "pointer" : "not-allowed",
          }}
        >
          Start Recording
        </button>

        <button
          onClick={stopRecording}
          disabled={status !== "recording"}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: status === "recording" ? "#fff" : "#f2f2f2",
            cursor: status === "recording" ? "pointer" : "not-allowed",
          }}
        >
          Stop
        </button>

        <span style={{ color: "#555" }}>
          Status: <b>{status}</b>
        </span>
        <span style={{ color: "#555" }}>
          Session: <b>{sessionId ? "active" : "none"}</b>
        </span>
      </div>

      <audio ref={audioRef} controls style={{ width: "100%", marginTop: 16 }} />

      {error ? (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            background: "#fff4f4",
            border: "1px solid #ffd0d0",
          }}
        >
          <b>Error:</b> {error}
        </div>
      ) : null}

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee" }}>
          <h3 style={{ marginTop: 0 }}>Transcript (You)</h3>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{transcript || "—"}</pre>
        </div>
        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee" }}>
          <h3 style={{ marginTop: 0 }}>Interviewer (AI)</h3>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{aiText || "—"}</pre>
        </div>
      </section>
    </main>
  );
}
