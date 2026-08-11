import { IprInputs, IprResults } from '../types';

/**
 * Calculates Fluid Flow & Inflow Performance Relationship (IPR) properties
 * using Darcy's Radial Flow Law and Vogel's Empirical Model.
 */
export function calculateIprProperties(
  inputs: IprInputs,
  unitSystem: 'field' | 'si'
): IprResults {
  const isField = unitSystem === 'field';

  // Normalize all inputs to Field Units (md, ft, psia, cP, rb/STB, STB/day)
  const k = Math.max(0.01, inputs.permeability);
  const h = isField ? Math.max(0.1, inputs.thickness) : Math.max(0.1, inputs.thickness) * 3.28084;
  const pr = isField
    ? Math.max(14.7, inputs.reservoirPressure)
    : Math.max(1.013, inputs.reservoirPressure) / 0.0689476;
  const re = isField ? Math.max(10, inputs.drainageRadius) : Math.max(3, inputs.drainageRadius) * 3.28084;
  const rw = isField ? Math.max(0.05, inputs.wellboreRadius) : Math.max(0.015, inputs.wellboreRadius) * 3.28084;
  const S = inputs.skinFactor;
  const mu = Math.max(0.01, inputs.viscosity);
  const Bo = Math.max(0.5, inputs.formationVolumeFactor);
  const pb = isField
    ? Math.max(14.7, inputs.bubblePointPressure)
    : Math.max(1.013, inputs.bubblePointPressure) / 0.0689476;
  const pwfTarget = isField
    ? Math.max(0, Math.min(pr, inputs.targetPwf))
    : Math.max(0, Math.min(pr, inputs.targetPwf / 0.0689476));

  // 1. Darcy Productivity Index (J)
  const lnRatio = Math.log(re / rw);
  const denomActual = lnRatio + S;
  const safeDenomActual = denomActual <= 0.1 ? 0.1 : denomActual;

  // J in STB/day/psi
  const J_field = (0.00708 * k * h) / (mu * Bo * safeDenomActual);
  const J_ideal_field = (0.00708 * k * h) / (mu * Bo * lnRatio);

  // Conversion factor for display: STB/day to m3/day = 0.158987; psi to bar = 0.0689476
  // 1 STB/day/psi = 0.158987 / 0.0689476 = 2.30588 m3/day/bar
  const jDisplayFactor = isField ? 1.0 : 2.30588;
  const qDisplayFactor = isField ? 1.0 : 0.158987;
  const pDisplayFactor = isField ? 1.0 : 0.0689476;

  // 2. Helper function to compute q(pwf) given J and Pb
  const computeQ = (p_wf: number, jVal: number) => {
    if (p_wf >= pr) return 0;

    const useCombined = inputs.useVogelCombined && pr > pb;

    if (!useCombined) {
      // Pure Vogel equation for two-phase flow
      const qMax = (jVal * pr) / 1.8;
      const ratio = Math.max(0, p_wf / pr);
      return Math.max(0, qMax * (1 - 0.2 * ratio - 0.8 * Math.pow(ratio, 2)));
    } else {
      // Combined Vogel & Darcy model (Undersaturated Reservoir Pr > Pb)
      if (p_wf >= pb) {
        // Single phase Darcy linear inflow above bubble point
        return Math.max(0, jVal * (pr - p_wf));
      } else {
        // Two-phase Vogel below bubble point
        const q_b = jVal * (pr - pb);
        const q_vogel_max = (jVal * pb) / 1.8;
        const ratio = Math.max(0, p_wf / pb);
        const q_vogel = q_vogel_max * (1 - 0.2 * ratio - 0.8 * Math.pow(ratio, 2));
        return Math.max(0, q_b + q_vogel);
      }
    }
  };

  const qMax_field = computeQ(0, J_field);
  const qTarget_field = computeQ(pwfTarget, J_field);

  // 3. Flow Efficiency & Skin Pressure Drop
  const drawdown_field = pr - pwfTarget;
  const deltaP_skin_field = (qTarget_field / (J_ideal_field || 1)) * (S / lnRatio);
  const feEfficiency = drawdown_field > 0 ? Math.max(0, (drawdown_field - deltaP_skin_field) / drawdown_field) : 1.0;

  // 4. Generate Curve Points for Graph
  const steps = 60;
  const stepSize = pr / (steps - 1);
  const iprCurveData = [];

  for (let i = steps - 1; i >= 0; i--) {
    const pwf_val_field = i * stepSize;
    const q_actual_field = computeQ(pwf_val_field, J_field);
    const q_ideal_field = computeQ(pwf_val_field, J_ideal_field);

    iprCurveData.push({
      pwf: Number((pwf_val_field * pDisplayFactor).toFixed(1)),
      q: Number((q_actual_field * qDisplayFactor).toFixed(1)),
      qIdealSkin0: Number((q_ideal_field * qDisplayFactor).toFixed(1))
    });
  }

  return {
    productivityIndex: Number((J_field * jDisplayFactor).toFixed(4)),
    qMaxAof: Number((qMax_field * qDisplayFactor).toFixed(1)),
    qAtTargetPwf: Number((qTarget_field * qDisplayFactor).toFixed(1)),
    drawdownAtTarget: Number((drawdown_field * pDisplayFactor).toFixed(1)),
    feEfficiency: Number((feEfficiency * 100).toFixed(1)),
    skinPressureDrop: Number((deltaP_skin_field * pDisplayFactor).toFixed(1)),
    iprCurveData
  };
}
