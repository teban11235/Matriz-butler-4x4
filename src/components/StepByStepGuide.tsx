import React, { useState } from 'react';
import { ButlerPortId, EducationalScenario } from '../types/microwave';

interface StepByStepGuideProps {
  currentPort: ButlerPortId;
  onSelectPort: (port: ButlerPortId) => void;
  onApplyScenario: (scenario: EducationalScenario | null) => void;
}

const scenarios: { title:string; subtitle:string; body:React.ReactNode; scenario: EducationalScenario | null }[] = [
  {
    title:'Paso 1: Una antena individual', subtitle:'Patrón del elemento radiador aislado',
    body:<><p>Solo A1 está activa. El patrón mostrado corresponde al modelo pedagógico del elemento, sin la contribución de un arreglo de cuatro antenas.</p><p className="font-mono text-cyan-300">a = [1, 0, 0, 0], φ = [0°, 0°, 0°, 0°]</p></>,
    scenario:{id:'single',title:'Una antena',description:'Solo el primer elemento está activo.',amplitudes:[1,0,0,0],phasesDeg:[0,0,0,0],betaDeg:null,useButler:false}
  },
  {
    title:'Paso 2: Cuatro antenas en fase', subtitle:'Aparece el factor de arreglo y aumenta la directividad',
    body:<><p>Las cuatro antenas tienen la misma amplitud y fase. El máximo permanece en broadside, pero el haz se hace más estrecho.</p><p className="font-mono text-emerald-300">a = [1,1,1,1], β = 0°, θAF = 0°</p></>,
    scenario:{id:'in-phase',title:'Cuatro antenas en fase',description:'Arreglo uniforme sin progresión de fase.',amplitudes:[1,1,1,1],phasesDeg:[0,0,0,0],betaDeg:0,useButler:false}
  },
  {
    title:'Paso 3: Introducir una progresión de fase', subtitle:'Beam steering sin mover las antenas',
    body:<><p>Una progresión uniforme de fase inclina el frente de onda. Para d=λ/2 y β=-45°, el máximo del array factor aparece cerca de +14.5°.</p><p className="font-mono text-amber-300">φ = [0°, -45°, -90°, -135°]</p></>,
    scenario:{id:'progressive',title:'Progresión -45°',description:'Ejemplo de beam steering mediante fase.',amplitudes:[1,1,1,1],phasesDeg:[0,-45,-90,-135],betaDeg:-45,useButler:false}
  },
  {
    title:'Paso 4: ¿Quién genera esas fases?', subtitle:'La matriz Butler como red pasiva multiport',
    body:<p>La Butler combina 4 híbridos de 90°, 2 desfasadores de 45° y 2 crossovers. Físicamente realiza una transformación espacial pasiva relacionada con una DFT discreta; no es un amplificador ni una FFT digital.</p>,
    scenario:null
  },
  {
    title:'Paso 5: Seleccionar P1, P2, P3 o P4', subtitle:'Cada entrada selecciona un estado de fase discreto',
    body:<div className="grid grid-cols-2 gap-2 font-mono text-[11px]"><div>P1: β=-45°</div><div>P2: β=-135°</div><div>P3: β=+135°</div><div>P4: β=+45°</div></div>,
    scenario:null
  },
  {
    title:'Paso 6: Cadena completa', subtitle:'Butler → salidas → antenas → patrón',
    body:<p>La Butler fija amplitudes/fases; el arreglo convierte esas excitaciones en un factor de arreglo; el patrón total resulta de multiplicar el patrón del elemento por el factor de arreglo.</p>,
    scenario:null
  }
];

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ currentPort, onSelectPort, onApplyScenario }) => {
  const [step,setStep]=useState(1);
  const activate=(n:number)=>{ setStep(n); onApplyScenario(scenarios[n-1].scenario); };
  return <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-5 shadow-xl">
    <div className="flex flex-wrap justify-between gap-3 border-b border-slate-800 pb-3">
      <div><h3 className="font-bold text-slate-100">Ruta pedagógica paso a paso</h3><p className="text-xs text-slate-400">Distingue una antena, un arreglo y la función específica de la Butler.</p></div>
      <div className="flex gap-1">{scenarios.map((_,i)=><button key={i} onClick={()=>activate(i+1)} className={`w-8 h-8 rounded ${step===i+1?'bg-violet-600':'bg-slate-800 text-slate-300'}`}>{i+1}</button>)}</div>
    </div>
    <div className="mt-4 rounded-lg bg-slate-950/70 border border-slate-800 p-4 text-xs text-slate-300 space-y-3">
      <div><div className="font-bold text-violet-300">{scenarios[step-1].title}</div><div className="text-slate-400">{scenarios[step-1].subtitle}</div></div>
      {scenarios[step-1].body}
      {step===5 && <div className="flex flex-wrap gap-2">{(['P1','P2','P3','P4'] as ButlerPortId[]).map(p=><button key={p} onClick={()=>onSelectPort(p)} className={`px-3 py-2 rounded border ${currentPort===p?'border-cyan-400 text-cyan-300 bg-cyan-950/30':'border-slate-700 bg-slate-900'}`}>{p}</button>)}</div>}
    </div>
  </div>;
};