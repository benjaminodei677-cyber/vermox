import { CompositionPreset } from '../types';

export const COMPOSITION_PRESETS: CompositionPreset[] = [
  {
    id: 'dry_gas',
    name: 'Dry Natural Gas',
    description: 'High methane content (92%+), minimal heavy hydrocarbons, low liquid drop-out.',
    compositions: {
      c1: 0.92,
      c2: 0.05,
      c3: 0.015,
      ic4: 0.003,
      nc4: 0.002,
      ic5: 0.001,
      nc5: 0.001,
      c6: 0.001,
      c7plus: 0.002,
      n2: 0.005,
      co2: 0.001,
      h2s: 0.000
    }
  },
  {
    id: 'wet_gas',
    name: 'Wet Gas / Rich Gas',
    description: 'Moderate C2-C5 heavy fractions yielding valuable natural gas liquids (NGLs).',
    compositions: {
      c1: 0.81,
      c2: 0.09,
      c3: 0.045,
      ic4: 0.01,
      nc4: 0.015,
      ic5: 0.005,
      nc5: 0.005,
      c6: 0.005,
      c7plus: 0.01,
      n2: 0.003,
      co2: 0.002,
      h2s: 0.000
    }
  },
  {
    id: 'gas_condensate',
    name: 'Gas Condensate Mixture',
    description: 'Significant C7+ fractions exhibiting retrograde condensation at reservoir pressure.',
    compositions: {
      c1: 0.70,
      c2: 0.09,
      c3: 0.05,
      ic4: 0.015,
      nc4: 0.02,
      ic5: 0.01,
      nc5: 0.015,
      c6: 0.01,
      c7plus: 0.08,
      n2: 0.005,
      co2: 0.005,
      h2s: 0.000
    },
    c7Plus: {
      molWeight: 145.0,
      specificGravity: 0.785
    }
  },
  {
    id: 'sour_gas',
    name: 'Sour Gas (H₂S & CO₂ Rich)',
    description: 'High non-hydrocarbon acid gases requiring Wichert-Aziz pseudo-critical correction.',
    compositions: {
      c1: 0.62,
      c2: 0.08,
      c3: 0.04,
      ic4: 0.008,
      nc4: 0.012,
      ic5: 0.005,
      nc5: 0.005,
      c6: 0.005,
      c7plus: 0.005,
      n2: 0.02,
      co2: 0.08,
      h2s: 0.12
    }
  },
  {
    id: 'high_nitrogen',
    name: 'High Nitrogen Gas',
    description: 'Inert gas blend with elevated N2 mole fraction affecting heating value.',
    compositions: {
      c1: 0.70,
      c2: 0.05,
      c3: 0.02,
      ic4: 0.003,
      nc4: 0.002,
      ic5: 0.001,
      nc5: 0.001,
      c6: 0.001,
      c7plus: 0.002,
      n2: 0.21,
      co2: 0.000,
      h2s: 0.000
    }
  },
  {
    id: 'pure_methane',
    name: 'Pure Methane (100% C₁)',
    description: 'Single component methane reference for ideal vs real thermodynamic comparison.',
    compositions: {
      c1: 1.00,
      c2: 0.00,
      c3: 0.00,
      ic4: 0.00,
      nc4: 0.00,
      ic5: 0.00,
      nc5: 0.00,
      c6: 0.00,
      c7plus: 0.00,
      n2: 0.00,
      co2: 0.00,
      h2s: 0.00
    }
  }
];
