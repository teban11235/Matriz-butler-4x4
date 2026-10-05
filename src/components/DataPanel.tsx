import React from 'react';
import { ButlerPortId, GratingLobeSolution } from '../types/microwave';
import { BUTLER_PORTS } from '../utils/butlerMatrixModel';

interface DataPanelProps {
  selectedPort: ButlerPortId;
  frequencyGhz: number;
  wavelengthMm: number;
  separationMm: number;
  dOverLambda: number;
  kdDeg: number;
  betaDeg: number | null;
  phasesDeg: [number, number, number, number];
  amplitudes: [number, number, number, number];
  thetaAfDeg: number | null;
  thetaTotalDeg: number;
  gratingLobes: GratingLobeSolution[];
  scenarioTitle?: string | null;
}

const fmtAngle=(v:number|null)=>v===null?'Sin solución visible':`${v>=0?'+':''}${v.toFixed(1)}°`;
export const DataPanel:React.FC<DataPanelProps>=(p)=>{
  const cfg=BUTLER_PORTS[p.selectedPort];
  return <div className="space-y-4">
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-mono">
        <span className="px-2.5 py-1 rounded border border-cyan-500/40 text-cyan-300">{p.scenarioTitle || `${p.selectedPort} (RF IN)`}</span><span className="text-slate-600">➔</span><span className="rounded bg-slate-950/60 px-2 py-1">Butler</span><span className="text-slate-600">➔</span><span className="rounded bg-slate-950/60 px-2 py-1">O1–O4</span><span className="text-slate-600">➔</span><span className="rounded bg-slate-950/60 px-2 py-1">A1–A4</span><span className="text-slate-600">➔</span><span className="rounded bg-slate-950/60 px-2 py-1">AF(θ)</span><span className="text-slate-600">➔</span><span className="rounded bg-emerald-950/30 px-2 py-1 text-emerald-300">Patrón total</span>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {[
        ['Puerto',p.selectedPort],['f₀',`${p.frequencyGhz.toFixed(2)} GHz`],['λ₀',`${p.wavelengthMm.toFixed(1)} mm`],['d',`${p.separationMm.toFixed(1)} mm`],['d/λ',p.dOverLambda.toFixed(3)],['kd',`${p.kdDeg.toFixed(1)}°`],['β',p.betaDeg===null?'—':`${p.betaDeg>=0?'+':''}${p.betaDeg.toFixed(1)}°`],['θAF',fmtAngle(p.thetaAfDeg)]
      ].map(([k,v])=><div key={k} className="rounded-lg border border-slate-800 bg-slate-900 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div><div className="mt-1 font-mono font-bold text-cyan-200">{v}</div></div>)}
    </div>
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 grid lg:grid-cols-[1.4fr_1fr] gap-4 text-xs">
      <div><div className="font-semibold text-slate-200">Excitación efectiva O1–O4 → A1–A4</div><div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">{p.phasesDeg.map((ph,i)=><div key={i} className="rounded bg-slate-950 p-2 border border-slate-800"><span className="text-slate-500">O{i+1}:</span> <strong className="text-cyan-300">A={p.amplitudes[i].toFixed(3)}</strong><br/><span className="text-amber-300">φ={ph>=0?'+':''}{ph.toFixed(1)}°</span></div>)}</div></div>
      <div className="space-y-2"><div><span className="text-slate-400">Máximo patrón total:</span> <strong className="text-emerald-300">{fmtAngle(p.thetaTotalDeg)}</strong></div><div><span className="text-slate-400">Grating lobes matemáticos:</span> {p.gratingLobes.length? <span className="text-amber-300">{p.gratingLobes.map(g=>`m=${g.m}: ${fmtAngle(g.thetaDeg)}`).join(' · ')}</span>:<span className="text-emerald-300">ninguno adicional visible</span>}</div><div className="text-slate-500">θAF proviene de kd·sinθ+β=0. θTotal se busca numéricamente sobre Eelement·AF.</div></div>
    </div>
  </div>;
};