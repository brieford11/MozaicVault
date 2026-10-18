import { useEffect, useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { createExportFile, downloadArchive, journalText, selectArchiveEntries, type ExportFormat } from "@/lib/archive-export";
import { CATEGORIES } from "@/lib/categories";
import type { Entry } from "@/lib/db";

export function ArchiveActions({ entries }: { entries: Entry[] | null }) {
  const [mode, setMode] = useState<"export" | "share" | null>(null);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [scope, setScope] = useState("all");
  const [method, setMethod] = useState("file");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = selectArchiveEntries(entries ?? [], scope);
  const text = journalText(selected);

  useEffect(() => {
    let active = true;
    setFile(null);
    setStatus("");
    if (entries) createExportFile(selectArchiveEntries(entries, scope), format).then((archive) => {
      if (active) setFile(archive);
    }).catch(() => { if (active) setStatus("Could not prepare the archive. Please try again."); });
    return () => { active = false; };
  }, [entries, scope, format]);

  const perform = async () => {
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      if (mode === "export" || method === "download") {
        downloadArchive(file);
        setStatus("Your selected memories have been downloaded.");
      } else if (method === "copy") {
        if (!navigator.clipboard?.writeText) { setStatus("Copying isn't available here. Choose download instead."); return; }
        await navigator.clipboard.writeText(text);
        setStatus("Journal text copied.");
      } else if (method === "text") {
        if (!navigator.share) { setStatus("Device sharing isn't available here. Choose copy or download instead."); return; }
        await navigator.share({ title: "Mozaic Vault memories", text });
        setStatus("Journal text shared.");
      } else {
        if (!navigator.share || !navigator.canShare?.({ files: [file] })) { setStatus("File sharing isn't available here. Choose download or journal text instead."); return; }
        await navigator.share({ files: [file], title: "Mozaic Vault archive" });
        setStatus("Archive shared.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus("That didn't complete. Try another sharing option or download a copy.");
    } finally { setBusy(false); }
  };

  return <div className="border-t border-border pt-4">
    <div className="grid grid-cols-2 gap-3">
      <Button variant="secondary" disabled={!entries} onClick={() => { setMode("export"); setStatus(""); }}><Download />Export archive</Button>
      <Button variant="outline" disabled={!entries} onClick={() => { setMode("share"); setStatus(""); }}><Share2 />Share archive</Button>
    </div>
    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) setMode(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-md">
        <DialogTitle className="text-2xl">{mode === "export" ? "Export archive" : "Share archive"}</DialogTitle>
        <DialogDescription>{selected.length} memories selected · only shared when you choose.</DialogDescription>
        <label className="space-y-1 text-sm">Memories<select aria-label="Memories to include" value={scope} onChange={(ev) => setScope(ev.target.value)} className="block w-full rounded-md border border-input bg-card p-2"><option value="all">Entire archive</option><option value="favourites">Favourites</option>{CATEGORIES.filter((c) => c.id !== "favourites").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        {mode === "share" && <label className="space-y-1 text-sm">Share as<select aria-label="Sharing method" value={method} onChange={(ev) => setMethod(ev.target.value)} className="block w-full rounded-md border border-input bg-card p-2"><option value="file">File · device share menu</option><option value="text">Journal text · device share menu</option><option value="copy">Copy journal text</option><option value="download">Download a copy</option></select></label>}
        {(mode === "export" || method === "file" || method === "download") && <fieldset className="space-y-2"><legend className="mb-2 text-sm">File format</legend>{([{ id: "json", title: "Complete archive · JSON", note: "All details, photos and unedited audio." }, { id: "csv", title: "Spreadsheet · CSV", note: "Details and notes, without photos or audio." }, { id: "text", title: "Journal · text", note: "Readable memories and notes, without photos or audio." }] as const).map((item) => <label key={item.id} className={`flex cursor-pointer gap-3 rounded-md border p-3 ${format === item.id ? "border-primary bg-secondary" : "border-border"}`}><input aria-label={item.title} type="radio" name="export-format" checked={format === item.id} onChange={() => setFormat(item.id)} className="mt-1 accent-primary" /><span><span className="block text-sm font-semibold">{item.title}</span><span className="block text-xs text-muted-foreground">{item.note}</span></span></label>)}</fieldset>}
        <Button disabled={!file || busy || selected.length === 0} onClick={perform}>{mode === "export" || method === "download" ? <Download /> : method === "copy" ? <Copy /> : <Share2 />}{busy ? "Working…" : !file ? "Preparing…" : mode === "export" || method === "download" ? "Download selected memories" : method === "copy" ? "Copy journal text" : "Open device share menu"}</Button>
        {status && <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0" />{status}</p>}
      </DialogContent>
    </Dialog>
  </div>;
}
