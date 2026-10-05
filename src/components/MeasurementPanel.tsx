import React, { useRef, useState } from 'react';
import { dbToLinearAmplitude } from '../utils/electromagnetics';

interface Row { magnitudeDb:number; phaseDeg:number }
interface Props { onApply:(amplitudes:[number,number,number,number],phases:[number,number,number,number])=>void }

export const MeasurementPanel:React.FC<Props>=({onApply})=>{
  const [rows,setRows]=useState<Row[]>([
    {magnitudeDb:-6.02,phaseDeg:0},{magnitudeDb:-6.02,phaseDeg:-45},{magnitudeDb:-6.02,phaseDeg:-90},{magnitudeDb:-6.02,phaseDeg:-135}
  ]);
  const [message,setMessage]=useState('');
  const inputRef=useRef<HTMLInputElement>(null);
  const update=(i:number,key:keyof Row,v:number)=>setRows(r=>r.map((x,j)=>j===i?{...x,[key]:Number.isFinite(v)?v:0}:x));
  const apply=()=>{
    const amps=rows.map(r=>dbToLinearAmplitude(r.magnitudeDb)) as [number,number,number,number];
    const phases=rows.map(r=>r.phaseDeg) as [number,number,number,number];
    onApply(amps,phases); setMessage('Datos aplicados al arreglo.');
  };
  const loadCsv=async(file:File)=>{
    const text=await file.text(); const lines=text.trim().split(/\r?\n/).filter(Boolean); const parsed:Record<string,Row>={};
    for(const raw of lines.slice(lines[0].toLowerCase().includes('output')?1:0)){
      const [out,mag,phase]=raw.split(',').map(s=>s.trim());
      if(!/^O[1-4]$/.test(out)) continue; const m=Number(mag),p=Number(phase); if(Number.isFinite(m)&&Number.isFinite(p)) parsed[out]={magnitudeDb:m,phaseDeg:p};
    }
    if(['O1','O2','O3','O4'].every(k=>parsed[k])){ setRows(['O1','O2','O3','O4'].map(k=>parsed[k])); setMessage('CSV cargado. Revise la tabla y pulse “Usar estos datos”.'); }
    else setMessage('CSV inválido. Se requieren O1–O4 con magnitud_dB y fase_deg.');
  };
  return <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-5 shadow-xl">
    <div className="border-b border-slate-800 pb-3"><h3 className="font-bold text-slate-100">De la teoría a la medición VNA</h3><p className="text-xs text-slate-400">Use magnitud y fase medidas en S(Oi,Pj) para predecir el patrón del arreglo.</p></div>
    <div className="mt-4 grid grid-cols-1 gap-2 sm:hidden">{rows.map((r,i)=><div key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-cyan-300">O{i+1}</strong><span className="font-mono text-[11px] text-slate-400">A={dbToLinearAmplitude(r.magnitudeDb).toFixed(4)}</span></div><div className="grid grid-cols-2 gap-2"><label className="text-[11px] text-slate-400">Magnitud [dB]<input className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100" type="number" step="0.1" value={r.magnitudeDb} onChange={e=>update(i,'magnitudeDb',Number(e.target.value))}/></label><label className="text-[11px] text-slate-400">Fase [°]<input className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100" type="number" step="0.5" value={r.phaseDeg} onChange={e=>update(i,'phaseDeg',Number(e.target.value))}/></label></div></div>)}</div>
    <div className="mt-4 hidden overflow-x-auto sm:block"><table className="w-full text-xs"><thead><tr className="text-slate-400"><th className="text-left p-2">Salida</th><th className="text-left p-2">Magnitud [dB]</th><th className="text-left p-2">Fase [°]</th><th className="text-left p-2">Amplitud lineal</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-t border-slate-800"><td className="p-2 font-bold text-cyan-300">O{i+1}</td><td className="p-2"><input className="w-24 lg:w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1" type="number" step="0.1" value={r.magnitudeDb} onChange={e=>update(i,'magnitudeDb',Number(e.target.value))}/></td><td className="p-2"><input className="w-24 lg:w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1" type="number" step="0.5" value={r.phaseDeg} onChange={e=>update(i,'phaseDeg',Number(e.target.value))}/></td><td className="p-2 font-mono">{dbToLinearAmplitude(r.magnitudeDb).toFixed(4)}</td></tr>)}</tbody></table></div>
    <div className="mt-4 flex flex-wrap gap-2"><button onClick={apply} className="px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold">Usar estos datos en el arreglo</button><button onClick={()=>inputRef.current?.click()} className="px-3 py-2 rounded border border-slate-700 text-xs">Importar CSV local</button><input ref={inputRef} className="hidden" type="file" accept=".csv,text/csv" onChange={e=>{const f=e.target.files?.[0]; if(f) loadCsv(f)}}/></div>
    <div className="mt-2 text-[11px] text-slate-500">Formato CSV: output,magnitude_db,phase_deg; por ejemplo O1,-6.8,0. Los datos se procesan localmente en el navegador.</div>{message&&<div className="mt-2 text-xs text-amber-300">{message}</div>}
  </div>;
};