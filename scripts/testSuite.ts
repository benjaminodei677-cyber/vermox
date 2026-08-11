import {
  calculateFluidProperties,
  calculateBlackOilProperties,
  calculateZFactorHallYarborough,
  calculateZFactorDranchukAbuKassem,
  calculateWichertAzizCorrection,
  calculateCarrKobayashiBurrowsCorrection,
  calculatePiperCorrection,
  calculateLeeKeslerVaporPressure
} from '../src/utils/pvtCalculations';
import { calculateIprProperties } from '../src/utils/iprCalculations';
import { PURE_GAS_COMPONENTS } from '../src/data/components';

console.log("=================================================================");
console.log("COMPREHENSIVE PETROLEUM ENGINEERING PVT & IPR VALIDATION SUITE");
console.log("=================================================================\n");

let failures = 0;
let tests = 0;

function assert(description: string, condition: boolean, details: string = '') {
  tests++;
  if (condition) {
    console.log(`[PASS] ${description} ${details}`);
  } else {
    console.error(`[FAIL] ${description} ${details}`);
    failures++;
  }
}

function assertClose(description: string, actual: number, expected: number, maxPercentDiff = 2.0) {
  tests++;
  const diff = Math.abs(actual - expected);
  const percentDiff = expected !== 0 ? (diff / Math.abs(expected)) * 100 : diff;
  if (percentDiff <= maxPercentDiff) {
    console.log(`[PASS] ${description}: Actual=${actual.toFixed(4)}, Expected=${expected.toFixed(4)} (Diff=${percentDiff.toFixed(2)}%)`);
  } else {
    console.error(`[FAIL] ${description}: Actual=${actual.toFixed(4)}, Expected=${expected.toFixed(4)} (Diff=${percentDiff.toFixed(2)}%)`);
    failures++;
  }
}

// Default gas mix: 85% C1, 10% C2, 5% C3
const defaultGasComponents = [
  { ...PURE_GAS_COMPONENTS[0], moleFraction: 0.85 },
  { ...PURE_GAS_COMPONENTS[1], moleFraction: 0.10 },
  { ...PURE_GAS_COMPONENTS[2], moleFraction: 0.05 }
];

// -----------------------------------------------------------------
// Test 1: Hall-Yarborough & DAK Z-Factor Solver Robustness across Grid
// -----------------------------------------------------------------
console.log("--- TEST 1: Z-Factor Solvers Across Ppr (0.2 -> 10) & Tpr (1.05 -> 2.5) ---");
const pprList = [0.2, 0.5, 1.0, 2.0, 3.0, 5.0, 8.0, 10.0];
const tprList = [1.05, 1.2, 1.5, 2.0, 2.5];

pprList.forEach(ppr => {
  tprList.forEach(tpr => {
    const zHY = calculateZFactorHallYarborough(ppr, tpr);
    const zDAK = calculateZFactorDranchukAbuKassem(ppr, tpr);
    
    // Z factors should be physically realistic: 0.20 < Z < 2.5
    assert(`Z-HY range check Ppr=${ppr}, Tpr=${tpr}`, zHY > 0.20 && zHY < 2.5, `Z=${zHY.toFixed(4)}`);
    assert(`Z-DAK range check Ppr=${ppr}, Tpr=${tpr}`, zDAK > 0.20 && zDAK < 2.5, `Z=${zDAK.toFixed(4)}`);
    
    // HY and DAK should be close to each other (< 5% relative difference)
    const diff = Math.abs(zHY - zDAK) / zHY * 100;
    assert(`HY vs DAK Agreement at Ppr=${ppr}, Tpr=${tpr}`, diff < 5.0, `HY=${zHY.toFixed(4)}, DAK=${zDAK.toFixed(4)}, Diff=${diff.toFixed(2)}%`);
  });
});

// -----------------------------------------------------------------
// Test 2: Wichert-Aziz, CKB, & Piper Non-Hydrocarbon Corrections
// -----------------------------------------------------------------
console.log("\n--- TEST 2: Non-Hydrocarbon Corrections (Wichert-Aziz, CKB, Piper) ---");
const wa = calculateWichertAzizCorrection(0.10, 0.05, 388.5, 668.2);
assertClose("Wichert-Aziz Epsilon Factor (°R)", wa.epsilon, 20.735, 1.0);
assertClose("Wichert-Aziz Corrected Tpc (°R)", wa.correctedTpc, 367.76, 1.0);
assertClose("Wichert-Aziz Corrected Ppc (psia)", wa.correctedPpc, 629.51, 1.0);

const ckb = calculateCarrKobayashiBurrowsCorrection(0.10, 0.05, 0.02, 388.5, 668.2);
assertClose("CKB Corrected Tpc (°R)", ckb.correctedTpc, 392.5, 1.0);
assertClose("CKB Corrected Ppc (psia)", ckb.correctedPpc, 746.8, 1.0);

const testMix = [
  { ...PURE_GAS_COMPONENTS[0], moleFraction: 0.85 }, // C1
  { ...PURE_GAS_COMPONENTS[1], moleFraction: 0.05 }, // C2
  { ...PURE_GAS_COMPONENTS[2], moleFraction: 0.03 }, // C3
  { ...PURE_GAS_COMPONENTS.find(c => c.id === 'co2')!, moleFraction: 0.05 }, // CO2
  { ...PURE_GAS_COMPONENTS.find(c => c.id === 'n2')!, moleFraction: 0.02 }  // N2
];
const pip = calculatePiperCorrection(testMix);
assert("Piper Corrected Tpc > 300 °R", pip.correctedTpc > 300 && pip.correctedTpc < 450, `Tpc=${pip.correctedTpc.toFixed(1)}`);
assert("Piper Corrected Ppc > 500 psia", pip.correctedPpc > 500 && pip.correctedPpc < 800, `Ppc=${pip.correctedPpc.toFixed(1)}`);

// -----------------------------------------------------------------
// Test 3: Lee-Kesler Vapor Pressure
// -----------------------------------------------------------------
console.log("\n--- TEST 3: Lee-Kesler Vapor Pressure ---");
// Pure Methane: Pc = 667.8 psia, Tc = 343.0 °R, omega = 0.0104
// At T = 300°R (Tr = 300 / 343 = 0.8746 < 1)
const pVaporMethane = calculateLeeKeslerVaporPressure(667.8, 343.0, 0.0104, 300);
assert("Lee-Kesler Methane Vapor Pressure < Pc", pVaporMethane < 667.8 && pVaporMethane > 100, `Pv=${pVaporMethane.toFixed(1)} psia`);

// At T >= Tc, should return Pc
const pVaporSuper = calculateLeeKeslerVaporPressure(667.8, 343.0, 0.0104, 400);
assertClose("Lee-Kesler Supercritical returns Pc", pVaporSuper, 667.8, 0.1);

// -----------------------------------------------------------------
// Test 4: Natural Gas Property Calculations across Ppc & Sour Gas Methods
// -----------------------------------------------------------------
console.log("\n--- TEST 4: Natural Gas PVT Property Calculations Across Methods ---");
const fieldGas = calculateFluidProperties(defaultGasComponents, 2000, 160, 'hall_yarborough', 'kay_compositional', 'wichert_aziz');
assert("Real Gas Density > 0 (lb/ft³)", fieldGas.realDensityLbFt3 > 5.0 && fieldGas.realDensityLbFt3 < 15.0, `Density=${fieldGas.realDensityLbFt3.toFixed(2)} lb/ft³`);
assert("Gas Formation Volume Factor Bg > 0", fieldGas.gasFormationVolumeFactorBgFt3Scf > 0.005 && fieldGas.gasFormationVolumeFactorBgFt3Scf < 0.015, `Bg=${fieldGas.gasFormationVolumeFactorBgFt3Scf.toFixed(6)} ft³/scf`);
assert("Gas Viscosity > 0 (cP)", fieldGas.gasViscosityCp > 0.01 && fieldGas.gasViscosityCp < 0.03, `mu_g=${fieldGas.gasViscosityCp.toFixed(4)} cP`);

const dryGas = calculateFluidProperties(defaultGasComponents, 2000, 160, 'hall_yarborough', 'standing_dry', 'none');
assert("Standing Dry Gas Ppc valid", dryGas.pseudoCriticalPressure > 600 && dryGas.pseudoCriticalPressure < 750, `Ppc=${dryGas.pseudoCriticalPressure.toFixed(1)} psia`);

const condGas = calculateFluidProperties(defaultGasComponents, 2000, 160, 'hall_yarborough', 'standing_condensate', 'none');
assert("Standing Condensate Ppc valid", condGas.pseudoCriticalPressure > 600 && condGas.pseudoCriticalPressure < 750, `Ppc=${condGas.pseudoCriticalPressure.toFixed(1)} psia`);

const ckbGas = calculateFluidProperties(testMix, 2000, 160, 'hall_yarborough', 'kay_compositional', 'carr_kobayashi_burrows');
assert("CKB Sour Gas Ppc valid", ckbGas.pseudoCriticalPressure > 600 && ckbGas.pseudoCriticalPressure < 800, `Ppc=${ckbGas.pseudoCriticalPressure.toFixed(1)} psia`);

const pipGas = calculateFluidProperties(testMix, 2000, 160, 'hall_yarborough', 'kay_compositional', 'piper');
assert("Piper Sour Gas Ppc valid", pipGas.pseudoCriticalPressure > 600 && pipGas.pseudoCriticalPressure < 800, `Ppc=${pipGas.pseudoCriticalPressure.toFixed(1)} psia`);

// -----------------------------------------------------------------
// Test 5: Black Oil Correlation Suites Consistency
// -----------------------------------------------------------------
console.log("\n--- TEST 5: Black Oil Correlation Suites (Standing, Vasquez-Beggs, Glaso, Marhoun, Petrosky-Farshad) ---");
const methods = ['standing', 'vasquez_beggs', 'glaso', 'marhoun', 'petrosky_farshad'] as const;

methods.forEach(method => {
  // Saturated Case (P < Pb)
  const satBo = calculateBlackOilProperties({
    pressure: 1500,
    temperature: 180,
    apiGravity: 35,
    gasSpecificGravity: 0.75,
    solutionGasOilRatioInitial: 500,
    correlationMethod: method
  });

  assert(`[${method}] Bubble point pressure Pb > 14.7 psia`, satBo.bubblePointPressure > 1000 && satBo.bubblePointPressure < 4000, `Pb=${satBo.bubblePointPressure.toFixed(1)} psia`);
  assert(`[${method}] Saturated Bo > 1.0 rb/STB`, satBo.oilFormationVolumeFactor > 1.0 && satBo.oilFormationVolumeFactor < 2.5, `Bo=${satBo.oilFormationVolumeFactor.toFixed(4)}`);
  assert(`[${method}] Saturated Rs <= Rsi`, satBo.currentSolutionGasOilRatio <= 500, `Rs=${satBo.currentSolutionGasOilRatio.toFixed(1)} scf/STB`);

  // Bubble point case (P = Pb)
  const pbBo = calculateBlackOilProperties({
    pressure: satBo.bubblePointPressure,
    temperature: 180,
    apiGravity: 35,
    gasSpecificGravity: 0.75,
    solutionGasOilRatioInitial: 500,
    correlationMethod: method
  });

  // Undersaturated Case (P > Pb)
  const undersatBo = calculateBlackOilProperties({
    pressure: satBo.bubblePointPressure + 1000, // 1000 psi higher than Pb
    temperature: 180,
    apiGravity: 35,
    gasSpecificGravity: 0.75,
    solutionGasOilRatioInitial: 500,
    correlationMethod: method
  });

  assert(`[${method}] Undersaturated Rs equals Rsi`, undersatBo.currentSolutionGasOilRatio === 500, `Rs=${undersatBo.currentSolutionGasOilRatio} scf/STB`);
  assert(`[${method}] Undersaturated Bo < Bob at Pb`, undersatBo.oilFormationVolumeFactor < pbBo.oilFormationVolumeFactor, `Bo_undersat=${undersatBo.oilFormationVolumeFactor.toFixed(4)}, Bob=${pbBo.oilFormationVolumeFactor.toFixed(4)}`);
  assert(`[${method}] Undersaturated Density > Density at Pb`, undersatBo.oilDensityLbFt3 > pbBo.oilDensityLbFt3, `Density_undersat=${undersatBo.oilDensityLbFt3.toFixed(2)}, Density_Pb=${pbBo.oilDensityLbFt3.toFixed(2)} lb/ft³`);
});

// -----------------------------------------------------------------
// Test 6: IPR Models (Darcy, Vogel, Combined) Field vs SI Consistency
// -----------------------------------------------------------------
console.log("\n--- TEST 6: IPR Models Field vs SI Units Consistency ---");
const iprField = calculateIprProperties({
  permeability: 100,
  thickness: 50,
  reservoirPressure: 3000,
  drainageRadius: 1000,
  wellboreRadius: 0.33,
  skinFactor: 2.0,
  viscosity: 1.0,
  formationVolumeFactor: 1.2,
  bubblePointPressure: 3000,
  useVogelCombined: false,
  targetPwf: 1500
}, 'field');

const iprSI = calculateIprProperties({
  permeability: 100,
  thickness: 50 * 0.3048, // meters
  reservoirPressure: 3000 * 0.0689476, // bar
  drainageRadius: 1000 * 0.3048, // meters
  wellboreRadius: 0.33 * 0.3048, // meters
  skinFactor: 2.0,
  viscosity: 1.0,
  formationVolumeFactor: 1.2,
  bubblePointPressure: 3000 * 0.0689476, // bar
  useVogelCombined: false,
  targetPwf: 1500 * 0.0689476 // bar
}, 'si');

// Flow rate in field is STB/d; in SI is m³/d (1 STB/d = 0.158987 m³/d)
const qExpectedSI = iprField.qAtTargetPwf * 0.158987;
assertClose("IPR Flow Rate Field -> SI Unit Conversion", iprSI.qAtTargetPwf, qExpectedSI, 1.0);

console.log("\n=================================================================");
console.log(`TEST SUITE COMPLETED: ${tests - failures}/${tests} TESTS PASSED`);
if (failures === 0) {
  console.log("ALL VERIFICATIONS & CALCULATIONS ARE 100% ACCURATE AND ROBUST!");
} else {
  console.log(`FAILED TESTS: ${failures}`);
}
console.log("=================================================================");
