/**
 * Ideal 4x4 Butler matrix model.
 * The selected convention maps P1..P4 to progressive output phases
 * -45°, -135°, +135°, +45°, respectively.
 *
 * The ideal transfer matrix is built column-wise from these four states:
 * b = B a, with |B_mn| = 1/2 for a lossless equal-split 4x4 network.
 */
import { ButlerBlockInfo, ButlerOutputState, ButlerPortConfig, ButlerPortId } from '../types/microwave';

export const BUTLER_PORTS: Record<ButlerPortId, ButlerPortConfig> = {
  P1: { id: 'P1', label: 'Puerto 1 (P1)', betaDeg: -45, phasesDeg: [0, -45, -90, -135], theoreticalThetaDeg: 14.48, beamColor: '#06b6d4', beamLabel: 'Haz +14.5°', description: 'Progresión de fase -45° entre elementos adyacentes.' },
  P2: { id: 'P2', label: 'Puerto 2 (P2)', betaDeg: -135, phasesDeg: [0, -135, -270, -405], theoreticalThetaDeg: 48.59, beamColor: '#3b82f6', beamLabel: 'Haz +48.6°', description: 'Progresión de fase -135° entre elementos adyacentes.' },
  P3: { id: 'P3', label: 'Puerto 3 (P3)', betaDeg: 135, phasesDeg: [0, 135, 270, 405], theoreticalThetaDeg: -48.59, beamColor: '#f59e0b', beamLabel: 'Haz -48.6°', description: 'Progresión de fase +135° entre elementos adyacentes.' },
  P4: { id: 'P4', label: 'Puerto 4 (P4)', betaDeg: 45, phasesDeg: [0, 45, 90, 135], theoreticalThetaDeg: -14.48, beamColor: '#10b981', beamLabel: 'Haz -14.5°', description: 'Progresión de fase +45° entre elementos adyacentes.' },
};

export type Complex = { re: number; im: number };
const cexp = (deg: number): Complex => {
  const rad = deg * Math.PI / 180;
  return { re: 0.5 * Math.cos(rad), im: 0.5 * Math.sin(rad) };
};

export const IDEAL_BUTLER_MATRIX: Complex[][] = [0, 1, 2, 3].map((row) =>
  (['P1', 'P2', 'P3', 'P4'] as ButlerPortId[]).map((p) => cexp(BUTLER_PORTS[p].phasesDeg[row]))
);

export function getButlerOutput(portId: ButlerPortId): ButlerOutputState {
  const cfg = BUTLER_PORTS[portId];
  return {
    amplitudes: [0.5, 0.5, 0.5, 0.5],
    phasesDeg: [...cfg.phasesDeg] as [number, number, number, number],
    betaDeg: cfg.betaDeg,
  };
}

export function moduloPhaseDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export const BUTLER_BLOCK_DETAILS: Record<string, ButlerBlockInfo> = {
  H1: { id: 'H1', name: 'Acoplador híbrido 90° (Etapa 1 superior)', type: 'hybrid', role: 'Divide/combina potencia con relación de fase en cuadratura.', microwaveBehavior: 'Híbrido 3 dB de cuatro puertos; la respuesta real depende del diseño y de la frecuencia.', sMatrixConcept: '|S21|≈|S31|≈1/√2 y diferencia de fase ≈90° en el caso ideal.' },
  H2: { id: 'H2', name: 'Acoplador híbrido 90° (Etapa 1 inferior)', type: 'hybrid', role: 'Realiza la primera división en las entradas P3/P4.', microwaveBehavior: 'Misma función ideal que H1.', sMatrixConcept: 'Red recíproca, adaptada e idealmente aislada en el puerto correspondiente.' },
  H3: { id: 'H3', name: 'Acoplador híbrido 90° (Etapa 2 superior)', type: 'hybrid', role: 'Recombina dos ramas para sintetizar las salidas superiores.', microwaveBehavior: 'Suma vectorial en cuadratura.', sMatrixConcept: 'Genera las relaciones de fase requeridas por la transformación Butler.' },
  H4: { id: 'H4', name: 'Acoplador híbrido 90° (Etapa 2 inferior)', type: 'hybrid', role: 'Recombina dos ramas para sintetizar las salidas inferiores.', microwaveBehavior: 'Suma vectorial en cuadratura.', sMatrixConcept: 'Genera las relaciones de fase requeridas por la transformación Butler.' },
  PS1: { id: 'PS1', name: 'Desfasador fijo 45° (rama exterior superior)', type: 'shifter', role: 'Introduce una fase adicional fija.', microwaveBehavior: 'Puede implementarse mediante una diferencia de longitud eléctrica.', sMatrixConcept: 'Idealmente S21=e^{-j45°}; la pérdida real se determina por simulación/medición.' },
  PS2: { id: 'PS2', name: 'Desfasador fijo 45° (rama exterior inferior)', type: 'shifter', role: 'Introduce la misma fase adicional en la rama exterior inferior.', microwaveBehavior: 'Implementación microstrip simétrica respecto a PS1.', sMatrixConcept: 'Idealmente S21=e^{-j45°}.' },
  CR1: { id: 'CR1', name: 'Crossover 1', type: 'crossover', role: 'Permite el cruce de las rutas interiores sin conexión eléctrica entre ellas.', microwaveBehavior: 'Debe minimizar pérdida y acoplamiento no deseado.', sMatrixConcept: 'Idealmente transmisión unitaria por cada ruta y aislamiento entre rutas.' },
  CR2: { id: 'CR2', name: 'Crossover 2', type: 'crossover', role: 'Realiza el segundo reordenamiento de las rutas interiores antes de las salidas.', microwaveBehavior: 'Debe preservar amplitud y fase en ambas trayectorias.', sMatrixConcept: 'Idealmente transmisión unitaria por cada ruta y aislamiento entre rutas.' },
};

export function getButlerTrace(portId: ButlerPortId) {
  const upper = portId === 'P1' || portId === 'P2';
  return {
    portName: portId,
    activeBlocks: upper ? ['H1', 'PS1', 'CR1', 'CR2', 'H3', 'H4'] : ['H2', 'PS2', 'CR1', 'CR2', 'H3', 'H4'],
    summary: `${portId} excita una red pasiva de división/recombinación; la señal se reparte por múltiples ramas y termina en las cuatro salidas con la progresión ${BUTLER_PORTS[portId].betaDeg > 0 ? '+' : ''}${BUTLER_PORTS[portId].betaDeg}°.`
  };
}
