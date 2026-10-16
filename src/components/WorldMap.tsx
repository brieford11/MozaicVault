import { useMemo, useRef } from "react";
import { geoEqualEarth, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

const W = 800, H = 420;

export type Pin = { id: string; lat: number; lng: number; label: string; tone?: "brass" | "heather" | "moss" };

export function WorldMap({ pins, onPick, onPinClick, selected }: {
  pins: Pin[]; onPick?: (lat: number, lng: number) => void; onPinClick?: (id: string) => void; selected?: { lat: number; lng: number } | undefined;
}) {
  const svg = useRef<SVGSVGElement>(null);
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
    const p = projection.invert?.([((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]);
    if (p && isFinite(p[0])) onPick(+p[1].toFixed(3), +p[0].toFixed(3));
  };

  const pt = (lat: number, lng: number) => projection([lng, lat]) ?? [0, 0];

  return (
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="w-full touch-manipulation" onClick={handle}>
      <path d={sphere} className="fill-sea" />
      <path d={grat} className="fill-none stroke-brass/15" strokeWidth={0.5} />
      <path d={land} className="fill-land stroke-background/60" strokeWidth={0.5} />
      <path d={sphere} className="fill-none stroke-brass/50" strokeWidth={1} />
      {pins.map((p) => {
        const [x, y] = pt(p.lat, p.lng);
        return (
          <g key={p.id} transform={`translate(${x},${y})`} onClick={(e) => { e.stopPropagation(); onPinClick?.(p.id); }} className="cursor-pointer">
            <circle r={9} className="fill-transparent" />
            <circle r={4.5} className={p.tone === "heather" ? "fill-heather" : p.tone === "moss" ? "fill-moss" : "fill-brass"} stroke="currentColor" strokeWidth={1} />
          </g>
        );
      })}
      {selected && (() => { const [x, y] = pt(selected.lat, selected.lng); return (
        <g transform={`translate(${x},${y})`}><circle r={8} className="fill-none stroke-heather" strokeWidth={2} /><circle r={3} className="fill-heather" /></g>
      ); })()}
    </svg>
  );
}
