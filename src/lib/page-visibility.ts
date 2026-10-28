import { useEffect, useState } from "react";
import { readHiddenPages, writeHiddenPages } from "./db";

export function toggleHiddenPage(hidden: string[], page: string): string[] {
  return hidden.includes(page) ? hidden.filter((id) => id !== page) : [...hidden, page];
}

export function usePageVisibility() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () =>
      readHiddenPages()
        .then((pages) => {
          if (active) {
            setHidden(pages);
            setReady(true);
          }
        })
        .catch(() => {
          if (active) setError("Could not open page preferences.");
        });
    load();
    window.addEventListener("archive-preferences", load);
    return () => {
      active = false;
      window.removeEventListener("archive-preferences", load);
    };
  }, []);
  const update = async (pages: string[]) => {
    setError("");
    setSaving(true);
    try {
      await writeHiddenPages(pages);
      setHidden(pages);
    } catch {
      setError("Could not save page preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return { hidden, ready, saving, error, update };
}
