import React, { useMemo, useState } from 'react';
import { ButlerPortId, PatternPoint } from '../types/microwave';
import { BUTLER_PORTS } from '../utils/butlerMatrixModel';
import { calculatePatternsRange, findPatternMetrics } from '../utils/electromagnetics';

interface PolarPlotProps {
  selectedPort: ButlerPortId;
  points: PatternPoint[];
  frequencyGhz: number;
  dOverLambda: number;
  elementPowerQ: number;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  showElement: boolean;
  showArrayFactor: boolean;
  showTotal: boolean;
  onToggleElement: () => void;
  onToggleArrayFactor: () => void;
  onToggleTotal: () => void;
  compareCurrent: boolean;
  onToggleCompareCurrent: () => void;
  amplitudeWeights: [number, number, number, number];
  phaseErrorsDeg: [number, number, number, number];
}

export const PolarPlot: React.FC<PolarPlotProps> = ({
  selectedPort, points, frequencyGhz, dOverLambda, elementPowerQ,
  isCompareMode, onToggleCompareMode, showElement, showArrayFactor, showTotal,
  onToggleElement, onToggleArrayFactor, onToggleTotal, compareCurrent,
  onToggleCompareCurrent, amplitudeWeights, phaseErrorsDeg,
}) => {
  const [mode, setMode] = useState<'polar'|'cartesian'>('polar');
  const metrics = useMemo(() => findPatternMetrics(points), [points]);
  const cx=310, cy=285, R=220, floor=-40;
  const radius=(db:number)=>((Math.max(floor,Math.min(0,db))-floor)/-floor)*R;
  const xy=(theta:number,db:number)=>{const rr=radius(db),a=theta*Math.PI/180;return{x:cx+rr*Math.sin(a),y:cy-rr*Math.cos(a)}};
  const path=(data:PatternPoint[],key:'elementDb'|'arrayFactorDb'|'totalDb')=>data.map((p,i)=>{const q=xy(p.thetaDeg,p[key]);return `${i?'L':'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`}).join(' ');

  const compare = useMemo(() => {
    if(!isCompareMode) return [];
    return (['P1','P2','P3','P4'] as ButlerPortId[]).map(id=>{
      const cfg=BUTLER_PORTS[id];
      const phases=compareCurrent?cfg.phasesDeg.map((v,i)=>v+phaseErrorsDeg[i]):cfg.phasesDeg;
      const amps=compareCurrent?amplitudeWeights:[1,1,1,1];
      const p=calculatePatternsRange(frequencyGhz*1e9,dOverLambda,amps,phases,elementPowerQ,0.5);
      return {id,cfg,points:p,metrics:findPatternMetrics(p)};
    });
  },[isCompareMode,compareCurrent,frequencyGhz,dOverLambda,elementPowerQ,amplitudeWeights,phaseErrorsDeg]);

  const cW=640,cH=340,pad={l:55,r:20,t:20,b:45};
  const x=(t:number)=>pad.l+(t+90)/180*(cW-pad.l-pad.r);
  const y=(db:number)=>pad.t+(0-Math.max(floor,Math.min(0,db)))/40*(cH-pad.t-pad.b);
  const cpath=(data:PatternPoint[],key:'elementDb'|'arrayFactorDb'|'totalDb')=>data.map((p,i)=>`${i?'L':'M'} ${x(p.thetaDeg).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');

  return <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-5 shadow-xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
      <div><h3 className="font-bold text-slate-100">Patrón de radiación normalizado</h3><p className="text-xs text-slate-400">0° = broadside · escala 0 a −40 dB</p></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onToggleCompareMode} className={`rounded border px-3 py-1.5 text-xs ${isCompareMode?'border-cyan-400 bg-cyan-950/40 text-cyan-300':'border-slate-700 text-slate-300'}`}>{isCompareMode?'✓ Comparando 4 puertos':'Comparar 4 puertos'}</button>
        {isCompareMode&&<button onClick={onToggleCompareCurrent} className={`rounded border px-3 py-1.5 text-xs ${compareCurrent?'border-rose-400 text-rose-300':'border-slate-700 text-slate-300'}`}>{compareCurrent?'Configuración actual':'Ideal'}</button>}
        <button onClick={()=>setMode(mode==='polar'?'cartesian':'polar')} className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300">{mode==='polar'?'Ver cartesiano':'Ver polar'}</button>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap gap-4 text-xs">
      <label className="flex items-center gap-2"><input type="checkbox" checked={showTotal} onChange={onToggleTotal}/><span className="text-cyan-300">Patrón total</span></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={showArrayFactor} onChange={onToggleArrayFactor}/><span className="text-violet-300">Factor de arreglo</span></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={showElement} onChange={onToggleElement}/><span className="text-amber-300">Elemento</span></label>
      <span className="ml-auto font-mono text-slate-300">θmáx={metrics.peakThetaDeg>=0?'+':''}{metrics.peakThetaDeg.toFixed(1)}°</span>
    </div>

    <div className="mt-3 flex justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70 p-2">
      {mode==='polar'?<svg viewBox="0 0 620 570" className="h-auto w-full max-w-[720px]">
        {[0,-10,-20,-30,-40].map(db=><g key={db}><circle cx={cx} cy={cy} r={radius(db)} fill="none" stroke="#334155" strokeWidth="1"/><text x={cx+6} y={cy-radius(db)+13} fill="#64748b" fontSize="10">{db} dB</text></g>)}
        {[-90,-60,-30,0,30,60,90].map(a=>{const q=xy(a,0);return <g key={a}><line x1={cx} y1={cy} x2={q.x} y2={q.y} stroke="#1e293b"/><text x={q.x} y={q.y-5} textAnchor="middle" fill="#94a3b8" fontSize="10">{a}°</text></g>})}
        {!isCompareMode&&<>
          {showElement&&<path d={path(points,'elementDb')} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4"/>}
          {showArrayFactor&&<path d={path(points,'arrayFactorDb')} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3"/>}
          {showTotal&&<path d={path(points,'totalDb')} fill="none" stroke={BUTLER_PORTS[selectedPort].beamColor} strokeWidth="3"/>}
          {showTotal&&(()=>{const q=xy(metrics.peakThetaDeg,metrics.peakDb);return <><line x1={cx} y1={cy} x2={q.x} y2={q.y} stroke={BUTLER_PORTS[selectedPort].beamColor} strokeDasharray="4 4"/><circle cx={q.x} cy={q.y} r="5" fill={BUTLER_PORTS[selectedPort].beamColor}/></>})()}
        </>}
        {isCompareMode&&compare.map(c=><path key={c.id} d={path(c.points,'totalDb')} fill="none" stroke={c.cfg.beamColor} strokeWidth="2.4"/>)}
      </svg>:<svg viewBox={`0 0 ${cW} ${cH}`} className="h-auto w-full max-w-[820px]">
        <rect x={pad.l} y={pad.t} width={cW-pad.l-pad.r} height={cH-pad.t-pad.b} fill="#090d16" stroke="#334155"/>
        {[0,-10,-20,-30,-40].map(db=><g key={db}><line x1={pad.l} x2={cW-pad.r} y1={y(db)} y2={y(db)} stroke="#1e293b"/><text x={pad.l-8} y={y(db)+4} textAnchor="end" fill="#94a3b8" fontSize="10">{db}</text></g>)}
        {[-90,-60,-30,0,30,60,90].map(a=><g key={a}><line x1={x(a)} x2={x(a)} y1={pad.t} y2={cH-pad.b} stroke="#1e293b"/><text x={x(a)} y={cH-pad.b+18} textAnchor="middle" fill="#94a3b8" fontSize="10">{a}°</text></g>)}
        {!isCompareMode&&<>
          {showElement&&<path d={cpath(points,'elementDb')} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4"/>}
          {showArrayFactor&&<path d={cpath(points,'arrayFactorDb')} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3"/>}
          {showTotal&&<path d={cpath(points,'totalDb')} fill="none" stroke={BUTLER_PORTS[selectedPort].beamColor} strokeWidth="3"/>}
        </>}
        {isCompareMode&&compare.map(c=><path key={c.id} d={cpath(c.points,'totalDb')} fill="none" stroke={c.cfg.beamColor} strokeWidth="2.2"/>)}
      </svg>}
    </div>

    {isCompareMode&&<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{compare.map(c=><div key={c.id} className="rounded border border-slate-800 bg-slate-950/60 p-2 text-xs"><strong style={{color:c.cfg.beamColor}}>{c.id}</strong><div className="font-mono text-slate-300">θmáx={c.metrics.peakThetaDeg>=0?'+':''}{c.metrics.peakThetaDeg.toFixed(1)}°</div></div>)}</div>}
    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300"><span className="font-semibold text-cyan-300">Principio de multiplicación:</span> |Etotal(θ)| = |Eelement(θ)| · |AF(θ)|. El patrón total puede tener su máximo en un ángulo ligeramente distinto de θAF por la ponderación del patrón del elemento.</div>
  </div>;
};