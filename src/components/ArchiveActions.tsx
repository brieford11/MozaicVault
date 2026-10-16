import { useEffect, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createArchiveFile, downloadArchive } from "@/lib/archive-export";
import type { Entry } from "@/lib/db";

export function ArchiveActions({ entries }: { entries: Entry[] | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;
    setFile(null);
    setStatus("");
    if (entries) {
      createArchiveFile(entries).then((archive) => {
        if (active) setFile(archive);
      }).catch(() => {
        if (active) setStatus("Could not prepare the archive. Please try reopening the cabinet.");
      });
    }
    return () => { active = false; };
  }, [entries]);

  const share = async () => {
    if (!file) return;
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      downloadArchive(file);
      setStatus("Sharing isn’t available here. Your archive has been downloaded instead.");
      return;
    }
    setSharing(true);
    try {
      await navigator.share({ files: [file], title: "Mozaic Vault archive" });
      setStatus("Archive shared.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setStatus("Could not share the archive. You can still export a copy.");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="border-t border-border pt-4">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" disabled={!file || sharing} onClick={() => {
          if (!file) return;
          downloadArchive(file);
          setStatus("Archive exported, including notes and audio.");
        }}><Download /> Export archive</Button>
        <Button variant="outline" disabled={!file || sharing} onClick={share}><Share2 /> {sharing ? "Sharing…" : "Share archive"}</Button>
      </div>
      <p role="status" className="mt-2 text-center text-xs text-muted-foreground">{status}</p>
    </div>
  );
}