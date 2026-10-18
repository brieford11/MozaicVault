import { useEffect, useState } from "react";
import { readHiddenPages, writeHiddenPages } from "./db";

export function toggleHiddenPage(hidden: string[], page: string): string[] {
  return hidden.includes(page) ? hidden.filter((id) => id !== page) : [...hidden, page];
}

export function usePageVisibility() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = () => readHiddenPages().then((pages) => {
      if (active) { setHidden(pages); setReady(true); }
    }).catch(() => { if (active) setError("Could not open page preferences."); });
    load();
    window.addEventListener("archive-preferences", load);
    return () => { active = false; window.removeEventListener("archive-preferences", load); };
  }, []);
  const update = async (pages: string[]) => {
    setError("");
    try { await writeHiddenPages(pages); setHidden(pages); }
    catch { setError("Could not save page preferences. Please try again."); }
  };
  return { hidden, ready, error, update };
}