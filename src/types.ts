export type AppMode = 'pvt' | 'ipr';
export type FluidType = 'gas' | 'oil';

export type BlackOilMethod = 'standing' | 'vasquez_beggs' | 'glaso' | 'marhoun' | 'petrosky_farshad';
export type ZFactorMethod = 'hall_yarborough' | 'dranchuk_abu_kassem';
export type GasPpcMethod = 'kay_compositional' | 'standing_dry' | 'standing_condensate';
export type SourGasMethod = 'wichert_aziz' | 'carr_kobayashi_burrows' | 'piper' | 'none';

export interface GasComponent {
  id: string;
  name: string;
  formula: string;
  moleFraction: number;
  molWeight: number; // lb/lb-mol
  criticalTemp: number; // °R
  criticalPressure: number; // psia
  isSourGas?: boolean;
}

export interface C7PlusConfig {
  molWeight: number; // e.g. 110 - 200 lb/lb-mol
  specificGravity: number; // e.g. 0.7 - 0.85
}

export interface ReservoirConditions {
  pressure: number; // psia
  temperature: number; // °F
  unitSystem: 'field' | 'si'; // field (psia, °F, lb/ft3) vs SI (bar, °C, kg/m3)
}

export interface BlackOilInputs {
  pressure: number; // psia
  temperature: number; // °F
  apiGravity: number; // °API
  gasSpecificGravity: number; // Air = 1.0
  solutionGasOilRatioInitial: number; // scf/STB
  correlationMethod?: BlackOilMethod;
}

export interface IprInputs {
  permeability: number; // md
  thickness: number; // ft or m
  reservoirPressure: number; // psia or bar
  drainageRadius: number; // ft or m
  wellboreRadius: number; // ft or m
  skinFactor: number; // dimensionless (-5 to +20)
  viscosity: number; // cP or mPa.s
  formationVolumeFactor: number; // rb/STB or m3/m3
  bubblePointPressure: number; // psia or bar
  useVogelCombined: boolean;
  targetPwf: number; // psia or bar
}

export interface IprResults {
  productivityIndex: number; // STB/day/psi or m3/day/bar
  qMaxAof: number; // STB/day or m3/day
  qAtTargetPwf: number; // STB/day or m3/day
  drawdownAtTarget: number; // psi or bar
  feEfficiency: number; // Flow Efficiency = (Pr - Pwf - DeltaP_skin) / (Pr - Pwf)
  skinPressureDrop: number; // psi or bar
  iprCurveData: Array<{
    pwf: number;
    q: number;
    qIdealSkin0?: number;
  }>;
}

export interface BlackOilResults {
  bubblePointPressure: number; // psia (pb)
  currentSolutionGasOilRatio: number; // scf/STB (Rs)
  oilFormationVolumeFactor: number; // rb/STB (Bo)
  oilSpecificGravity: number; // gamma_o (water = 1.0)
  oilCompressibility: number; // 1/psi (co)
  oilDensityLbFt3: number; // lb/ft3 (rho_o)
  oilViscosityCp: number; // cP
  fluidState: 'Saturated' | 'Undersaturated';
  isSaturated: boolean;
  correlationMethod: BlackOilMethod;
  standingAFactor?: number;
  standingFFactor?: number;
}

export interface CompositionPreset {
  id: string;
  name: string;
  description: string;
  compositions: Record<string, number>; // component id -> moleFraction
  c7Plus?: C7PlusConfig;
}

export interface CalculatedResults {
  apparentMolWeight: number; // Ma (lb/lb-mol)
  gasSpecificGravity: number; // gamma_g (air = 1.0)
  pseudoCriticalPressureUncorrected: number; // P_pc (psia)
  pseudoCriticalTempUncorrected: number; // T_pc (°R)
  
  pseudoReducedPressureUncorrected: number; // P_pr uncorrected
  pseudoReducedTempUncorrected: number; // T_pr uncorrected
  
  // Sour gas Wichert-Aziz corrected values
  isSourGasCorrected: boolean;
  wichertAzizFactor: number; // epsilon (°R)
  pseudoCriticalPressure: number; // P_pc' (psia)
  pseudoCriticalTemp: number; // T_pc' (°R)
  
  pseudoReducedPressure: number; // P_pr
  pseudoReducedTemp: number; // T_pr
  
  zFactor: number; // Z
  zFactorMethod: ZFactorMethod;
  ppcMethod: GasPpcMethod;
  sourGasMethod?: SourGasMethod;

  idealDensityLbFt3: number; // lb/ft3
  realDensityLbFt3: number; // lb/ft3
  
  idealDensityKgM3: number; // kg/m3
  realDensityKgM3: number; // kg/m3
  
  gasFormationVolumeFactorBgFt3Scf: number; // ft3/scf
  gasFormationVolumeFactorBgBblScf: number; // bbl/scf
  
  gasViscosityCp: number; // cP (Lee-Gonzalez-Eakin)
  isothermalCompressibilityPsi: number; // 1/psi (cg)
  
  componentsBreakdown: Array<{
    component: GasComponent;
    moleFraction: number;
    molePercent: number;
    massFraction: number;
    weightedMolWeight: number;
    weightedPc: number;
    weightedTc: number;
  }>;
  
  totalMoleFraction: number;
  isValidComposition: boolean;
}

export interface SensitivityPoint {
  pressure: number; // psia
  temperature: number; // °F
  idealDensity: number;
  realDensity: number;
  zFactor: number;
  bgFt3Scf: number;
  viscosityCp: number;
}

export interface BlackOilSensitivityPoint {
  pressure: number;
  bo: number;
  rs: number;
}

