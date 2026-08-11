import { calculateFluidProperties, calculateBlackOilProperties, calculateZFactorHallYarborough, calculateZFactorDranchukAbuKassem, calculateWichertAzizCorrection } from '../src/utils/pvtCalculations';
import { calculateIprProperties } from '../src/utils/iprCalculations';
import { PURE_GAS_COMPONENTS } from '../src/data/components';

console.log("==================================================");
console.log("RUNNING PETROLEUM RESERVOIR ENGINEERING BENCHMARKS");
console.log("==================================================\n");

let failures = 0;

function assertClose(name: string, actual: number, expected: number, maxPercentDiff = 3.0) {
  const diff = Math.abs(actual - expected);
  const percentDiff = expected !== 0 ? (diff / Math.abs(expected)) * 100 : diff;
  if (percentDiff <= maxPercentDiff) {
    console.log(`[PASS] ${name}: Actual = ${actual.toFixed(4)}, Expected = ${expected.toFixed(4)} (Diff = ${percentDiff.toFixed(2)}%)`);
  } else {
    console.error(`[FAIL] ${name}: Actual = ${actual.toFixed(4)}, Expected = ${expected.toFixed(4)} (Diff = ${percentDiff.toFixed(2)}%)`);
    failures++;
  }
}

// 1. Benchmark Case: Wichert-Aziz Sour Gas Correction (Ahmed Reservoir Engineering Handbook Example)
console.log("--- 1. Sour Gas Wichert-Aziz Correction ---");
const waRes = calculateWichertAzizCorrection(0.10, 0.05, 388.5, 668.2);
assertClose("Wichert-Aziz Epsilon (°R)", waRes.epsilon, 20.80, 3.0);
assertClose("Corrected Tpc (°R)", waRes.correctedTpc, 367.7, 1.0);
assertClose("Corrected Ppc (psia)", waRes.correctedPpc, 629.4, 1.0);

// 2. Benchmark Case: Z-Factor Hall-Yarborough & DAK at Tpr = 1.5, Ppr = 3.0
console.log("\n--- 2. Z-Factor EOS Solver Benchmarks (Tpr = 1.5, Ppr = 3.0) ---");
// Standing-Katz chart value at Tpr = 1.5, Ppr = 3.0 is approx 0.770
const zHY = calculateZFactorHallYarborough(3.0, 1.5);
const zDAK = calculateZFactorDranchukAbuKassem(3.0, 1.5);
assertClose("Z-factor Hall-Yarborough", zHY, 0.772, 2.0);
assertClose("Z-factor Dranchuk-Abu Kassem", zDAK, 0.773, 2.0);

// 3. Benchmark Case: Standing Black Oil Correlations
// Reservoir: T = 200°F, API = 30, gamma_g = 0.8, Rsi = 600 scf/STB
console.log("\n--- 3. Standing Black Oil Correlations Benchmark ---");
const standingBo = calculateBlackOilProperties({
  pressure: 2500, // Above Pb
  temperature: 200,
  apiGravity: 30,
  gasSpecificGravity: 0.8,
  solutionGasOilRatioInitial: 600,
  correlationMethod: 'standing'
});
console.log(`Standing Pb = ${standingBo.bubblePointPressure.toFixed(1)} psia`);
assertClose("Standing Bubble Point Pressure (psia)", standingBo.bubblePointPressure, 2380, 5.0);

// 4. Benchmark Case: Vasquez-Beggs Black Oil Correlations
console.log("\n--- 4. Vasquez-Beggs Black Oil Benchmark ---");
const vbBo = calculateBlackOilProperties({
  pressure: 3000,
  temperature: 200,
  apiGravity: 30,
  gasSpecificGravity: 0.8,
  solutionGasOilRatioInitial: 600,
  correlationMethod: 'vasquez_beggs'
});
console.log(`Vasquez-Beggs Pb = ${vbBo.bubblePointPressure.toFixed(1)} psia`);
assertClose("Vasquez-Beggs Bubble Point Pressure (psia)", vbBo.bubblePointPressure, 2410, 5.0);

// 5. Benchmark Case: Vogel IPR Equation Benchmark
// Pr = 2500 psia, Pb = 2500 psia (saturated), k = 50 md, h = 30 ft, mu = 1.5 cP, Bo = 1.2, re = 1000 ft, rw = 0.33 ft, S = 0
console.log("\n--- 5. Vogel IPR Equation Benchmark ---");
const iprRes = calculateIprProperties({
  permeability: 50,
  thickness: 30,
  reservoirPressure: 2500,
  drainageRadius: 1000,
  wellboreRadius: 0.33,
  skinFactor: 0,
  viscosity: 1.5,
  formationVolumeFactor: 1.2,
  bubblePointPressure: 2500,
  useVogelCombined: false,
  targetPwf: 1250
}, 'field');

// J_field = (0.00708 * 50 * 30) / (1.5 * 1.2 * ln(1000/0.33)) = 10.62 / (1.8 * 8.016) = 0.7360 STB/d/psi
// qMax = (J * Pr) / 1.8 = (0.7360 * 2500) / 1.8 = 1022.2 STB/d
// At Pwf = 1250 psia (Pwf/Pr = 0.5): q = qMax * (1 - 0.2*(0.5) - 0.8*(0.25)) = 1022.2 * 0.7 = 715.5 STB/d
assertClose("J Productivity Index (STB/d/psi)", iprRes.productivityIndex, 0.7360, 2.0);
assertClose("AOF Maximum Flow Rate qMax (STB/d)", iprRes.qMaxAof, 1022.2, 2.0);
assertClose("Flow rate q at Pwf = 1250 psia (STB/d)", iprRes.qAtTargetPwf, 715.5, 2.0);

console.log("\n==================================================");
if (failures === 0) {
  console.log("ALL RESERVOIR ENGINEERING BENCHMARKS PASSED PERFECTLY!");
} else {
  console.log(`BENCHMARKS COMPLETED WITH ${failures} DISCREPANCIES.`);
}
console.log("==================================================");
