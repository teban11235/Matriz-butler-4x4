import React from 'react';
import { ButlerPortId } from '../types/microwave';
import { BUTLER_PORTS } from '../utils/butlerMatrixModel';

interface AntennaArrayVisualizerProps {
  selectedPort: ButlerPortId;
  phasesDeg: [number, number, number, number];
  amplitudes: [number, number, number, number];
  dMm: number;
  dOverLambda: number;
  thetaAfDeg: number | null;
  thetaTotalDeg: number;
}

const fmt=(v:number|null)=>v===null?'—':`${v>=0?'+':''}${v.toFixed(1)}°`;
export const AntennaArrayVisualizer:React.FC<AntennaArrayVisualizerProps>=({selectedPort,phasesDeg,amplitudes,dMm,dOverLambda,thetaAfDeg,thetaTotalDeg})=>{
  const cfg=BUTLER_PORTS[selectedPort];
  const xs=[175,355,535,715];
  const y=245;
  const angle=thetaTotalDeg*Math.PI/180;
  const beamX=445+180*Math.sin(angle);
  const beamY=195-180*Math.cos(angle);
  return <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-4 sm:p-5 shadow-xl">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
      <div><h3 className="font-bold text-slate-900">Arreglo lineal de 4 antenas patch</h3><p className="text-xs text-slate-600">O1→A1, O2→A2, O3→A3, O4→A4 · d={dMm.toFixed(1)} mm = {dOverLambda.toFixed(3)}λ₀</p></div>
      <div className="text-sm font-mono rounded bg-slate-50 border border-slate-300 px-3 py-2"><span className="text-slate-600">θAF:</span> <span className="text-cyan-300">{fmt(thetaAfDeg)}</span> · <span className="text-slate-600">θTotal:</span> <strong style={{color:cfg.beamColor}}>{fmt(thetaTotalDeg)}</strong></div>
    </div>
    <div className="mt-3"><svg viewBox="0 0 900 330" className="block w-full h-auto max-h-[380px]" preserveAspectRatio="xMidYMid meet">
      <defs><marker id="beamArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill={cfg.beamColor}/></marker></defs>
      <line x1="95" y1={y+36} x2="805" y2={y+36} stroke="#64748b" strokeWidth="8"/><text x="450" y={y+66} fill="#475569" textAnchor="middle" fontSize="13">Plano de masa / sustrato (esquema pedagógico)</text>
      <line x1="445" y1="205" x2="445" y2="35" stroke="#64748b" strokeDasharray="5 5"/><text x="456" y="48" fill="#94a3b8" fontSize="13" fontWeight="600">0° broadside</text>
      <line x1="445" y1="205" x2={beamX} y2={beamY} stroke={cfg.beamColor} strokeWidth="5" markerEnd="url(#beamArrow)"/><text x={beamX} y={beamY-10} fill={cfg.beamColor} fontSize="15" fontWeight="700">θTotal={fmt(thetaTotalDeg)}</text>
      {xs.map((x,i)=>{
        const amp=amplitudes[i]; const phase=phasesDeg[i]; const pr=phase*Math.PI/180; const r=30*Math.min(1,amp/Math.max(...amplitudes,1e-9));
        return <g key={i} opacity={amp<1e-6?0.25:1}>
          <rect x={x-45} y={y-18} width="90" height="36" rx="4" fill="#b45309" stroke="#fbbf24" strokeWidth="2"/>
          <text x={x} y={y+5} fill="#fff" textAnchor="middle" fontWeight="800">A{i+1}</text>
          <line x1={x} y1={y-25} x2={x+r*Math.cos(pr)} y2={y-25-r*Math.sin(pr)} stroke="#38bdf8" strokeWidth="3"/>
          <circle cx={x} cy={y-25} r="2.5" fill="#fff"/>
          <text x={x} y={y+34} fill="#334155" textAnchor="middle" fontSize="14" fontWeight="600">A={amp.toFixed(2)} · φ={phase>=0?'+':''}{phase.toFixed(0)}°</text>
        </g>;
      })}
      {xs.slice(0,-1).map((x,i)=><g key={i}><line x1={x} y1={305} x2={xs[i+1]} y2={305} stroke="#64748b"/><line x1={x} y1="299" x2={x} y2="311" stroke="#64748b"/><line x1={xs[i+1]} y1="299" x2={xs[i+1]} y2="311" stroke="#64748b"/><text x={(x+xs[i+1])/2} y="323" fill="#94a3b8" textAnchor="middle" fontSize="13" fontWeight="600">d={dMm.toFixed(1)} mm</text></g>)}
    </svg></div>
    <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">Las antenas permanecen físicamente fijas. La dirección del haz cambia porque las excitaciones tienen fases distintas. <strong className="text-cyan-300">θAF</strong> es el máximo predicho por el factor de arreglo uniforme; <strong className="text-emerald-300">θTotal</strong> incluye el patrón del elemento.</div>
  </div>;
};