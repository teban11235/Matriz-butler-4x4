/** Microwave & Butler Matrix Type Definitions */

export type ButlerPortId = 'P1' | 'P2' | 'P3' | 'P4';
export type SpacingMode = 'normalized' | 'physical';

export interface ButlerPortConfig {
  id: ButlerPortId;
  label: string;
  betaDeg: number;
  phasesDeg: [number, number, number, number];
  theoreticalThetaDeg: number;
  beamColor: string;
  description: string;
  beamLabel: string;
}

export interface ButlerOutputState {
  amplitudes: [number, number, number, number];
  phasesDeg: [number, number, number, number];
  betaDeg: number;
}

export interface EducationalScenario {
  id: string;
  title: string;
  description: string;
  amplitudes: [number, number, number, number];
  phasesDeg: [number, number, number, number];
  betaDeg: number | null;
  useButler: boolean;
}

export interface PatternPoint {
  thetaDeg: number;
  thetaRad: number;
  elementLinear: number;
  elementDb: number;
  arrayFactorLinear: number;
  arrayFactorDb: number;
  totalLinear: number;
  totalDb: number;
}

export interface SimulationParameters {
  frequencyGhz: number;
  spacingMode: SpacingMode;
  dOverLambda: number;
  physicalSpacingMm: number;
  elementPowerQ: number;
  phaseErrorsDeg: [number, number, number, number];
  amplitudeWeights: [number, number, number, number];
  isNonIdealMode: boolean;
}

export interface ButlerBlockInfo {
  id: string;
  name: string;
  type: 'hybrid' | 'shifter' | 'crossover';
  role: string;
  microwaveBehavior: string;
  sMatrixConcept: string;
}

export interface GratingLobeSolution {
  m: number;
  thetaDeg: number;
}
