import { GasComponent } from '../types';

export const PURE_GAS_COMPONENTS: GasComponent[] = [
  {
    id: 'c1',
    name: 'Methane',
    formula: 'CH₄',
    moleFraction: 0.85,
    molWeight: 16.043,
    criticalTemp: 343.00,
    criticalPressure: 666.4
  },
  {
    id: 'c2',
    name: 'Ethane',
    formula: 'C₂H₆',
    moleFraction: 0.08,
    molWeight: 30.070,
    criticalTemp: 549.59,
    criticalPressure: 706.5
  },
  {
    id: 'c3',
    name: 'Propane',
    formula: 'C₃H₈',
    moleFraction: 0.04,
    molWeight: 44.097,
    criticalTemp: 665.73,
    criticalPressure: 616.0
  },
  {
    id: 'ic4',
    name: 'i-Butane',
    formula: 'i-C₄H₁₀',
    moleFraction: 0.005,
    molWeight: 58.123,
    criticalTemp: 734.13,
    criticalPressure: 527.9
  },
  {
    id: 'nc4',
    name: 'n-Butane',
    formula: 'n-C₄H₁₀',
    moleFraction: 0.005,
    molWeight: 58.123,
    criticalTemp: 765.29,
    criticalPressure: 550.6
  },
  {
    id: 'ic5',
    name: 'i-Pentane',
    formula: 'i-C₅H₁₂',
    moleFraction: 0.002,
    molWeight: 72.150,
    criticalTemp: 828.70,
    criticalPressure: 490.4
  },
  {
    id: 'nc5',
    name: 'n-Pentane',
    formula: 'n-C₅H₁₂',
    moleFraction: 0.002,
    molWeight: 72.150,
    criticalTemp: 845.37,
    criticalPressure: 488.6
  },
  {
    id: 'c6',
    name: 'Hexane',
    formula: 'C₆H₁₄',
    moleFraction: 0.001,
    molWeight: 86.177,
    criticalTemp: 913.27,
    criticalPressure: 436.9
  },
  {
    id: 'c7plus',
    name: 'Heptanes Plus',
    formula: 'C₇₊',
    moleFraction: 0.005,
    molWeight: 114.231,
    criticalTemp: 1020.00,
    criticalPressure: 397.0
  },
  {
    id: 'n2',
    name: 'Nitrogen',
    formula: 'N₂',
    moleFraction: 0.005,
    molWeight: 28.013,
    criticalTemp: 227.16,
    criticalPressure: 493.1,
    isSourGas: false
  },
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    moleFraction: 0.003,
    molWeight: 44.010,
    criticalTemp: 547.41,
    criticalPressure: 1070.6,
    isSourGas: true
  },
  {
    id: 'h2s',
    name: 'Hydrogen Sulfide',
    formula: 'H₂S',
    moleFraction: 0.002,
    molWeight: 34.082,
    criticalTemp: 672.35,
    criticalPressure: 1300.0,
    isSourGas: true
  }
];
