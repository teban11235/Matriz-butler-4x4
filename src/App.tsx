import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Layers,
  Radio,
  RotateCcw,
  Settings,
  Upload,
} from 'lucide-react';
import { ButlerPortId, EducationalScenario, SimulationParameters } from './types/microwave';
import { BUTLER_PORTS, getButlerOutput, moduloPhaseDeg } from './utils/butlerMatrixModel';
import {
  calculateBeamAngle,
  calculatePatternsRange,
  calculateWavelength,
  calculateWavenumber,
  deriveProgressivePhaseDeg,
  findGratingLobes,
  findPatternMetrics,
} from './utils/electromagnetics';
import { ButlerDiagramSVG } from './components/ButlerDiagramSVG';
import { AntennaArrayVisualizer } from './components/AntennaArrayVisualizer';
import { PolarPlot } from './components/PolarPlot';
import { DataPanel } from './components/DataPanel';
import { InterferenceExplanation } from './components/InterferenceExplanation';
import { StepByStepGuide } from './components/StepByStepGuide';
import { AdvancedParametersPanel } from './components/AdvancedParametersPanel';
import { ButlerBlocksInfo } from './components/ButlerBlocksInfo';
import { MeasurementPanel } from './components/MeasurementPanel';

const defaultParams: SimulationParameters = {
  frequencyGhz: 2.45,
  spacingMode: 'normalized',
  dOverLambda: 0.5,
  physicalSpacingMm: 61.18,
  elementPowerQ: 1,
  phaseErrorsDeg: [0, 0, 0, 0],
  amplitudeWeights: [1, 1, 1, 1],
  isNonIdealMode: false,
};

type Tab = 'simulator' | 'pattern' | 'guided' | 'theory' | 'advanced' | 'measurement';

type PortSelectorProps = {
  selectedPort: ButlerPortId;
  onSelect: (port: ButlerPortId) => void;
  scenarioActive?: boolean;
  measurementActive?: boolean;
  compact?: boolean;
};

function PortSelector({ selectedPort, onSelect, scenarioActive, measurementActive, compact = false }: PortSelectorProps) {
  return (
    <section className={`rounded-xl border border-slate-300 bg-white ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Control de excitación</div>
          <h2 className="text-base font-bold text-slate-900">Seleccione el puerto de alimentación</h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          P1–P4 selecciona estados discretos de fase. Al elegir un puerto se vuelve al modelo Butler ideal.
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(['P1', 'P2', 'P3', 'P4'] as ButlerPortId[]).map((p) => {
          const cfg = BUTLER_PORTS[p];
          const isActive = selectedPort === p && !scenarioActive && !measurementActive;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onSelect(p)}
              className={`min-h-16 rounded-lg border-2 bg-white px-4 py-3 text-left transition shadow-sm ${
                isActive ? 'ring-1 ring-white/30' : 'hover:border-slate-600'
              }`}
              style={{ borderColor: isActive ? cfg.beamColor : '#1e293b' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-black" style={{ color: cfg.beamColor }}>{p}</span>
                <span className="text-sm font-mono text-slate-600">β={cfg.betaDeg > 0 ? '+' : ''}{cfg.betaDeg}°</span>
              </div>
              <div className="mt-1 text-sm font-medium text-slate-600">θAF≈{cfg.theoreticalThetaDeg > 0 ? '+' : ''}{cfg.theoreticalThetaDeg.toFixed(1)}°</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function fmtAngle(v: number | null) {
  return v === null ? 'sin solución' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}°`;
}

export default function App() {
  const [selectedPort, setSelectedPort] = useState<ButlerPortId>('P1');
  const [params, setParams] = useState<SimulationParameters>(defaultParams);
  const [activeTab, setActiveTab] = useState<Tab>('simulator');
  const [scenario, setScenario] = useState<EducationalScenario | null>(null);
  const [measurement, setMeasurement] = useState<{
    amplitudes: [number, number, number, number];
    phases: [number, number, number, number];
  } | null>(null);
  const [showElement, setShowElement] = useState(true);
  const [showArrayFactor, setShowArrayFactor] = useState(true);
  const [showTotal, setShowTotal] = useState(true);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareCurrent, setCompareCurrent] = useState(false);

  const butler = getButlerOutput(selectedPort);
  const baseAmplitudes = useMemo<[number, number, number, number]>(
    () => scenario?.amplitudes ?? measurement?.amplitudes ?? butler.amplitudes,
    [scenario, measurement, butler]
  );
  const basePhases = useMemo<[number, number, number, number]>(
    () => scenario?.phasesDeg ?? measurement?.phases ?? butler.phasesDeg,
    [scenario, measurement, butler]
  );
  const effectiveAmplitudes = useMemo<[number, number, number, number]>(
    () => baseAmplitudes.map((a, i) => a * (params.isNonIdealMode ? params.amplitudeWeights[i] : 1)) as [number, number, number, number],
    [baseAmplitudes, params.isNonIdealMode, params.amplitudeWeights]
  );
  const effectivePhases = useMemo<[number, number, number, number]>(
    () => basePhases.map((v, i) => v + (params.isNonIdealMode ? params.phaseErrorsDeg[i] : 0)) as [number, number, number, number],
    [basePhases, params.isNonIdealMode, params.phaseErrorsDeg]
  );

  const wavelengthM = calculateWavelength(params.frequencyGhz * 1e9);
  const wavelengthMm = wavelengthM * 1000;
  const separationM = params.spacingMode === 'normalized' ? params.dOverLambda * wavelengthM : params.physicalSpacingMm / 1000;
  const separationMm = separationM * 1000;
  const effectiveDOverLambda = separationM / wavelengthM;
  const k = calculateWavenumber(wavelengthM);
  const kdDeg = k * separationM * 180 / Math.PI;
  const effectiveBeta = useMemo(
    () => scenario?.betaDeg ?? deriveProgressivePhaseDeg(effectivePhases, effectiveAmplitudes),
    [scenario, effectivePhases, effectiveAmplitudes]
  );
  const thetaAf = effectiveBeta === null ? null : calculateBeamAngle(effectiveBeta * Math.PI / 180, k, separationM);
  const gratingLobes = effectiveBeta === null ? [] : findGratingLobes(effectiveBeta * Math.PI / 180, k, separationM);

  const patternPoints = useMemo(
    () => calculatePatternsRange(
      params.frequencyGhz * 1e9,
      effectiveDOverLambda,
      effectiveAmplitudes,
      effectivePhases,
      params.elementPowerQ,
      0.5
    ),
    [params.frequencyGhz, effectiveDOverLambda, effectiveAmplitudes, effectivePhases, params.elementPowerQ]
  );
  const totalMetrics = useMemo(() => findPatternMetrics(patternPoints, 'total'), [patternPoints]);

  const selectPort = (p: ButlerPortId) => {
    setSelectedPort(p);
    setScenario(null);
    setMeasurement(null);
  };
  const reset = () => {
    setParams(defaultParams);
    setScenario(null);
    setMeasurement(null);
    setIsCompareMode(false);
  };
  const applyMeasurement = (
    amplitudes: [number, number, number, number],
    phases: [number, number, number, number]
  ) => {
    setMeasurement({ amplitudes, phases });
    setScenario(null);
    setParams((p) => ({
      ...p,
      isNonIdealMode: false,
      amplitudeWeights: [1, 1, 1, 1],
      phaseErrorsDeg: [0, 0, 0, 0],
    }));
  };

  const nav: [Tab, string, React.ReactNode][] = [
    ['simulator', 'Butler', <Layers className="h-4 w-4" />],
    ['pattern', 'Patrón', <BarChart3 className="h-4 w-4" />],
    ['guided', 'Paso a paso', <Activity className="h-4 w-4" />],
    ['theory', 'Bloques', <BookOpen className="h-4 w-4" />],
    ['advanced', 'Explorar', <Settings className="h-4 w-4" />],
    ['measurement', 'Medición', <Upload className="h-4 w-4" />],
  ];

  const sharedPlot = (
    <PolarPlot
      selectedPort={selectedPort}
      points={patternPoints}
      frequencyGhz={params.frequencyGhz}
      dOverLambda={effectiveDOverLambda}
      elementPowerQ={params.elementPowerQ}
      isCompareMode={isCompareMode}
      onToggleCompareMode={() => setIsCompareMode((v) => !v)}
      showElement={showElement}
      showArrayFactor={showArrayFactor}
      showTotal={showTotal}
      onToggleElement={() => setShowElement((v) => !v)}
      onToggleArrayFactor={() => setShowArrayFactor((v) => !v)}
      onToggleTotal={() => setShowTotal((v) => !v)}
      compareCurrent={compareCurrent}
      onToggleCompareCurrent={() => setCompareCurrent((v) => !v)}
      amplitudeWeights={params.isNonIdealMode ? params.amplitudeWeights : [1, 1, 1, 1]}
      phaseErrorsDeg={params.isNonIdealMode ? params.phaseErrorsDeg : [0, 0, 0, 0]}
    />
  );

  const dataPanel = (
    <DataPanel
      selectedPort={selectedPort}
      frequencyGhz={params.frequencyGhz}
      wavelengthMm={wavelengthMm}
      separationMm={separationMm}
      dOverLambda={effectiveDOverLambda}
      kdDeg={kdDeg}
      betaDeg={effectiveBeta}
      phasesDeg={effectivePhases}
      amplitudes={effectiveAmplitudes}
      thetaAfDeg={thetaAf}
      thetaTotalDeg={totalMetrics.peakThetaDeg}
      gratingLobes={gratingLobes}
      scenarioTitle={scenario?.title ?? (measurement ? 'Datos VNA' : null)}
    />
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 lg:h-screen lg:overflow-hidden">
      <header className="z-50 border-b border-slate-200 bg-white/95 backdrop-blur lg:h-[76px] shadow-sm">
        <div className="mx-auto flex h-full max-w-[1840px] flex-col gap-2 px-3 py-2 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300 bg-cyan-50">
                <Radio className="h-5 w-5 text-cyan-700" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-extrabold sm:text-lg text-slate-900">Matriz Butler 4×4 & Arreglo Lineal</div>
                <div className="truncate font-mono text-xs text-slate-500">Beamforming interactivo · 2.45 GHz</div>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 lg:hidden"
              aria-label="Reiniciar simulación"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>

          <div className="min-w-0 flex-1 overflow-x-auto pb-1 lg:pb-0">
            <nav className="flex min-w-max items-center gap-1.5 text-sm lg:justify-center" aria-label="Secciones del recurso">
              {nav.map(([id, label, icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 transition ${
                    activeTab === id
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {icon}{label}
                </button>
              ))}
            </nav>
          </div>

          <button
            type="button"
            onClick={reset}
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-slate-600 lg:flex"
          >
            <RotateCcw className="h-4 w-4" /> Reiniciar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1840px] p-2 sm:p-4 lg:h-[calc(100vh-74px)] lg:overflow-hidden">
        <div className="h-full min-h-0 lg:overflow-y-auto lg:pr-1">
          {activeTab === 'simulator' && (
            <div className="space-y-3 sm:space-y-4">
              <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <h1 className="text-lg font-black sm:text-xl">¿Cómo funciona una Matriz Butler 4×4?</h1>
                    <p className="mt-1 max-w-5xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                      La Butler transforma una excitación de entrada en cuatro señales con amplitudes y fases definidas. No radia ni amplifica: prepara la excitación que el arreglo convierte en un patrón espacial.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2"><span className="text-slate-500">θAF</span><div className="font-mono font-bold text-cyan-300">{fmtAngle(thetaAf)}</div></div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2"><span className="text-slate-500">θTotal</span><div className="font-mono font-bold text-emerald-300">{fmtAngle(totalMetrics.peakThetaDeg)}</div></div>
                  </div>
                </div>
              </section>

              <PortSelector selectedPort={selectedPort} onSelect={selectPort} scenarioActive={!!scenario} measurementActive={!!measurement} compact />

              <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.45fr)]">
                <div className="min-w-0"><ButlerDiagramSVG selectedPort={selectedPort} onSelectPort={selectPort} phasesDeg={effectivePhases} amplitudes={effectiveAmplitudes} /></div>
                <aside className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-400">Estado de salida</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {effectivePhases.map((ph, i) => (
                      <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs">
                        <div className="font-bold text-slate-200">O{i + 1} → A{i + 1}</div>
                        <div className="mt-1 font-mono text-cyan-300">A={effectiveAmplitudes[i].toFixed(3)}</div>
                        <div className="font-mono text-amber-300">φ={moduloPhaseDeg(ph).toFixed(1)}°</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                    <div className="flex justify-between gap-3"><span className="text-slate-500">β efectivo</span><strong>{effectiveBeta === null ? '—' : `${effectiveBeta >= 0 ? '+' : ''}${effectiveBeta.toFixed(1)}°`}</strong></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">d/λ</span><strong>{effectiveDOverLambda.toFixed(3)}</strong></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">kd</span><strong>{kdDeg.toFixed(1)}°</strong></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">Grating lobes</span><strong className={gratingLobes.length ? 'text-amber-300' : 'text-emerald-300'}>{gratingLobes.length ? gratingLobes.length : 'ninguno'}</strong></div>
                  </div>
                  <button type="button" onClick={() => setActiveTab('pattern')} className="mt-3 w-full rounded-lg border border-cyan-700 bg-cyan-950/30 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/50">
                    Ver patrón de radiación →
                  </button>
                </aside>
              </div>
            </div>
          )}

          {activeTab === 'pattern' && (
            <div className="space-y-3 sm:space-y-4">
              <PortSelector selectedPort={selectedPort} onSelect={selectPort} scenarioActive={!!scenario} measurementActive={!!measurement} compact />
              {dataPanel}
              <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <div className="min-w-0 space-y-4">
                  <AntennaArrayVisualizer selectedPort={selectedPort} phasesDeg={effectivePhases} amplitudes={effectiveAmplitudes} dMm={separationMm} dOverLambda={effectiveDOverLambda} thetaAfDeg={thetaAf} thetaTotalDeg={totalMetrics.peakThetaDeg} />
                  <InterferenceExplanation frequencyGhz={params.frequencyGhz} dOverLambda={effectiveDOverLambda} amplitudes={effectiveAmplitudes} phasesDeg={effectivePhases} betaDeg={effectiveBeta} thetaAfDeg={thetaAf} />
                </div>
                <div className="min-w-0">{sharedPlot}</div>
              </div>
            </div>
          )}

          {activeTab === 'guided' && (
            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="min-w-0 space-y-4">
                <StepByStepGuide currentPort={selectedPort} onSelectPort={selectPort} onApplyScenario={setScenario} />
                <AntennaArrayVisualizer selectedPort={selectedPort} phasesDeg={effectivePhases} amplitudes={effectiveAmplitudes} dMm={separationMm} dOverLambda={effectiveDOverLambda} thetaAfDeg={thetaAf} thetaTotalDeg={totalMetrics.peakThetaDeg} />
              </div>
              <div className="min-w-0">{sharedPlot}</div>
            </div>
          )}

          {activeTab === 'theory' && (
            <div className="space-y-4">
              <div className="min-w-0"><ButlerDiagramSVG selectedPort={selectedPort} onSelectPort={selectPort} phasesDeg={effectivePhases} amplitudes={effectiveAmplitudes} /></div>
              <div className="min-w-0"><ButlerBlocksInfo /></div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-3 sm:space-y-4">
              <PortSelector selectedPort={selectedPort} onSelect={selectPort} scenarioActive={!!scenario} measurementActive={!!measurement} compact />
              <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="min-w-0 space-y-4">
                  <AdvancedParametersPanel params={params} onChangeParams={setParams} onResetDefaults={reset} effectiveDOverLambda={effectiveDOverLambda} gratingLobes={gratingLobes} />
                  {dataPanel}
                </div>
                <div className="min-w-0">{sharedPlot}</div>
              </div>
            </div>
          )}

          {activeTab === 'measurement' && (
            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <div className="min-w-0 space-y-4">
                <MeasurementPanel onApply={applyMeasurement} />
                {dataPanel}
              </div>
              <div className="min-w-0">{sharedPlot}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
