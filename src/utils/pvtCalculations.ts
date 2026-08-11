import {
  GasComponent,
  CalculatedResults,
  SensitivityPoint,
  BlackOilInputs,
  BlackOilResults,
  BlackOilSensitivityPoint,
  BlackOilMethod,
  ZFactorMethod,
  GasPpcMethod,
  SourGasMethod
} from '../types';

const R_CONST = 10.7316; // (psia * ft3) / (lb-mol * °R)
const AIR_MOL_WEIGHT = 28.966; // lb/lb-mol

/**
 * Solves for the Compressibility Z-factor using the Hall-Yarborough method.
 * Reference: Hall, K.R. and Yarborough, L., "A new equation of state for Z-factor calculations", Oil and Gas Journal, 1973.
 */
export function calculateZFactorHallYarborough(pPr: number, tPr: number): number {
  if (pPr <= 0) return 1.0;
  if (tPr <= 0) return 1.0;

  const t = 1.0 / tPr; // reduced inverse temperature
  const a = 0.06125 * t * Math.exp(-1.2 * Math.pow(1.0 - t, 2));
  const b = t * (14.76 - 9.76 * t + 4.58 * Math.pow(t, 2));
  const c = t * (90.7 - 242.2 * t + 42.4 * Math.pow(t, 2));
  const d = 2.18 + 2.82 * t;

  // Objective function f(y) and derivative f'(y)
  const f = (y: number) => {
    const y2 = y * y;
    const y3 = y2 * y;
    const y4 = y3 * y;
    const oneMinusY = 1.0 - y;
    const term1 = (y + y2 + y3 - y4) / Math.pow(oneMinusY, 3);
    return -a * pPr + term1 - b * y2 + c * Math.pow(y, d);
  };

  const df = (y: number) => {
    const y2 = y * y;
    const y3 = y2 * y;
    const oneMinusY = 1.0 - y;
    const num = 1.0 + 4.0 * y + 4.0 * y2 - 4.0 * y3 + y2 * y2;
    const term1 = num / Math.pow(oneMinusY, 4);
    return term1 - 2.0 * b * y + c * d * Math.pow(y, d - 1.0);
  };

  // Newton-Raphson iteration
  let y = 0.001 * pPr; // initial estimate
  if (y > 0.8) y = 0.5;

  for (let iter = 0; iter < 100; iter++) {
    const fy = f(y);
    const dfy = df(y);
    if (Math.abs(dfy) < 1e-12) break;
    
    const dy = fy / dfy;
    y = y - dy;

    // Keep y bounded in valid reduced density region (0, 1)
    if (y <= 0) y = 0.0001;
    if (y >= 0.95) y = 0.90;

    if (Math.abs(dy) < 1e-7) break;
  }

  if (y <= 0 || isNaN(y)) return 1.0;

  const z = (a * pPr) / y;
  return isNaN(z) || z <= 0 ? 1.0 : z;
}

/**
 * Solves for Compressibility Z-factor using Dranchuk-Abu Kassem (DAK) method.
 * Reference: Dranchuk, P.M., and Abu-Kassem, J.H., "Calculation of Z-Factors for Natural Gases Using Equations of State", JCPT, 1975.
 */
export function calculateZFactorDranchukAbuKassem(pPr: number, tPr: number): number {
  if (pPr <= 0) return 1.0;
  if (tPr <= 0) return 1.0;

  const A1 = 0.3265;
  const A2 = -1.0700;
  const A3 = -0.5339;
  const A4 = 0.01569;
  const A5 = -0.05165;
  const A6 = 0.5475;
  const A7 = -0.7361;
  const A8 = 0.1844;
  const A9 = 0.1056;
  const A10 = 0.6134;
  const A11 = 0.7210;

  const T1 = A1 + A2 / tPr + A3 / Math.pow(tPr, 3) + A4 / Math.pow(tPr, 4) + A5 / Math.pow(tPr, 5);
  const T2 = A6 + A7 / tPr + A8 / Math.pow(tPr, 2);
  const T3 = A9 * (A7 / tPr + A8 / Math.pow(tPr, 2));

  // Objective function f(rhoR) and derivative f'(rhoR)
  const f = (rhoR: number) => {
    const rho2 = rhoR * rhoR;
    const termExp = Math.exp(-A11 * rho2);
    const termZ = 1.0 + T1 * rhoR + T2 * rho2 - T3 * Math.pow(rhoR, 5) +
                  A10 * (1.0 + A11 * rho2) * (rho2 / Math.pow(tPr, 3)) * termExp;
    return termZ - (0.27 * pPr) / (rhoR * tPr);
  };

  const df = (rhoR: number) => {
    const rho2 = rhoR * rhoR;
    const termExp = Math.exp(-A11 * rho2);
    const dTermExp = -2.0 * A11 * rhoR * termExp;

    const term4 = A10 * (rho2 / Math.pow(tPr, 3)) * termExp;
    const dTerm4 = A10 * (2.0 * rhoR / Math.pow(tPr, 3)) * termExp + A10 * (rho2 / Math.pow(tPr, 3)) * dTermExp;

    const dTermZ = T1 + 2.0 * T2 * rhoR - 5.0 * T3 * Math.pow(rhoR, 4) +
                   (2.0 * A11 * rhoR) * term4 + (1.0 + A11 * rho2) * dTerm4;
    return dTermZ + (0.27 * pPr) / (rho2 * tPr);
  };

  let rhoR = 0.27 * pPr / tPr; // Initial guess for reduced density
  if (rhoR <= 0) rhoR = 0.01;

  for (let iter = 0; iter < 100; iter++) {
    const fr = f(rhoR);
    const dfr = df(rhoR);
    if (Math.abs(dfr) < 1e-12) break;

    const drhoR = fr / dfr;
    rhoR = rhoR - drhoR;

    if (rhoR <= 0) rhoR = 0.001;
    if (Math.abs(drhoR) < 1e-7) break;
  }

  if (rhoR <= 0 || isNaN(rhoR)) return 1.0;

  const z = (0.27 * pPr) / (rhoR * tPr);
  return isNaN(z) || z <= 0 ? 1.0 : z;
}

/**
 * Calculates Z-factor dispatching based on user selected method
 */
export function calculateZFactor(pPr: number, tPr: number, method: ZFactorMethod = 'hall_yarborough'): number {
  if (method === 'dranchuk_abu_kassem') {
    return calculateZFactorDranchukAbuKassem(pPr, tPr);
  }
  return calculateZFactorHallYarborough(pPr, tPr);
}

/**
 * Calculates Standing's Specific Gravity correlations for Gas Pseudocritical Pressure & Temperature
 */
export function calculateStandingGasPpcTpc(gammaG: number, isCondensate = false) {
  const g = Math.max(0.5, Math.min(2.0, gammaG));
  if (isCondensate) {
    // Gas Condensates correlation
    const tpc = 187.0 + 330.0 * g - 71.5 * g * g; // °R
    const ppc = 706.0 - 51.7 * g - 11.1 * g * g; // psia
    return { tpc, ppc };
  } else {
    // Dry Natural Gas correlation
    const tpc = 168.0 + 325.0 * g - 12.5 * g * g; // °R
    const ppc = 677.0 + 15.0 * g - 37.5 * g * g; // psia
    return { tpc, ppc };
  }
}

/**
 * Pure Component Lee-Kesler Vapor Pressure Correlation
 * Pvr = Pc * exp(f0 + omega * f1)
 */
export function calculateLeeKeslerVaporPressure(
  pcPsia: number,
  tcRankine: number,
  omega: number,
  tempRankine: number
): number {
  if (tempRankine >= tcRankine) return pcPsia; // Supercritical
  const tr = Math.max(0.01, Math.min(0.9999, tempRankine / tcRankine));

  const f0 = 5.92714 - 6.09648 / tr - 1.28862 * Math.log(tr) + 0.169347 * Math.pow(tr, 6);
  const f1 = 15.2518 - 15.6875 / tr - 13.4721 * Math.log(tr) + 0.43577 * Math.pow(tr, 6);

  const pvr = Math.exp(f0 + omega * f1);
  return Math.min(pcPsia, pcPsia * pvr);
}

/**
 * Pure Component Clausius-Clapeyron Vapor Pressure Equation
 * ln(Pv) = - (Lv / R) * (1/T) + C
 */
export function calculateClausiusClapeyronVaporPressure(
  lvBtuLb: number,
  molWeight: number,
  tempRankine: number,
  cConst = 12.5
): number {
  const R = 1.987; // Btu / (lb-mol * °R)
  const lvMolar = lvBtuLb * molWeight; // Btu/lb-mol
  const exponent = -(lvMolar / R) * (1.0 / tempRankine) + cConst;
  return Math.exp(exponent);
}

/**
 * Calculates Gas Viscosity in cP using Lee-Gonzalez-Eakin correlation.
 * Reference: Lee, A.L., Gonzalez, M.H., and Eakin, B.E., "The Viscosity of Natural Gases", JPT, 1966.
 */
export function calculateGasViscosityLeeGonzalez(
  tempRankine: number,
  apparentMolWeight: number,
  densityLbFt3: number
): number {
  if (tempRankine <= 0 || apparentMolWeight <= 0 || densityLbFt3 <= 0) return 0.012;

  const k = ((9.379 + 0.01607 * apparentMolWeight) * Math.pow(tempRankine, 1.5)) /
            (209.2 + 19.26 * apparentMolWeight + tempRankine);

  const x = 3.448 + (986.4 / tempRankine) + 0.01009 * apparentMolWeight;
  const y = 2.447 - 0.2224 * x;

  const rhoGcm3 = densityLbFt3 / 62.428; // convert lb/ft3 to g/cm3
  const viscosity = 1e-4 * k * Math.exp(x * Math.pow(rhoGcm3, y));

  return isNaN(viscosity) || viscosity <= 0 ? 0.012 : viscosity;
}

/**
 * Wichert-Aziz correlation for sour gases containing H2S and/or CO2.
 * Reference: Wichert, E. and Aziz, K., "Calculate Z's for Sour Gases", Hydrocarbon Processing, 1972.
 */
export function calculateWichertAzizCorrection(
  yH2S: number,
  yCO2: number,
  uncorrectedTpc: number,
  uncorrectedPpc: number
): { correctedTpc: number; correctedPpc: number; epsilon: number } {
  const a = yH2S + yCO2;
  const b = yH2S;

  if (a <= 0) {
    return {
      correctedTpc: uncorrectedTpc,
      correctedPpc: uncorrectedPpc,
      epsilon: 0
    };
  }

  // Wichert-Aziz correction factor epsilon in °R
  const epsilon = 120.0 * (Math.pow(a, 0.9) - Math.pow(a, 1.6)) +
                  15.0 * (Math.pow(b, 0.5) - Math.pow(b, 4.0));

  const correctedTpc = uncorrectedTpc - epsilon;
  
  // Corrected pseudo-critical pressure
  const denominator = uncorrectedTpc + yH2S * (1.0 - yH2S) * epsilon;
  const correctedPpc = denominator > 0 ? (uncorrectedPpc * correctedTpc) / denominator : uncorrectedPpc;

  return {
    correctedTpc: Math.max(100, correctedTpc),
    correctedPpc: Math.max(100, correctedPpc),
    epsilon: Math.max(0, epsilon)
  };
}

export function calculateCarrKobayashiBurrowsCorrection(
  yH2S: number,
  yCO2: number,
  yN2: number,
  uncorrectedTpc: number,
  uncorrectedPpc: number
): { correctedTpc: number; correctedPpc: number } {
  // Carr-Kobayashi-Burrows adjustment for non-hydrocarbons
  const correctedTpc = uncorrectedTpc - 80.0 * yCO2 + 130.0 * yH2S - 250.0 * yN2;
  const correctedPpc = uncorrectedPpc + 440.0 * yCO2 + 600.0 * yH2S - 170.0 * yN2;

  return {
    correctedTpc: Math.max(100, correctedTpc),
    correctedPpc: Math.max(100, correctedPpc)
  };
}

export function calculatePiperCorrection(
  components: GasComponent[],
  normFactor = 1.0
): { correctedTpc: number; correctedPpc: number } {
  let sum1 = 0; // yi * (Tc/Pc)
  let sum2 = 0; // yi * sqrt(Tc/Pc)
  let sumK = 0; // yi * (Tc / sqrt(Pc))

  components.forEach((c) => {
    const yi = c.moleFraction / normFactor;
    if (yi > 0 && c.criticalPressure > 0 && c.criticalTemp > 0) {
      sum1 += yi * (c.criticalTemp / c.criticalPressure);
      sum2 += yi * Math.sqrt(c.criticalTemp / c.criticalPressure);
      sumK += yi * (c.criticalTemp / Math.sqrt(c.criticalPressure));
    }
  });

  if (sumK <= 0 || sum1 <= 0) {
    return { correctedTpc: 380, correctedPpc: 660 };
  }

  const J = (1.0 / 3.0) * sum1 + (2.0 / 3.0) * Math.pow(sum2, 2);
  const K = sumK;
  const correctedTpc = Math.pow(K, 2) / J;
  const correctedPpc = correctedTpc / J;

  return {
    correctedTpc: Math.max(100, correctedTpc),
    correctedPpc: Math.max(100, correctedPpc)
  };
}

/**
 * Main Natural Gas PVT Calculation Engine
 */
export function calculateFluidProperties(
  components: GasComponent[],
  pressurePsia: number,
  tempFahrenheit: number,
  zFactorMethod: ZFactorMethod = 'hall_yarborough',
  ppcMethod: GasPpcMethod = 'kay_compositional',
  sourGasMethod: SourGasMethod = 'wichert_aziz'
): CalculatedResults {
  // 1. Calculate sum of mole fractions
  const totalMoleFraction = components.reduce((sum, c) => sum + c.moleFraction, 0);
  const isValidComposition = Math.abs(totalMoleFraction - 1.0) < 0.001;

  // Normalized mole fractions for calculation if total != 1.0
  const normFactor = totalMoleFraction > 0 ? totalMoleFraction : 1.0;

  let ma = 0; // Apparent molecular weight
  let uncorrectedPpc = 0; // Kay's rule P_pc
  let uncorrectedTpc = 0; // Kay's rule T_pc
  let yH2S = 0;
  let yCO2 = 0;
  let yN2 = 0;

  const componentsBreakdown = components.map((c) => {
    const yi = c.moleFraction / normFactor;
    if (c.id === 'h2s') yH2S = yi;
    if (c.id === 'co2') yCO2 = yi;
    if (c.id === 'n2') yN2 = yi;

    const weightedMolWeight = yi * c.molWeight;
    const weightedPc = yi * c.criticalPressure;
    const weightedTc = yi * c.criticalTemp;

    ma += weightedMolWeight;
    uncorrectedPpc += weightedPc;
    uncorrectedTpc += weightedTc;

    return {
      component: c,
      moleFraction: c.moleFraction,
      molePercent: c.moleFraction * 100,
      massFraction: 0,
      weightedMolWeight,
      weightedPc,
      weightedTc
    };
  });

  // Calculate mass fractions
  componentsBreakdown.forEach((item) => {
    item.massFraction = ma > 0 ? item.weightedMolWeight / ma : 0;
  });

  // 2. Gas Specific Gravity (Air = 1.0)
  const gasSpecificGravity = ma / AIR_MOL_WEIGHT;

  // Override Ppc / Tpc if Standing method selected
  if (ppcMethod === 'standing_dry' || ppcMethod === 'standing_condensate') {
    const stRes = calculateStandingGasPpcTpc(gasSpecificGravity, ppcMethod === 'standing_condensate');
    uncorrectedPpc = stRes.ppc;
    uncorrectedTpc = stRes.tpc;
  }

  // 3. Sour Gas / Non-Hydrocarbon Corrections
  const sourGasCorr = calculateWichertAzizCorrection(yH2S, yCO2, uncorrectedTpc, uncorrectedPpc);
  const isSourGas = yH2S > 0 || yCO2 > 0 || yN2 > 0;

  let pseudoCriticalTemp = uncorrectedTpc;
  let pseudoCriticalPressure = uncorrectedPpc;

  if (sourGasMethod === 'carr_kobayashi_burrows') {
    const ckb = calculateCarrKobayashiBurrowsCorrection(yH2S, yCO2, yN2, uncorrectedTpc, uncorrectedPpc);
    pseudoCriticalTemp = ckb.correctedTpc;
    pseudoCriticalPressure = ckb.correctedPpc;
  } else if (sourGasMethod === 'piper') {
    const pip = calculatePiperCorrection(components, normFactor);
    pseudoCriticalTemp = pip.correctedTpc;
    pseudoCriticalPressure = pip.correctedPpc;
  } else if (sourGasMethod === 'none') {
    pseudoCriticalTemp = uncorrectedTpc;
    pseudoCriticalPressure = uncorrectedPpc;
  } else {
    // Default: Wichert-Aziz
    pseudoCriticalTemp = sourGasCorr.correctedTpc;
    pseudoCriticalPressure = sourGasCorr.correctedPpc;
  }

  // 4. Reduced conditions
  const tempRankine = tempFahrenheit + 459.67;
  const pseudoReducedTempUncorrected = uncorrectedTpc > 0 ? tempRankine / uncorrectedTpc : 1.0;
  const pseudoReducedPressureUncorrected = uncorrectedPpc > 0 ? pressurePsia / uncorrectedPpc : 1.0;

  const pseudoReducedTemp = tempRankine / pseudoCriticalTemp;
  const pseudoReducedPressure = pressurePsia / pseudoCriticalPressure;

  // 5. Compressibility Factor Z
  const zFactor = calculateZFactor(pseudoReducedPressure, pseudoReducedTemp, zFactorMethod);

  // 6. Ideal & Real Gas Density
  const idealDensityLbFt3 = (pressurePsia * ma) / (R_CONST * tempRankine);
  const realDensityLbFt3 = idealDensityLbFt3 / zFactor;

  // Convert to SI units (kg/m3)
  const idealDensityKgM3 = idealDensityLbFt3 * 16.0185;
  const realDensityKgM3 = realDensityLbFt3 * 16.0185;

  // 7. Gas Formation Volume Factor Bg
  const bgFt3Scf = (0.02827 * zFactor * tempRankine) / Math.max(14.7, pressurePsia);
  const bgBblScf = bgFt3Scf / 5.615;

  // 8. Gas Viscosity mu_g (cP)
  const gasViscosityCp = calculateGasViscosityLeeGonzalez(tempRankine, ma, realDensityLbFt3);

  // 9. Isothermal Gas Compressibility cg (1/psi)
  const deltaP = 10.0;
  const zPlus = calculateZFactor((pressurePsia + deltaP) / pseudoCriticalPressure, pseudoReducedTemp, zFactorMethod);
  const zMinus = calculateZFactor((pressurePsia - deltaP) / pseudoCriticalPressure, pseudoReducedTemp, zFactorMethod);
  const dZdP = (zPlus - zMinus) / (2.0 * deltaP);
  const isothermalCompressibilityPsi = (1.0 / pressurePsia) - (1.0 / zFactor) * dZdP;

  return {
    apparentMolWeight: ma,
    gasSpecificGravity,
    pseudoCriticalPressureUncorrected: uncorrectedPpc,
    pseudoCriticalTempUncorrected: uncorrectedTpc,
    pseudoReducedPressureUncorrected,
    pseudoReducedTempUncorrected,
    isSourGasCorrected: isSourGas,
    wichertAzizFactor: sourGasCorr.epsilon,
    pseudoCriticalPressure,
    pseudoCriticalTemp,
    pseudoReducedPressure,
    pseudoReducedTemp,
    zFactor,
    zFactorMethod,
    ppcMethod,
    sourGasMethod,
    idealDensityLbFt3,
    realDensityLbFt3,
    idealDensityKgM3,
    realDensityKgM3,
    gasFormationVolumeFactorBgFt3Scf: bgFt3Scf,
    gasFormationVolumeFactorBgBblScf: bgBblScf,
    gasViscosityCp,
    isothermalCompressibilityPsi,
    componentsBreakdown,
    totalMoleFraction,
    isValidComposition
  };
}

/**
 * Generates sensitivity array for charts (Pressure vs Density, Z-factor, Bg, Viscosity)
 */
export function generatePressureSensitivityCurve(
  components: GasComponent[],
  temperatureFahrenheit: number,
  minPressurePsia = 14.7,
  maxPressurePsia = 5000,
  steps = 60,
  zFactorMethod: ZFactorMethod = 'hall_yarborough',
  ppcMethod: GasPpcMethod = 'kay_compositional'
): SensitivityPoint[] {
  const points: SensitivityPoint[] = [];
  const stepSize = (maxPressurePsia - minPressurePsia) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const p = minPressurePsia + i * stepSize;
    const res = calculateFluidProperties(components, p, temperatureFahrenheit, zFactorMethod, ppcMethod);
    points.push({
      pressure: Math.round(p),
      temperature: temperatureFahrenheit,
      idealDensity: Number(res.idealDensityLbFt3.toFixed(4)),
      realDensity: Number(res.realDensityLbFt3.toFixed(4)),
      zFactor: Number(res.zFactor.toFixed(4)),
      bgFt3Scf: Number(res.gasFormationVolumeFactorBgFt3Scf.toFixed(6)),
      viscosityCp: Number(res.gasViscosityCp.toFixed(4))
    });
  }

  return points;
}

/**
 * Calculates Crude Oil PVT properties supporting Standing, Vasquez-Beggs, Glaso, Marhoun, and Petrosky-Farshad models.
 */
export function calculateBlackOilProperties(inputs: BlackOilInputs): BlackOilResults {
  const {
    pressure,
    temperature,
    apiGravity,
    gasSpecificGravity,
    solutionGasOilRatioInitial,
    correlationMethod = 'standing'
  } = inputs;

  const validGasSg = Math.max(0.1, gasSpecificGravity);
  const validApi = Math.max(5.0, apiGravity);
  const validTemp = Math.max(32.0, temperature);
  const validRsInit = Math.max(0.0, solutionGasOilRatioInitial);

  const oilSpecificGravity = 141.5 / (131.5 + validApi);

  let bubblePointPressure = 14.7;
  let standingAFactor = 0;
  let standingFFactor = 0;

  // 1. Calculate Bubble Point Pressure (Pb) based on selected correlation
  if (correlationMethod === 'standing') {
    standingAFactor = 0.00091 * validTemp - 0.0125 * validApi;
    const rawPb = 18.2 * (Math.pow(validRsInit / validGasSg, 0.83) * Math.pow(10, standingAFactor) - 1.4);
    bubblePointPressure = Math.max(14.7, rawPb);
  } else if (correlationMethod === 'vasquez_beggs') {
    const c1 = validApi <= 30 ? 0.0362 : 0.0178;
    const c2 = validApi <= 30 ? 1.0937 : 1.1870;
    const c3 = validApi <= 30 ? 25.7240 : 23.9310;
    const termExp = c3 * (validApi / (validTemp + 460.0));
    const rawPb = Math.pow(validRsInit / (c1 * validGasSg * Math.exp(termExp)), 1.0 / c2);
    bubblePointPressure = Math.max(14.7, rawPb);
  } else if (correlationMethod === 'glaso') {
    const pbStar = Math.pow(validRsInit / validGasSg, 0.816) * Math.pow(validTemp, 0.172) / Math.pow(validApi, 0.989);
    const logPbStar = Math.log10(Math.max(0.001, pbStar));
    const logPb = 1.7669 + 1.7447 * logPbStar - 0.30218 * Math.pow(logPbStar, 2);
    bubblePointPressure = Math.max(14.7, Math.pow(10, logPb));
  } else if (correlationMethod === 'marhoun') {
    const tempR = validTemp + 460.0;
    const rawPb = 0.0053808 * Math.pow(validRsInit, 0.715082) * Math.pow(validGasSg, -1.87784) *
                  Math.pow(oilSpecificGravity, 3.1437) * Math.pow(tempR, 1.32657);
    bubblePointPressure = Math.max(14.7, rawPb);
  } else if (correlationMethod === 'petrosky_farshad') {
    const xPf = 4.561e-5 * Math.pow(validTemp, 1.3911) - 7.916e-4 * Math.pow(validApi, 1.5410);
    const term1 = Math.pow(validRsInit, 0.577421) / Math.pow(validGasSg, 0.8439);
    const rawPb = 112.727 * (term1 * Math.pow(10, xPf) - 12.340);
    bubblePointPressure = Math.max(14.7, rawPb);
  }

  // 2. Determine actual solution GOR (Rs) at current pressure
  const isSaturated = pressure < bubblePointPressure;
  let currentSolutionGasOilRatio: number;

  if (!isSaturated) {
    currentSolutionGasOilRatio = validRsInit;
  } else {
    if (correlationMethod === 'standing') {
      const term = (pressure / 18.2 + 1.4) * Math.pow(10, 0.0125 * validApi - 0.00091 * validTemp);
      currentSolutionGasOilRatio = validGasSg * Math.pow(Math.max(0, term), 1 / 0.83);
    } else if (correlationMethod === 'vasquez_beggs') {
      const c1 = validApi <= 30 ? 0.0362 : 0.0178;
      const c2 = validApi <= 30 ? 1.0937 : 1.1870;
      const c3 = validApi <= 30 ? 25.7240 : 23.9310;
      const termExp = c3 * (validApi / (validTemp + 460.0));
      currentSolutionGasOilRatio = c1 * validGasSg * Math.pow(pressure, c2) * Math.exp(termExp);
    } else if (correlationMethod === 'glaso') {
      const logP = Math.log10(Math.max(14.7, pressure));
      // Solving quadratic equation for logPbStar
      const a = -0.30218;
      const b = 1.7447;
      const c = 1.7669 - logP;
      const discr = b * b - 4 * a * c;
      const logPbStar = discr >= 0 ? (-b + Math.sqrt(discr)) / (2 * a) : 1.0;
      const pbStar = Math.pow(10, logPbStar);
      currentSolutionGasOilRatio = validGasSg * Math.pow((pbStar * Math.pow(validApi, 0.989)) / Math.pow(validTemp, 0.172), 1.0 / 0.816);
    } else if (correlationMethod === 'marhoun') {
      const tempR = validTemp + 460.0;
      const denom = 0.0053808 * Math.pow(validGasSg, -1.87784) * Math.pow(oilSpecificGravity, 3.1437) * Math.pow(tempR, 1.32657);
      currentSolutionGasOilRatio = Math.pow(Math.max(0, pressure / denom), 1.0 / 0.715082);
    } else {
      // Petrosky-Farshad
      const xPf = 4.561e-5 * Math.pow(validTemp, 1.3911) - 7.916e-4 * Math.pow(validApi, 1.5410);
      const term1 = (pressure / 112.727 + 12.340) * Math.pow(10, -xPf) * Math.pow(validGasSg, 0.8439);
      currentSolutionGasOilRatio = Math.pow(Math.max(0, term1), 1.0 / 0.577421);
    }
  }

  // 3. Oil Formation Volume Factor (Bo)
  let oilFormationVolumeFactor = 1.0;

  if (correlationMethod === 'standing') {
    standingFFactor = currentSolutionGasOilRatio * Math.pow(validGasSg / oilSpecificGravity, 0.5) + 1.25 * validTemp;
    oilFormationVolumeFactor = 0.9759 + 0.000120 * Math.pow(standingFFactor, 1.2);
  } else if (correlationMethod === 'vasquez_beggs') {
    const b1 = validApi <= 30 ? 4.677e-4 : 4.670e-4;
    const b2 = validApi <= 30 ? 1.751e-5 : 1.100e-5;
    const b3 = validApi <= 30 ? -1.811e-8 : 1.337e-9;
    oilFormationVolumeFactor = 1.0 + b1 * currentSolutionGasOilRatio +
                               (validTemp - 60.0) * (validApi / validGasSg) * (b2 + b3 * currentSolutionGasOilRatio);
  } else if (correlationMethod === 'glaso') {
    const aOb = currentSolutionGasOilRatio * Math.pow(validGasSg / oilSpecificGravity, 0.526) + 0.968 * validTemp;
    const logA = Math.log10(Math.max(0.1, aOb));
    const logBoMinus1 = -3.586 + 1.0282 * logA - 0.002761 * logA * logA;
    oilFormationVolumeFactor = 1.0 + Math.pow(10, logBoMinus1);
  } else if (correlationMethod === 'marhoun') {
    const tempR = validTemp + 460.0;
    const f = Math.pow(currentSolutionGasOilRatio, 0.742390) * Math.pow(validGasSg, 0.323294) *
              Math.pow(oilSpecificGravity, -1.202040) * Math.pow(tempR, 0.323294);
    oilFormationVolumeFactor = 0.497069 + 0.862963e-3 * f + 0.182594e-6 * f * f;
  } else {
    // Petrosky-Farshad
    const term1 = Math.pow(currentSolutionGasOilRatio, 0.3738) * (Math.pow(validGasSg, 0.2914) / Math.pow(oilSpecificGravity, 0.6265)) +
                  0.24626 * Math.pow(validTemp, 0.5371);
    oilFormationVolumeFactor = 1.0113 + 7.2046e-5 * Math.pow(term1, 3.0936);
  }

  // 4. Isothermal Compressibility Coefficient (co in 1/psi)
  let oilCompressibility = 1e-5;
  if (correlationMethod === 'vasquez_beggs') {
    oilCompressibility = (-1433.0 + 5.0 * validRsInit + 17.2 * validTemp - 1180.0 * validGasSg + 12.61 * validApi) /
                         (1e5 * Math.max(14.7, pressure));
  } else if (correlationMethod === 'petrosky_farshad') {
    oilCompressibility = 1.705e-7 * Math.pow(validRsInit, 0.69307) * Math.pow(validGasSg, 0.1835) *
                         Math.pow(validApi, 0.3272) * Math.pow(validTemp, 0.6729) * Math.pow(Math.max(14.7, pressure), -0.5906);
  } else {
    // Default Standing derivative co estimation
    oilCompressibility = (5 * Math.pow(10, -6));
  }
  oilCompressibility = Math.max(1e-6, Math.min(1e-3, oilCompressibility));

  // 5. Oil Density (lb/ft3) & Undersaturated adjustment above bubble point
  let oilDensityLbFt3 = (62.4 * oilSpecificGravity + 0.0136 * currentSolutionGasOilRatio * validGasSg) / oilFormationVolumeFactor;

  if (!isSaturated && pressure > bubblePointPressure) {
    // Contract formation volume factor and expand density using co above bubble point
    oilFormationVolumeFactor = oilFormationVolumeFactor * Math.exp(-oilCompressibility * (pressure - bubblePointPressure));
    oilDensityLbFt3 = oilDensityLbFt3 * Math.exp(oilCompressibility * (pressure - bubblePointPressure));
  }

  // 6. Dead and Live Oil Viscosity (Beggs-Robinson / Vasquez-Beggs)
  const xVisc = Math.pow(validTemp, -1.163);
  const yVisc = Math.pow(10, 1.865 - 0.02508 * validApi - 0.5644 * Math.log10(validTemp));
  const muDead = Math.pow(10, yVisc) - 1.0;
  const aVisc = 10.715 * Math.pow(currentSolutionGasOilRatio + 100, -0.515);
  const bVisc = 5.44 * Math.pow(currentSolutionGasOilRatio + 150, -0.338);
  const oilViscosityCp = Math.max(0.2, aVisc * Math.pow(Math.max(0.1, muDead), bVisc));

  return {
    bubblePointPressure,
    currentSolutionGasOilRatio,
    oilFormationVolumeFactor,
    oilSpecificGravity,
    oilCompressibility,
    oilDensityLbFt3,
    oilViscosityCp,
    fluidState: isSaturated ? 'Saturated' : 'Undersaturated',
    isSaturated,
    correlationMethod,
    standingAFactor,
    standingFFactor
  };
}

/**
 * Generates sensitivity curve for Crude Oil (Bo & Rs vs. Pressure)
 */
export function generateOilPressureSensitivityCurve(
  inputs: BlackOilInputs,
  minPressurePsia = 14.7,
  maxPressurePsia = 5000,
  steps = 80
): BlackOilSensitivityPoint[] {
  const points: BlackOilSensitivityPoint[] = [];
  const maxP = Math.max(maxPressurePsia, inputs.pressure + 1000);
  const stepSize = (maxP - minPressurePsia) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const p = minPressurePsia + i * stepSize;
    const res = calculateBlackOilProperties({ ...inputs, pressure: p });
    points.push({
      pressure: Math.round(p),
      bo: Number(res.oilFormationVolumeFactor.toFixed(4)),
      rs: Number(res.currentSolutionGasOilRatio.toFixed(2))
    });
  }

  return points;
}
