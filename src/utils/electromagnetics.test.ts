import assert from 'node:assert/strict';
import {
  calculateBeamAngle,
  calculatePatternsRange,
  calculateWavelength,
  calculateWavenumber,
  dbToLinearAmplitude,
  findGratingLobes,
  findPatternMetrics,
} from './electromagnetics';

const near = (actual: number, expected: number, tol: number, label: string) => {
  assert.ok(Math.abs(actual - expected) <= tol, `${label}: ${actual} vs ${expected}`);
};
const f = 2.45e9;
const lambda = calculateWavelength(f);
near(lambda * 1000, 122.364, 0.02, 'lambda');
const k = calculateWavenumber(lambda);
const d = lambda / 2;
near(calculateBeamAngle(45 * Math.PI / 180, k, d)!, -14.4775, 0.02, '+45 beam');
near(calculateBeamAngle(-45 * Math.PI / 180, k, d)!, 14.4775, 0.02, '-45 beam');
near(calculateBeamAngle(135 * Math.PI / 180, k, d)!, -48.5904, 0.03, '+135 beam');
near(calculateBeamAngle(-135 * Math.PI / 180, k, d)!, 48.5904, 0.03, '-135 beam');
const ptsIso = calculatePatternsRange(f, 0.5, [1,1,1,1], [0,45,90,135], 0, 0.1);
near(findPatternMetrics(ptsIso).peakThetaDeg, -14.48, 0.2, 'q=0 total≈AF');
const ptsPatch = calculatePatternsRange(f, 0.5, [1,1,1,1], [0,135,270,405], 1, 0.1);
assert.notEqual(findPatternMetrics(ptsPatch).peakThetaDeg.toFixed(1), (-48.59).toFixed(1));
assert.ok(findGratingLobes(0, k, lambda).length >= 1, 'd=lambda must have visible grating solution at endfire');
near(dbToLinearAmplitude(-6.0206), 0.5, 0.001, 'dB amplitude conversion');
console.log('Electromagnetics tests: OK');
