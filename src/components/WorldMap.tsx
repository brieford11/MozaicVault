import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { Plus, Minus, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { geoEqualEarth, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

const W = 800, H = 420;

export type Pin = { id: string; lat: number; lng: number; label: string; tone?: "brass" | "heather" | "moss" | undefined };

export function WorldMap({ pins, onPick, onPinClick, selected }: {
  pins: Pin[]; onPick?: (lat: number, lng: number) => void; onPinClick?: (id: string) => void; selected?: { lat: number; lng: number } | undefined;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const behavior = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transform = useRef<ZoomTransform>(zoomIdentity);
  const [view, setView] = useState(zoomIdentity);
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const controller = zoom<SVGSVGElement, unknown>().extent([[0, 0], [W, H]]).scaleExtent([1, 32])
      .on("zoom", (event) => { transform.current = event.transform; setView(event.transform); });
    behavior.current = controller;
    const selection = select(el);
    selection.call(controller).on("dblclick.zoom", null);
    // d3 registers a native non-passive wheel listener and anchors wheel/pinch zoom.
    return () => { selection.on(".zoom", null); behavior.current = null; };
  }, []);
  const { projection, land, grat } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const land = feature(world as any, (world as any).objects.countries) as any;
    const projection = geoEqualEarth().fitSize([W, H], { type: "Sphere" });
    const path = geoPath(projection);
    return { projection, land: path(land) ?? "", grat: path(geoGraticule10()) ?? "", sphere: path({ type: "Sphere" }) };
  }, []);
  const sphere = useMemo(() => geoPath(projection)({ type: "Sphere" }) ?? "", [projection]);

  const handle = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPick || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    const point: [number, number] = [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
    const p = projection.invert?.(transform.current.invert(point));
    if (p && isFinite(p[0]) && Math.abs(p[1]) <= 90) {
      onPick(+p[1].toFixed(3), +p[0].toFixed(3));
      if (behavior.current && transform.current.k < 32) select(svg.current).call(behavior.current.scaleBy, 2, point);
    }
  };

  const changeZoom = (factor: number) => {
    if (svg.current && behavior.current) select(svg.current).call(behavior.current.scaleBy, factor, [W / 2, H / 2]);
  };

  const pt = (lat: number, lng: number) => projection([lng, lat]) ?? [0, 0];

  return (
    <div className="relative overflow-hidden bg-sea">
    <svg ref={svg} aria-label="World map" viewBox={`0 0 ${W} ${H}`} className="block aspect-[40/21] w-full touch-none" onClick={handle}>
      <g transform={view.toString()}>
      <path d={sphere} className="fill-sea" />
      <path d={grat} className="fill-none stroke-brass/15" strokeWidth={0.5} />
      <path d={land} className="fill-land stroke-background/60" strokeWidth={0.5} />
      <path d={sphere} className="fill-none stroke-brass/50" strokeWidth={1} />
      {pins.map((p) => {
        const [x, y] = pt(p.lat, p.lng);
        return (
          <g key={p.id} role="button" tabIndex={0} aria-label={`Show city: ${p.label}`} transform={`translate(${x},${y}) scale(${1 / view.k})`} onClick={(e) => { e.stopPropagation(); onPinClick?.(p.id); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPinClick?.(p.id); } }} className="cursor-pointer">
            <title>{p.label}</title>
            <circle r={9} className="fill-transparent" />
            <circle r={4.5} className={p.tone === "heather" ? "fill-heather" : p.tone === "moss" ? "fill-moss" : "fill-brass"} stroke="currentColor" strokeWidth={1} />
          </g>
        );
      })}
      {selected && (() => { const [x, y] = pt(selected.lat, selected.lng); return (
        <g transform={`translate(${x},${y}) scale(${1 / view.k})`}><circle r={8} className="fill-none stroke-primary" strokeWidth={2} /><circle r={3} className="fill-primary" /></g>
      ); })()}
      </g>
    </svg>
    <div className="absolute right-2 top-2 flex gap-1">
      <Button type="button" variant="secondary" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => changeZoom(2)}><Plus /></Button>
      <Button type="button" variant="secondary" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => changeZoom(0.5)}><Minus /></Button>
      <Button type="button" variant="secondary" size="icon" aria-label="Reset map" title="Reset map" onClick={() => { if (svg.current && behavior.current) select(svg.current).call(behavior.current.transform, zoomIdentity); }}><Maximize /></Button>
    </div>
    </div>
  );
}
