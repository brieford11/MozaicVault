import { useEffect, useState } from "react";
import { DRAWERS } from "./categories";
import { readPreference, writePreference } from "./db";

export const CABINET_COLORS = [
  { id: "sage", name: "Deep sage" },
  { id: "blue", name: "Dusty blue" },
  { id: "lavender", name: "Smoky lavender" },
  { id: "rose", name: "Muted rose" },
  { id: "teal", name: "Soft teal" },
] as const;
export type CabinetColor = typeof CABINET_COLORS[number]["id"];
export type CabinetPreference = { id: string; title: string; color: CabinetColor };

export function normalizeCabinets(value: unknown): CabinetPreference[] {
  const stored = Array.isArray(value) ? value : [];
  const ids = [...new Set([...stored.map((item) => item?.id), ...DRAWERS.map((drawer) => drawer.id)])];
  return ids.flatMap((id) => {
    const drawer = DRAWERS.find((item) => item.id === id);
    if (!drawer) return [];
    const setting = stored.find((item) => item?.id === id);
    const index = DRAWERS.findIndex((item) => item.id === id);
    const color = CABINET_COLORS.find((item) => item.id === setting?.color)?.id ?? CABINET_COLORS[index % CABINET_COLORS.length]?.id ?? "sage";
    return [{ id: drawer.id, title: typeof setting?.title === "string" && setting.title.trim() ? setting.title.slice(0, 60) : drawer.name, color }];
  });
}

export function moveCabinet(cabinets: CabinetPreference[], id: string, direction: -1 | 1): CabinetPreference[] {
  const index = cabinets.findIndex((item) => item.id === id);
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= cabinets.length) return cabinets;
  const next = [...cabinets];
  const item = next.splice(index, 1)[0];
  if (item) next.splice(destination, 0, item);
  return next;
}

export function useCabinets() {
  const [cabinets, setCabinets] = useState(() => normalizeCabinets(undefined));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = () => readPreference("cabinets").then((value) => {
      if (active) { setCabinets(normalizeCabinets(value)); setReady(true); }
    }).catch(() => { if (active) setError("Could not open cabinet settings."); });
    load();
    window.addEventListener("archive-preferences", load);
    return () => { active = false; window.removeEventListener("archive-preferences", load); };
  }, []);
  const update = async (next: CabinetPreference[]) => {
    setError("");
    try { await writePreference("cabinets", normalizeCabinets(next)); setCabinets(normalizeCabinets(next)); }
    catch { setError("Could not save cabinet settings. Please try again."); }
  };
  return { cabinets, ready, error, update };
}