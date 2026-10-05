import React, { useState } from 'react';
import { ButlerPortId } from '../types/microwave';
import { BUTLER_BLOCK_DETAILS, BUTLER_PORTS, moduloPhaseDeg } from '../utils/butlerMatrixModel';

interface ButlerDiagramSVGProps {
  selectedPort: ButlerPortId;
  onSelectPort: (port: ButlerPortId) => void;
  phasesDeg: [number, number, number, number];
  amplitudes?: [number, number, number, number];
}

export const ButlerDiagramSVG: React.FC<ButlerDiagramSVGProps> = ({ selectedPort, onSelectPort, phasesDeg, amplitudes = [0.5,0.5,0.5,0.5] }) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const cfg = BUTLER_PORTS[selectedPort];
  const ys = [78, 168, 292, 382];
  const block = selectedBlock ? BUTLER_BLOCK_DETAILS[selectedBlock] : null;
  const line = '#475569';
  const active = cfg.beamColor;

  const Block = ({ id, x, y, w, h, fill, stroke, label, sub }: { id: string; x:number; y:number; w:number; h:number; fill:string; stroke:string; label:string; sub?:string }) => (
    <g role="button" tabIndex={0} aria-label={BUTLER_BLOCK_DETAILS[id]?.name || label}
      onClick={() => setSelectedBlock(selectedBlock === id ? null : id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedBlock(selectedBlock === id ? null : id); }}
      className="cursor-pointer outline-none">
      <rect x={x} y={y} width={w} height={h} rx="12" fill={fill} stroke={selectedBlock === id ? '#fff' : stroke} strokeWidth={selectedBlock === id ? 3 : 2}/>
      <text x={x+w/2} y={y+h/2-3} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="700">{label}</text>
      {sub && <text x={x+w/2} y={y+h/2+15} textAnchor="middle" fill="#cbd5e1" fontSize="11">{sub}</text>}
    </g>
  );

  return <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
    <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
      <div><h3 className="text-sm font-bold text-slate-100">Topología clásica de la Matriz Butler 4×4</h3><p className="text-xs text-slate-400">4 híbridos 90° + 2 desfasadores 45° + 2 crossovers. Toque un bloque para ver su función.</p></div>
      <div className="text-[11px] text-slate-400">Los cruces representan rutas independientes, no uniones eléctricas.</div>
    </div>
    <div className="p-2 sm:p-3">
      <svg viewBox="0 0 1040 460" className="block w-full h-auto max-h-[62vh]" preserveAspectRatio="xMidYMid meet" aria-label="Diagrama de una matriz Butler 4 por 4">
        <defs>
          <style>{`@keyframes flow{to{stroke-dashoffset:-28}} .flow{stroke-dasharray:8 6;animation:flow 1s linear infinite}`}</style>
        </defs>
        <g stroke="#1e293b" opacity=".35">{Array.from({length:21}).map((_,i)=><line key={i} x1={i*50} y1="0" x2={i*50} y2="460"/> )}</g>
        <g stroke={line} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {ys.map((y,i)=><path key={i} d={`M 70 ${y} H 970`} />)}
          <path d={`M 205 ${ys[0]} C 245 ${ys[0]} 245 ${ys[1]} 285 ${ys[1]}`} />
          <path d={`M 205 ${ys[1]} C 245 ${ys[1]} 245 ${ys[0]} 285 ${ys[0]}`} />
          <path d={`M 205 ${ys[2]} C 245 ${ys[2]} 245 ${ys[3]} 285 ${ys[3]}`} />
          <path d={`M 205 ${ys[3]} C 245 ${ys[3]} 245 ${ys[2]} 285 ${ys[2]}`} />
          <path d={`M 435 ${ys[1]} C 475 ${ys[1]} 485 ${ys[2]} 525 ${ys[2]}`} />
          <path d={`M 435 ${ys[2]} C 475 ${ys[2]} 485 ${ys[1]} 525 ${ys[1]}`} />
          <path d={`M 610 ${ys[0]} C 650 ${ys[0]} 650 ${ys[1]} 690 ${ys[1]}`} />
          <path d={`M 610 ${ys[1]} C 650 ${ys[1]} 650 ${ys[0]} 690 ${ys[0]}`} />
          <path d={`M 610 ${ys[2]} C 650 ${ys[2]} 650 ${ys[3]} 690 ${ys[3]}`} />
          <path d={`M 610 ${ys[3]} C 650 ${ys[3]} 650 ${ys[2]} 690 ${ys[2]}`} />
          <path d={`M 785 ${ys[1]} C 825 ${ys[1]} 835 ${ys[2]} 875 ${ys[2]}`} />
          <path d={`M 785 ${ys[2]} C 825 ${ys[2]} 835 ${ys[1]} 875 ${ys[1]}`} />
        </g>
        <g stroke={active} strokeWidth="5" fill="none" opacity=".95">
          <line className="flow" x1="70" y1={ys[['P1','P2','P3','P4'].indexOf(selectedPort)]} x2="205" y2={ys[['P1','P2','P3','P4'].indexOf(selectedPort)]}/>
          <g opacity=".38">{ys.map((y,i)=><line key={i} className="flow" x1="290" y1={y} x2="950" y2={y}/>)}</g>
        </g>
        <Block id="H1" x={210} y={103} w={70} h={40} fill="#075985" stroke="#38bdf8" label="Híbrido" sub="β₁ · 90°" />
        <Block id="H2" x={210} y={317} w={70} h={40} fill="#075985" stroke="#38bdf8" label="Híbrido" sub="β₁ · 90°" />
        <Block id="PS1" x={330} y={55} w={92} h={46} fill="#92400e" stroke="#fbbf24" label="Desfasador" sub="β₃ · 45°" />
        <Block id="PS2" x={330} y={359} w={92} h={46} fill="#92400e" stroke="#fbbf24" label="Desfasador" sub="β₃ · 45°" />
        <Block id="CR1" x={460} y={207} w={76} h={46} fill="#9a3412" stroke="#fb923c" label="Crossover" />
        <Block id="H3" x={615} y={103} w={70} h={40} fill="#075985" stroke="#38bdf8" label="Híbrido" sub="β₂ · 90°" />
        <Block id="H4" x={615} y={317} w={70} h={40} fill="#075985" stroke="#38bdf8" label="Híbrido" sub="β₂ · 90°" />
        <Block id="CR2" x={810} y={207} w={76} h={46} fill="#9a3412" stroke="#fb923c" label="Crossover" />
        {(['P1','P2','P3','P4'] as ButlerPortId[]).map((p,i)=><g key={p} onClick={()=>onSelectPort(p)} className="cursor-pointer"><rect x="15" y={ys[i]-20} width="50" height="40" rx="9" fill={p===selectedPort ? active : '#0f172a'} stroke={p===selectedPort ? '#fff' : '#64748b'} strokeWidth="2"/><text x="40" y={ys[i]+5} textAnchor="middle" fill="#fff" fontWeight="800">{p}</text></g>)}
        {ys.map((y,i)=><g key={i}><rect x="975" y={y-23} width="56" height="46" rx="9" fill="#0f172a" stroke={active} strokeWidth="2"/><text x="1003" y={y-3} textAnchor="middle" fill="#fff" fontWeight="800">O{i+1}</text><text x="1003" y={y+14} textAnchor="middle" fill="#cbd5e1" fontSize="10">{amplitudes[i].toFixed(2)}∠{moduloPhaseDeg(phasesDeg[i]).toFixed(0)}°</text></g>)}
      </svg>
    </div>
    <div className="px-4 pb-4 grid md:grid-cols-[1fr_auto] gap-3 items-start">
      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
        <strong className="text-cyan-300">{selectedPort}:</strong> la señal se divide y recombina por varias rutas simultáneas. En el caso ideal, las cuatro salidas tienen igual magnitud y fases relativas {phasesDeg.map(v=>`${v>0?'+':''}${v.toFixed(0)}°`).join(', ')}.
      </div>
      {block && <div className="max-w-md rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs"><div className="font-bold text-slate-100">{block.name}</div><div className="mt-1 text-slate-300">{block.role}</div><div className="mt-1 text-slate-400">{block.sMatrixConcept}</div></div>}
    </div>
  </div>;
};