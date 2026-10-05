import React, { useState } from 'react';
import { MathView } from './MathView';

export const ButlerBlocksInfo: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const questions = [
    {
      id: 1,
      q: '1. ¿Qué es una matriz Butler y por qué se considera una red formadora de haz pasiva?',
      a: 'Es una red de microondas de N entradas y N salidas (NxN) compuesta exclusivamente por componentes pasivos lineales (acopladores híbridos de 90°, desfasadores fijos y crossovers). Implementa físicamente una transformación espacial pasiva relacionada con una matriz DFT discreta, distribuyendo la potencia con relaciones de fase definidas sin requerir amplificación ni desfasadores sintonizables.',
    },
    {
      id: 2,
      q: '2. ¿Qué función electromagnética cumplen los híbridos de 90° (branch-line)?',
      a: 'Dividen la potencia incidente de un puerto equitativamente (balance de 3 dB) entre dos puertos de salida, introduciendo una diferencia de fase en cuadratura exacta de 90° (-π/2 rad) entre la rama directa y la rama acoplada. En el caso ideal, el cuarto puerto queda aislado. El nivel de aislamiento real depende del diseño, la frecuencia y la fabricación.',
    },
    {
      id: 3,
      q: '3. ¿Qué función cumplen los crossovers y por qué son críticos en planaridad?',
      a: 'Permiten que dos líneas de transmisión de RF se crucen geométricamente en el mismo sustrato planar sin que exista contacto galvánico ni acoplamiento parásito entre las señales (con aislamiento entre rutas que debe verificarse mediante simulación y medición). Se implementan comúnmente con puentes de aire (air-bridges), cascada de acopladores híbridos de 0 dB o transiciones a través de vías en PCBs multicapa.',
    },
    {
      id: 4,
      q: '4. ¿Qué función cumplen los desfasadores de 45°?',
      a: 'Introducen un retardo de fase eléctrico estático calibrado de 45° (π/4 rad) en las ramas exteriores de la red. En tecnología microstrip se realizan simplemente extendiendo la longitud física de la pista una distancia ΔL = λ_g / 8, donde λ_g es la longitud de onda guiada en el dieléctrico.',
    },
    {
      id: 5,
      q: '5. ¿Por qué existen 4 puertos de entrada en una matriz 4×4?',
      a: 'Porque la matriz ideal define cuatro vectores de excitación ortogonales en sus puertos de salida. Cada puerto de entrada selecciona uno de esos estados de amplitud/fase y, al alimentar el arreglo, produce un haz discreto diferente. La ortogonalidad se refiere a los vectores/modos de excitación ideales, no a una afirmación literal de ortogonalidad geométrica entre haces en el espacio libre.',
    },
    {
      id: 6,
      q: '6. ¿Qué cambia internamente cuando seleccionamos P1, P2, P3 o P4?',
      a: 'Cambia la ruta por la que la señal electromagnética atraviesa los acopladores en cuadratura y desfasadores. Cada puerto inyecta en una combinación distinta de puertos de entrada de los híbridos de la primera etapa, sintetizando en las salidas O1–O4 progresiones de fase discretas: Δφ = -45°, -135°, +135° o +45° respectivamente.',
    },
    {
      id: 7,
      q: '7. ¿Por qué las 4 antenas reciben la misma amplitud pero diferente fase?',
      a: 'Por la conservación de la energía en una red pasiva sin pérdidas unitaria: la potencia de entrada P_in se divide equitativamente entre las 4 antenas (|a_n| = 1/2 en voltaje, es decir, 1/4 de potencia o -6 dB por antena). La diferencia reside exclusivamente en los retardos temporales (fases) acumulados en cada trayectoria.',
    },
    {
      id: 8,
      q: '8. ¿Cómo esas fases cambian la dirección del haz en el espacio libre?',
      a: 'Las ondas electromagnéticas radiadas se propagan y se superponen en el campo lejano. En la dirección θ₀ donde la diferencia de camino geométrico kd·sin(θ₀) compensa exactamente la diferencia de fase eléctrica β, todas las ondas llegan con crestas en fase (interferencia constructiva), creando el lóbulo principal. En otras direcciones, los fasores se cancelan (interferencia destructiva).',
    },
    {
      id: 9,
      q: '9. ¿Cuál es la diferencia física entre el patrón del elemento y el factor de arreglo?',
      a: 'El patrón del elemento E_element(θ) describe las propiedades de radiación inherentes de una sola antena patch aislada (depende de su geometría, sustrato y cavidad). El Factor de Arreglo AF(θ) depende únicamente de la geometría del conjunto, número de elementos, su espaciado y las amplitudes/fases relativas. El patrón total resulta del producto coherente: E_total(θ) = E_element(θ) × AF(θ).',
    },
    {
      id: 10,
      q: '10. ¿Por qué la matriz Butler produce haces discretos fijos y no un barrido continuo?',
      a: 'Porque la matriz Butler está construida con componentes pasivos de longitudes y acoplamientos fijos (hardwired). No posee desfasadores continuos analógicos o diodos varactores sintonizables. Es un sistema "switched-beam" (conmutación de haces fijos discretos), donde un conmutador de RF simplemente conmuta entre los puertos P1–P4 para seleccionar la dirección requerida.',
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-400"></span>
            ¿Qué hace cada bloque dentro de la Matriz Butler 4×4?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Fundamentos de ingeniería de microondas y parámetros de dispersión (S)
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-950/70 border border-sky-800/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sky-500"></span>
              <h4 className="text-xs font-bold text-sky-300">Acoplador Híbrido 90° (Branch-Line)</h4>
            </div>
            <p className="text-xs text-slate-300">Dispositivo pasivo recíproco de 4 puertos con acoplamiento de 3 dB:</p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
              <li>Divide la potencia equitativamente: <span className="font-mono text-slate-200">|S21| = |S31| = 1/√2</span></li>
              <li>Introduce 90° de desfase: <span className="font-mono text-slate-200">∠S31 - ∠S21 = -90°</span></li>
              <li>Aislamiento en puerto 4: <span className="font-mono text-slate-200">S41 ≈ 0</span></li>
              <li>Adaptación de impedancia en todos los puertos (<span className="font-mono">Z0 = 50 Ω</span>).</li>
            </ul>
          </div>

          <div className="rounded-lg bg-slate-950/70 border border-amber-800/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <h4 className="text-xs font-bold text-amber-300">Desfasador Fijo de 45°</h4>
            </div>
            <p className="text-xs text-slate-300">Retardo de fase por longitud eléctrica calibrada:</p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
              <li>Desfase exacto de π/4 rad: <span className="font-mono text-slate-200">Δφ = -45°</span></li>
              <li>Diferencia de longitud de pista: <span className="font-mono text-slate-200">ΔL = λ_g / 8</span></li>
              <li>Mantiene idéntica impedancia característica <span className="font-mono">50 Ω</span></li>
              <li>La pérdida de inserción real debe obtenerse de la simulación EM o de la medición del prototipo.</li>
            </ul>
          </div>

          <div className="rounded-lg bg-slate-950/70 border border-orange-800/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-500"></span>
              <h4 className="text-xs font-bold text-orange-300">Crossover (Cruce de Líneas)</h4>
            </div>
            <p className="text-xs text-slate-300">Permite el cruce geométrico de dos líneas de RF en un mismo circuito:</p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
              <li>El aislamiento entre rutas es una métrica de diseño y debe verificarse experimentalmente.</li>
              <li>Transmisión directa casi sin pérdidas (<span className="font-mono text-slate-200">S21 ≈ 1</span>)</li>
              <li>Cruces sin contacto eléctrico (evita cortocircuitos)</li>
              <li>Fases idénticas para preservar la simetría.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-950/90 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <span>⚡ Aclaración Técnica Fundamental sobre la Energía:</span>
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            La Matriz Butler <strong>no es un amplificador</strong> y <strong>no crea potencia adicional</strong>. Por el principio de conservación de energía en redes pasivas, la potencia total irradiada en todas las direcciones del espacio es igual a la potencia inyectada (menos pequeñas pérdidas en el cobre y dieléctrico). El aumento de potencia recibida en la dirección <span className="font-mono text-cyan-300">θ₀</span> se debe exclusivamente al aumento de <strong>DIRECTIVIDAD</strong>: la matriz concentra la radiación en una dirección espacial estrecha a expensas de cancelarla en el resto del espacio.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
            10 Preguntas Clave de Autoevaluación Universitaria
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Haga clic en cada pregunta para desplegar la respuesta técnica razonada</p>
        </div>

        <div className="mt-4 space-y-2.5">
          {questions.map((item) => {
            const isOpen = openQuestion === item.id;
            return (
              <div key={item.id} className="rounded-lg bg-slate-950/70 border border-slate-800/80 overflow-hidden transition-all">
                <button
                  onClick={() => setOpenQuestion(isOpen ? null : item.id)}
                  className="w-full text-left px-4 py-3 text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between gap-3 focus:outline-none"
                >
                  <span className="font-semibold">{item.q}</span>
                  <span className="text-xs font-mono text-cyan-400 shrink-0">{isOpen ? '▲ Ocultar' : '▼ Ver Respuesta'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed bg-slate-950/90">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};