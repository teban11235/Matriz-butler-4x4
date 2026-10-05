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
  return <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
    <div className="border-b border-slate-800 pb-3"><h3 className="font-bold text-slate-100">¿Por qué cambia la dirección del haz?</h3><p className="text-xs text-slate-400">Interferencia constructiva entre diferencia de camino espacial y fase eléctrica.</p></div>
    <div className="mt-4 grid lg:grid-cols-2 gap-5 text-xs">
      <div className="space-y-3 text-slate-300">
        <p>Entre elementos adyacentes, la diferencia de fase espacial en la dirección θ es <span className="font-mono text-amber-300">kd·sinθ</span>. Si la excitación tiene una progresión uniforme β, la diferencia total es:</p>
        <div className="rounded bg-slate-950 border border-slate-800 p-3 text-center"><MathView math="\psi(\theta)=kd\sin(\theta)+\beta" block/><MathView math="\psi(\theta_0)=0\pmod{2\pi}" block/></div>
        <p>Cuando esa condición se cumple, los fasores de los elementos llegan alineados y la suma es máxima. En otras direcciones se cancelan parcial o totalmente.</p>
        <div className="grid grid-cols-2 gap-2 font-mono"><div className="rounded bg-slate-950 p-2 border border-slate-800">d/λ={dOverLambda.toFixed(3)}<br/>kd={kdDeg.toFixed(1)}°</div><div className="rounded bg-slate-950 p-2 border border-slate-800">β={betaDeg===null?'—':`${betaDeg>=0?'+':''}${betaDeg.toFixed(1)}°`}<br/>θAF={thetaAfDeg===null?'sin solución':`${thetaAfDeg>=0?'+':''}${thetaAfDeg.toFixed(1)}°`}</div></div>
      </div>
      <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-4">
        <div className="flex justify-between"><span className="font-semibold text-slate-200">Explorador angular</span><button onClick={()=>setTheta(thetaAfDeg??0)} className="px-2 py-1 rounded bg-slate-800 text-cyan-300">Ir a θAF</button></div>
        <input className="w-full mt-3 accent-cyan-400" type="range" min="-90" max="90" step="0.5" value={theta} onChange={e=>setTheta(Number(e.target.value))}/>
        <div className="flex justify-between font-mono text-slate-400"><span>-90°</span><strong className="text-cyan-300">θ={theta>=0?'+':''}{theta.toFixed(1)}°</strong><span>+90°</span></div>
        <svg viewBox="0 0 300 210" className="w-full mt-2">
          <circle cx="150" cy="105" r="82" fill="none" stroke="#334155" strokeDasharray="4 4"/><line x1="55" y1="105" x2="245" y2="105" stroke="#334155"/><line x1="150" y1="10" x2="150" y2="200" stroke="#334155"/>
          {ph.individualPhasors.map((v,i)=>{const x2=150+65*v.real;const y2=105-65*v.imag;return <line key={i} x1="150" y1="105" x2={x2} y2={y2} stroke={['#38bdf8','#818cf8','#f472b6','#fbbf24'][i]} strokeWidth="2.5"/>})}
          <line x1="150" y1="105" x2={150+22*ph.resultant.real} y2={105-22*ph.resultant.imag} stroke="#34d399" strokeWidth="4"/>
        </svg>
        <div className="mt-2 text-center"><div className="font-mono text-emerald-300">Coherencia relativa: {coherence}%</div>{net!==null&&<div className="text-slate-500">ψ(θ)≈{net.toFixed(1)}° (sin reducir módulo 360°)</div>}</div>
      </div>
    </div>
  </div>;
};