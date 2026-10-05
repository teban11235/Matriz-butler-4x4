import React, { useMemo, useState } from 'react';
import { calculatePhasorsAtAngle } from '../utils/electromagnetics';
import { MathView } from './MathView';

interface InterferenceExplanationProps {
  frequencyGhz: number;
  dOverLambda: number;
  amplitudes: [number,number,number,number];
  phasesDeg: [number,number,number,number];
  betaDeg: number | null;
  thetaAfDeg: number | null;
}

export const InterferenceExplanation:React.FC<InterferenceExplanationProps>=({frequencyGhz,dOverLambda,amplitudes,phasesDeg,betaDeg,thetaAfDeg})=>{
  const [theta,setTheta]=useState(thetaAfDeg ?? 0);
  const ph=useMemo(()=>calculatePhasorsAtAngle(theta,frequencyGhz*1e9,dOverLambda,amplitudes,phasesDeg),[theta,frequencyGhz,dOverLambda,amplitudes,phasesDeg]);
  const max=amplitudes.reduce((a,b)=>a+b,0)||1;
  const coherence=Math.min(100,Math.round(100*ph.resultant.mag/max));
  const kdDeg=360*dOverLambda;
  const net=betaDeg===null?null:kdDeg*Math.sin(theta*Math.PI/180)+betaDeg;
  return <div className="rounded-xl border border-slate-300 bg-white p-4 sm:p-5 shadow-xl">
    <div className="border-b border-slate-200 pb-3"><h3 className="font-bold text-slate-900">¿Por qué cambia la dirección del haz?</h3><p className="text-xs text-slate-600">Interferencia constructiva entre diferencia de camino espacial y fase eléctrica.</p></div>
    <div className="mt-4 grid items-start lg:grid-cols-[1.05fr_.95fr] gap-4 text-sm">
      <div className="space-y-3 text-slate-700">
        <p>Entre elementos adyacentes, la diferencia de fase espacial en la dirección θ es <span className="font-mono text-amber-300">kd·sinθ</span>. Si la excitación tiene una progresión uniforme β, la diferencia total es:</p>
        <div className="rounded bg-slate-950 border border-slate-200 p-3 text-center"><MathView math="\psi(\theta)=kd\sin(\theta)+\beta" block/><MathView math="\psi(\theta_0)=0\pmod{2\pi}" block/></div>
        <p>Cuando esa condición se cumple, los fasores de los elementos llegan alineados y la suma es máxima. En otras direcciones se cancelan parcial o totalmente.</p>
        <div className="grid grid-cols-2 gap-2 font-mono"><div className="rounded bg-slate-950 p-2 border border-slate-200">d/λ={dOverLambda.toFixed(3)}<br/>kd={kdDeg.toFixed(1)}°</div><div className="rounded bg-slate-950 p-2 border border-slate-200">β={betaDeg===null?'—':`${betaDeg>=0?'+':''}${betaDeg.toFixed(1)}°`}<br/>θAF={thetaAfDeg===null?'sin solución':`${thetaAfDeg>=0?'+':''}${thetaAfDeg.toFixed(1)}°`}</div></div>
      </div>
      <div className="rounded-lg bg-slate-950/80 border border-slate-200 p-4">
        <div className="flex justify-between"><span className="font-semibold text-slate-200">Explorador angular</span><button onClick={()=>setTheta(thetaAfDeg??0)} className="px-3 py-1.5 rounded border border-cyan-300 bg-cyan-50 text-cyan-800 text-sm font-semibold">Ir a θAF</button></div>
        <input className="w-full mt-3 accent-cyan-400" type="range" min="-90" max="90" step="0.5" value={theta} onChange={e=>setTheta(Number(e.target.value))}/>
        <div className="flex justify-between font-mono text-slate-600"><span>-90°</span><strong className="text-cyan-300">θ={theta>=0?'+':''}{theta.toFixed(1)}°</strong><span>+90°</span></div>
        <svg viewBox="0 0 300 170" className="w-full mt-2 max-h-[260px]">
          <circle cx="150" cy="85" r="66" fill="none" stroke="#94a3b8" strokeDasharray="4 4"/><line x1="75" y1="85" x2="225" y2="85" stroke="#334155"/><line x1="150" y1="12" x2="150" y2="158" stroke="#334155"/>
          {ph.individualPhasors.map((v,i)=>{const x2=150+65*v.real;const y2=105-65*v.imag;return <line key={i} x1="150" y1="85" x2={x2} y2={y2} stroke={['#38bdf8','#818cf8','#f472b6','#fbbf24'][i]} strokeWidth="2.5"/>})}
          <line x1="150" y1="85" x2={150+18*ph.resultant.real} y2={85-18*ph.resultant.imag} stroke="#34d399" strokeWidth="4"/>
        </svg>
        <div className="mt-2 text-center"><div className="font-mono text-emerald-300">Coherencia relativa: {coherence}%</div>{net!==null&&<div className="text-slate-500">ψ(θ)≈{net.toFixed(1)}° (sin reducir módulo 360°)</div>}</div>
      </div>
    </div>
  </div>;
};