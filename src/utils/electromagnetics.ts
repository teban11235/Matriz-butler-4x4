/** Electromagnetics & phased-array calculations used by the teaching app. */
import { GratingLobeSolution, PatternPoint } from '../types/microwave';

export const SPEED_OF_LIGHT = 2.99792458e8;

export function calculateWavelength(frequencyHz: number): number {
  return SPEED_OF_LIGHT / Math.max(frequencyHz, 1);
}

export function calculateSeparation(wavelengthM: number, dOverLambda: number): number {
  return wavelengthM * Math.max(dOverLambda, 0);
}

export function calculateWavenumber(wavelengthM: number): number {
  return (2 * Math.PI) / Math.max(wavelengthM, Number.EPSILON);
}

export function calculateBeamAngle(betaRad: number, k: number, d: number): number | null {
  const kd = k * d;
  if (Math.abs(kd) < 1e-12) return null;
  const sinTheta = -betaRad / kd;
  if (Math.abs(sinTheta) > 1) return null;
  return Math.asin(sinTheta) * 180 / Math.PI;
}

export function calculateElementPattern(thetaRad: number, q = 1): number {
  if (Math.abs(thetaRad) > Math.PI / 2) return 0;
  return Math.pow(Math.max(0, Math.cos(thetaRad)), Math.max(0, q));
}

export function calculateArrayFactor(
  thetaRad: number,
  k: number,
  d: number,
  amplitudes: number[],
  phasesRad: number[]
): { mag: number; real: number; imag: number } {
  let real = 0;
  let imag = 0;
  const s = Math.sin(thetaRad);
  for (let n = 0; n < amplitudes.length; n++) {
    const a = Math.max(0, amplitudes[n] ?? 0);
    const phase = k * n * d * s + (phasesRad[n] ?? 0);
    real += a * Math.cos(phase);
    imag += a * Math.sin(phase);
  }
  return { mag: Math.hypot(real, imag), real, imag };
}

export function linearToDb(powerRatio: number, floorDb = -40): number {
  if (!Number.isFinite(powerRatio) || powerRatio <= 0) return floorDb;
  return Math.max(floorDb, 10 * Math.log10(powerRatio));
}

export function dbToLinearAmplitude(db: number): number {
  return Math.pow(10, db / 20);
}

export function deriveProgressivePhaseDeg(phasesDeg: number[], amplitudes?: number[]): number | null {
  const diffs: number[] = [];
  for (let i = 0; i < phasesDeg.length - 1; i++) {
    if (amplitudes && ((amplitudes[i] ?? 0) <= 1e-9 || (amplitudes[i + 1] ?? 0) <= 1e-9)) continue;
    diffs.push(phasesDeg[i + 1] - phasesDeg[i]);
  }
  if (!diffs.length) return null;
  return diffs.reduce((a, b) => a + b, 0) / diffs.length;
}

export function findGratingLobes(betaRad: number, k: number, d: number): GratingLobeSolution[] {
  const kd = k * d;
  if (Math.abs(kd) < 1e-12) return [];
  const solutions: GratingLobeSolution[] = [];
  for (let m = -8; m <= 8; m++) {
    if (m === 0) continue;
    const sinTheta = (2 * Math.PI * m - betaRad) / kd;
    if (Math.abs(sinTheta) <= 1 + 1e-10) {
      solutions.push({ m, thetaDeg: Math.asin(Math.max(-1, Math.min(1, sinTheta))) * 180 / Math.PI });
    }
  }
  return solutions;
}

export function calculatePatternsRange(
  frequencyHz: number,
  dOverLambda: number,
  amplitudes: number[],
  phasesDeg: number[],
  elementPowerQ = 1,
  stepDeg = 0.5
): PatternPoint[] {
  const lambda = calculateWavelength(frequencyHz);
  const d = calculateSeparation(lambda, dOverLambda);
  const k = calculateWavenumber(lambda);
  const phasesRad = phasesDeg.map((p) => p * Math.PI / 180);
  const raw: { thetaDeg: number; thetaRad: number; elem: number; af: number; total: number }[] = [];
  let maxAf = 0;
  let maxTotal = 0;
  const idealMax = amplitudes.reduce((s, a) => s + Math.abs(a), 0) || 1;

  for (let thetaDeg = -90; thetaDeg <= 90 + 1e-9; thetaDeg += Math.max(0.1, stepDeg)) {
    const thetaRad = thetaDeg * Math.PI / 180;
    const elem = calculateElementPattern(thetaRad, elementPowerQ);
    const af = calculateArrayFactor(thetaRad, k, d, amplitudes, phasesRad).mag / idealMax;
    const total = elem * af;
    maxAf = Math.max(maxAf, af);
    maxTotal = Math.max(maxTotal, total);
    raw.push({ thetaDeg, thetaRad, elem, af, total });
  }

  return raw.map((p) => {
    const elemPower = p.elem ** 2;
    const afNorm = maxAf > 0 ? (p.af / maxAf) ** 2 : 0;
    const totalNorm = maxTotal > 0 ? (p.total / maxTotal) ** 2 : 0;
    return {
      thetaDeg: p.thetaDeg,
      thetaRad: p.thetaRad,
      elementLinear: p.elem,
      elementDb: linearToDb(elemPower),
      arrayFactorLinear: p.af,
      arrayFactorDb: linearToDb(afNorm),
      totalLinear: Math.sqrt(totalNorm),
      totalDb: linearToDb(totalNorm),
    };
  });
}

export function findPatternMetrics(points: PatternPoint[], kind: 'total' | 'arrayFactor' = 'total') {
  if (!points.length) return { peakThetaDeg: 0, peakDb: 0, hpbwDeg: 0, sllDb: -40 };
  const getDb = (p: PatternPoint) => kind === 'total' ? p.totalDb : p.arrayFactorDb;
  let peakIdx = 0;
  for (let i = 1; i < points.length; i++) if (getDb(points[i]) > getDb(points[peakIdx])) peakIdx = i;
  const peakDb = getDb(points[peakIdx]);
  const target = peakDb - 3.01;
  let left = points[0].thetaDeg;
  let right = points[points.length - 1].thetaDeg;
  for (let i = peakIdx; i >= 0; i--) if (getDb(points[i]) <= target) { left = points[i].thetaDeg; break; }
  for (let i = peakIdx; i < points.length; i++) if (getDb(points[i]) <= target) { right = points[i].thetaDeg; break; }
  let sllDb = -40;
  for (let i = 1; i < points.length - 1; i++) {
    const v = getDb(points[i]);
    if (v > getDb(points[i - 1]) && v > getDb(points[i + 1]) && (points[i].thetaDeg < left - 2 || points[i].thetaDeg > right + 2)) sllDb = Math.max(sllDb, v);
  }
  return { peakThetaDeg: points[peakIdx].thetaDeg, peakDb, hpbwDeg: Math.abs(right - left), sllDb };
}

export function calculatePhasorsAtAngle(
  thetaDeg: number,
  frequencyHz: number,
  dOverLambda: number,
  amplitudes: number[],
  phasesDeg: number[]
) {
  const thetaRad = thetaDeg * Math.PI / 180;
  const lambda = calculateWavelength(frequencyHz);
  const d = calculateSeparation(lambda, dOverLambda);
  const k = calculateWavenumber(lambda);
  let sumReal = 0;
  let sumImag = 0;
  const individualPhasors = amplitudes.map((a, n) => {
    const total = k * n * d * Math.sin(thetaRad) + (phasesDeg[n] ?? 0) * Math.PI / 180;
    const real = a * Math.cos(total);
    const imag = a * Math.sin(total);
    sumReal += real;
    sumImag += imag;
    return { real, imag, mag: Math.abs(a), phaseDeg: total * 180 / Math.PI };
  });
  return {
    individualPhasors,
    resultant: { real: sumReal, imag: sumImag, mag: Math.hypot(sumReal, sumImag), phaseDeg: Math.atan2(sumImag, sumReal) * 180 / Math.PI }
  };
}
