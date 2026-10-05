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

const fmt = (v: number | null) => v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}°`;

export const AntennaArrayVisualizer: React.FC<AntennaArrayVisualizerProps> = ({
  selectedPort,
  phasesDeg,
  amplitudes,
  dMm,
  dOverLambda,
  thetaAfDeg,
  thetaTotalDeg,
}) => {
  const cfg = BUTLER_PORTS[selectedPort];

  // Geometry is intentionally kept in separate vertical bands so labels never
  // overlap the patches, the ground plane or the spacing dimensions.
  const xs = [175, 355, 535, 715];
  const patchY = 205;
  const groundY = 260;
  const dimensionY = 304;

  const angle = thetaTotalDeg * Math.PI / 180;
  const beamOriginX = 445;
  const beamOriginY = 168;
  const beamLength = 118;
  const beamX = beamOriginX + beamLength * Math.sin(angle);
  const beamY = beamOriginY - beamLength * Math.cos(angle);
  const beamLabelX = beamX + (thetaTotalDeg >= 0 ? 12 : -12);
  const beamLabelAnchor = thetaTotalDeg >= 0 ? 'start' : 'end';

  const maxAmp = Math.max(...amplitudes, 1e-9);

  return (
    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-4 sm:p-5 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Arreglo lineal de 4 antenas patch</h3>
          <p className="mt-0.5 text-sm text-slate-600">
            O1→A1, O2→A2, O3→A3, O4→A4 · d={dMm.toFixed(1)} mm = {dOverLambda.toFixed(3)}λ₀
          </p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-mono">
          <span className="text-slate-600">θAF:</span>{' '}
          <span className="font-semibold text-cyan-700">{fmt(thetaAfDeg)}</span>
          <span className="mx-2 text-slate-400">·</span>
          <span className="text-slate-600">θTotal:</span>{' '}
          <strong style={{ color: cfg.beamColor }}>{fmt(thetaTotalDeg)}</strong>
        </div>
      </div>

      <div className="mt-2">
        <svg
          viewBox="0 0 900 342"
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Arreglo lineal de cuatro antenas patch con fases de excitación y dirección del haz"
        >
          <defs>
            <marker id="beamArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={cfg.beamColor} />
            </marker>
          </defs>

          {/* Broadside reference and main beam */}
          <line
            x1={beamOriginX}
            y1={beamOriginY}
            x2={beamOriginX}
            y2="30"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <text x={beamOriginX + 12} y="42" fill="#64748b" fontSize="14" fontWeight="600">
            0° broadside
          </text>

          <line
            x1={beamOriginX}
            y1={beamOriginY}
            x2={beamX}
            y2={beamY}
            stroke={cfg.beamColor}
            strokeWidth="5"
            markerEnd="url(#beamArrow)"
          />
          <text
            x={beamLabelX}
            y={Math.max(24, beamY - 8)}
            textAnchor={beamLabelAnchor}
            fill={cfg.beamColor}
            fontSize="15"
            fontWeight="800"
          >
            θTotal={fmt(thetaTotalDeg)}
          </text>

          {/* Antennas and excitation phasors */}
          {xs.map((x, i) => {
            const amp = amplitudes[i];
            const phase = phasesDeg[i];
            const pr = phase * Math.PI / 180;
            const r = 28 * Math.min(1, amp / maxAmp);
            const phasorY = patchY - 31;

            return (
              <g key={i} opacity={amp < 1e-6 ? 0.25 : 1}>
                <line
                  x1={x}
                  y1={phasorY}
                  x2={x + r * Math.cos(pr)}
                  y2={phasorY - r * Math.sin(pr)}
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx={x} cy={phasorY} r="3" fill="#0284c7" />

                <rect
                  x={x - 43}
                  y={patchY - 17}
                  width="86"
                  height="34"
                  rx="5"
                  fill="#d97706"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={patchY + 5}
                  fill="#ffffff"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="800"
                >
                  A{i + 1}
                </text>

                <text
                  x={x}
                  y={patchY + 39}
                  fill="#334155"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                >
                  A={amp.toFixed(2)} · φ={phase >= 0 ? '+' : ''}{phase.toFixed(0)}°
                </text>
              </g>
            );
          })}

          {/* Ground plane */}
          <line
            x1="95"
            y1={groundY}
            x2="805"
            y2={groundY}
            stroke="#64748b"
            strokeWidth="8"
          />
          <text
            x="450"
            y={groundY + 24}
            fill="#475569"
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
          >
            Plano de masa / sustrato (esquema pedagógico)
          </text>

          {/* Element spacing dimensions */}
          {xs.slice(0, -1).map((x, i) => {
            const nextX = xs[i + 1];
            return (
              <g key={i}>
                <line x1={x} y1={dimensionY} x2={nextX} y2={dimensionY} stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={x} y1={dimensionY - 7} x2={x} y2={dimensionY + 7} stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={nextX} y1={dimensionY - 7} x2={nextX} y2={dimensionY + 7} stroke="#94a3b8" strokeWidth="1.5" />
                <text
                  x={(x + nextX) / 2}
                  y={dimensionY + 22}
                  fill="#64748b"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                >
                  d={dMm.toFixed(1)} mm
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        Las antenas permanecen físicamente fijas. La dirección del haz cambia porque las excitaciones tienen fases distintas.{' '}
        <strong className="text-cyan-700">θAF</strong> es el máximo predicho por el factor de arreglo uniforme;{' '}
        <strong className="text-emerald-700">θTotal</strong> incluye el patrón del elemento.
      </div>
    </div>
  );
};
