import { useEffect, useRef, useState } from "react";
import type { AudioClip } from "@/lib/db";

const MAX = 20;

function ClipPlayer({ clip, onDelete }: { clip: AudioClip; onDelete?: () => void }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const u = URL.createObjectURL(clip.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [clip.blob]);
  return (
    <div className="flex items-center gap-2 rounded-md border border-ink-soft/30 bg-parchment-deep/60 p-2">
      <span className="font-hand text-lg text-ink-soft">{new Date(clip.createdAt).toLocaleDateString()}</span>
      {url && <audio controls src={url} className="h-8 flex-1" />}
      {onDelete && <button type="button" onClick={onDelete} className="px-1 text-destructive" aria-label="Delete clip">✕</button>}
    </div>
  );
}

export function AudioRecorder({ clips, onChange }: { clips: AudioClip[]; onChange: (c: AudioClip[]) => void }) {
  const [rec, setRec] = useState(false);
  const [left, setLeft] = useState(MAX);
  const [err, setErr] = useState<string>();
  const mr = useRef<MediaRecorder | null>(null);
  const timer = useRef<number>();
  const clipsRef = useRef(clips);
  clipsRef.current = clips;

  const stop = () => { mr.current?.state === "recording" && mr.current.stop(); };

  const start = async () => {
    setErr(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const t0 = Date.now();
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        window.clearInterval(timer.current);
        setRec(false);
        const blob = new Blob(chunks, { type: r.mimeType });
        onChange([...clipsRef.current, { id: crypto.randomUUID(), blob, createdAt: Date.now(), duration: Math.min(MAX, (Date.now() - t0) / 1000) }]);
      };
      mr.current = r;
      r.start();
      setRec(true);
      setLeft(MAX);
      timer.current = window.setInterval(() => {
        const l = MAX - Math.floor((Date.now() - t0) / 1000);
        setLeft(l);
        if (l <= 0) stop();
      }, 200);
    } catch {
      setErr("Microphone access was not granted.");
    }
  };

  useEffect(() => () => { window.clearInterval(timer.current); stop(); }, []);

  return (
    <div className="space-y-2">
      {clips.map((c) => <ClipPlayer key={c.id} clip={c} onDelete={() => onChange(clips.filter((x) => x.id !== c.id))} />)}
      <button
        type="button"
        onClick={rec ? stop : start}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-dashed border-ink-soft/50 py-3 font-display text-lg text-ink"
      >
        <span className={rec ? "h-3 w-3 animate-pulse rounded-full bg-destructive" : "h-3 w-3 rounded-full bg-heather"} />
        {rec ? `Listening… ${left}s — tap to stop` : "Capture 20 seconds of this place"}
      </button>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <p className="text-xs text-ink-soft">Raw, unedited. Saved only on this device.</p>
    </div>
  );
}

export { ClipPlayer };
