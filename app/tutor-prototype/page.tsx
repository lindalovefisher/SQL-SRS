"use client";

import { useMemo, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import StreamingAvatar, { AvatarQuality, TaskType } from "@heygen/streaming-avatar";

import { allLessons } from "../../content/lessons";
import { buildTutorChunks } from "../lib/tutorScript";

type AnySessionData = any;

export default function TutorPrototypePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [lessonId, setLessonId] = useState(allLessons[0]?.id ?? "");
  const lesson = useMemo(
    () => allLessons.find((l) => l.id === lessonId) ?? allLessons[0],
    [lessonId]
  );

  const [status, setStatus] = useState<
    "idle" | "starting" | "ready" | "speaking" | "stopped" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const avatarRef = useRef<StreamingAvatar | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  async function startAvatar() {
    try {
      setError(null);
      setStatus("starting");

      // 1) Get HeyGen session token from server
      const tokRes = await fetch("/api/heygen/create-token", { method: "POST" });
      const tokJson = await tokRes.json();
      if (!tokRes.ok) throw new Error(tokJson?.error ?? "Token request failed");

      // HeyGen docs return a token payload; exact field name can vary by wrapper.
      // Common patterns: tokJson.data.token or tokJson.token
      const sessionToken =
        tokJson?.data?.token ?? tokJson?.token ?? tokJson?.data?.access_token;
      if (!sessionToken) throw new Error("Could not find session token in response");

      // 2) Create SDK instance
      const avatar = new StreamingAvatar({ token: sessionToken });
      avatarRef.current = avatar;

      // 3) Start avatar session
      // Note: avatarName is your Interactive Avatar ID from HeyGen Labs. :contentReference[oaicite:6]{index=6}
      const avatarId = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || "default";

      const sessionData: AnySessionData = await avatar.createStartAvatar({
        avatarName: avatarId,
        quality: AvatarQuality.High,
        // You can pass voice settings here later (voiceId, emotion, rate, etc.) :contentReference[oaicite:7]{index=7}
      });

      sessionIdRef.current = sessionData.session_id;

      // 4) Connect to LiveKit room and attach video track
      // sessionData typically contains a room_url + room_token (names vary).
      const roomUrl =
        sessionData?.room_url ?? sessionData?.url ?? sessionData?.data?.room_url;
      const roomToken =
        sessionData?.room_token ??
        sessionData?.token ??
        sessionData?.data?.room_token;

      if (!roomUrl || !roomToken) {
        throw new Error(
          "Missing LiveKit room_url/room_token in session data. Check HeyGen session response."
        );
      }

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (!videoRef.current) return;

        if (track.kind === Track.Kind.Video) {
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          videoRef.current.srcObject = mediaStream;
          void videoRef.current.play().catch(() => {});
        }
      });

      await room.connect(roomUrl, roomToken);

      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? String(e));
    }
  }

  async function speakLesson() {
    const avatar = avatarRef.current;
    const sessionId = sessionIdRef.current;
    if (!avatar || !sessionId || !lesson) return;

    const chunks = buildTutorChunks(lesson);

    setStatus("speaking");
    try {
      for (const text of chunks) {
        // REPEAT = speak exactly the text you provide (no LLM). :contentReference[oaicite:8]{index=8}
        await avatar.speak({
          sessionId,
          text,
          task_type: TaskType.REPEAT,
        });
      }
      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? String(e));
    }
  }

  async function interrupt() {
    try {
      const avatar = avatarRef.current;
      const sessionId = sessionIdRef.current;
      if (!avatar || !sessionId) return;

      // The SDK supports interrupting tasks; exact method name can vary by version.
      // If your SDK exposes avatar.interrupt({ sessionId }), use that.
      // Otherwise you can call the REST interrupt endpoint via your server proxy.
      if (typeof (avatar as any).interrupt === "function") {
        await (avatar as any).interrupt({ sessionId });
      }
      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? String(e));
    }
  }

  async function stop() {
    try {
      setStatus("stopped");

      // Disconnect LiveKit
      await roomRef.current?.disconnect();
      roomRef.current = null;

      // Stop avatar session if SDK supports it
      if (typeof (avatarRef.current as any)?.stopAvatar === "function") {
        await (avatarRef.current as any).stopAvatar();
      }

      avatarRef.current = null;
      sessionIdRef.current = null;

      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {
      // best effort
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Tutor Prototype</h1>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">Lesson</span>
          <select
            className="rounded-xl border px-3 py-2"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            disabled={status === "starting" || status === "speaking"}
          >
            {allLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </label>

        <button
          className="rounded-xl border bg-white px-4 py-2 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
          onClick={startAvatar}
          disabled={status !== "idle" && status !== "stopped" && status !== "error"}
        >
          Start Tutor
        </button>

        <button
          className="rounded-xl border bg-white px-4 py-2 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
          onClick={speakLesson}
          disabled={status !== "ready"}
        >
          Teach Lesson
        </button>

        <button
          className="rounded-xl border bg-white px-4 py-2 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
          onClick={interrupt}
          disabled={status !== "speaking"}
        >
          Interrupt
        </button>

        <button
          className="rounded-xl border bg-white px-4 py-2 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
          onClick={stop}
          disabled={status === "idle"}
        >
          Stop
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="text-sm text-zinc-600">Status: {status}</div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      <div className="rounded-2xl border bg-black shadow-sm">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="h-[420px] w-full rounded-2xl object-cover"
        />
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{lesson?.title}</h2>
        <p className="mt-1 text-zinc-700">{lesson?.summary}</p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-sm">
{lesson ? buildTutorChunks(lesson).join("\n\n") : ""}
        </pre>
      </div>
    </main>
  );
}
