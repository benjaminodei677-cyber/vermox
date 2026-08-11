import React from 'react';
import katex from 'katex';
import { CalculatedResults, ReservoirConditions, FluidType, BlackOilInputs, BlackOilResults } from '../types';
import { BookOpen, Droplet, Flame, Layers } from 'lucide-react';

interface EquationsSectionProps {
  fluidType?: FluidType;
  results: CalculatedResults;
  conditions: ReservoirConditions;
  blackOilInputs?: BlackOilInputs;
  blackOilResults?: BlackOilResults;
  theme?: 'dark' | 'light';
}

export const EquationsSection: React.FC<EquationsSectionProps> = ({
  fluidType = 'gas',
  results,
  conditions,
  blackOilInputs,
  blackOilResults,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const isField = conditions.unitSystem === 'field';
  const pressureUnit = isField ? 'psia' : 'bar';
  const rsUnit = isField ? 'scf/STB' : 'm³/m³';
  const boUnit = isField ? 'rb/STB' : 'm³/m³';
  const densityUnit = isField ? 'lb/ft³' : 'kg/m³';
  const tempCriticalUnit = isField ? '°R' : 'K';

  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const boxBg = isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800';

  const renderLatex = (latex: string) => {
    try {
      return {
        __html: katex.renderToString(latex, { throwOnError: false, displayMode: true })
      };
    } catch {
      return { __html: latex };
    }
  };

  if (fluidType === 'oil' && blackOilInputs && blackOilResults) {
    const method = blackOilResults.correlationMethod || 'standing';
    const pbDisplay = isField ? blackOilResults.bubblePointPressure : blackOilResults.bubblePointPressure * 0.0689476;
    const rsDisplay = isField ? blackOilResults.currentSolutionGasOilRatio : blackOilResults.currentSolutionGasOilRatio * 0.178107;
    const rsiDisplay = isField ? blackOilInputs.solutionGasOilRatioInitial : blackOilInputs.solutionGasOilRatioInitial * 0.178107;
    const coDisplay = blackOilResults.oilCompressibility;

    const methodNameMap: Record<string, string> = {
      standing: "Standing's Correlation (1947 / 1977)",
      vasquez_beggs: 'Vasquez-Beggs Correlation (1980)',
      glaso: 'Glaso Correlation (1980)',
      marhoun: 'Marhoun Correlation (1988)',
      petrosky_farshad: 'Petrosky-Farshad Correlation (1993)'
    };

    return (
      <div className={`${cardBg} border rounded-2xl p-5 sm:p-6 shadow-md space-y-6 transition-colors`}>
        
        {/* Title */}
        <div className="flex items-center space-x-3 border-b border-slate-800/60 pb-4">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Droplet className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {methodNameMap[method]} - Formulations & Equations
            </h2>
            <p className="text-xs text-amber-400 font-mono">
              Selected Empirical Black Oil PVT Correlation Suite
            </p>
          </div>
        </div>

        {/* Equations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. Bubble Point Pressure Equation */}
          <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-amber-400">1. Bubble Point Pressure (P<sub>b</sub>)</span>
              <span className="text-emerald-400">P<sub>b</sub> = {pbDisplay.toFixed(1)} {pressureUnit}</span>
            </div>

            {method === 'standing' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`P_b = 18.2 \left[ \left(\frac{R_{si}}{\gamma_g}\right)^{0.83} 10^{(0.00091 T - 0.0125 \text{API})} - 1.4 \right]`)} />
            )}
            {method === 'vasquez_beggs' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`P_b = \left[ \frac{R_{si}}{C_1 \gamma_{gs} \exp\left(C_3 \frac{\text{API}}{T + 460}\right)} \right]^{\frac{1}{C_2}}`)} />
            )}
            {method === 'glaso' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`\log_{10}(P_b) = 1.7669 + 1.7447 \log_{10}(P_b^*) - 0.30218 [\log_{10}(P_b^*)]^2`)} />
            )}
            {method === 'marhoun' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`P_b = 0.0053808 \, R_{si}^{0.715082} \, \gamma_g^{-1.87784} \, \gamma_o^{3.1437} \, T_R^{1.32657}`)} />
            )}
            {method === 'petrosky_farshad' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`P_b = 112.727 \left[ \left(\frac{R_{si}^{0.577421}}{\gamma_g^{0.8439}}\right) 10^{X_{pf}} - 12.340 \right]`)} />
            )}

            <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
              Calculated P<sub>b</sub> = <strong>{pbDisplay.toFixed(1)} {pressureUnit}</strong> for R<sub>si</sub> = {rsiDisplay.toFixed(1)} {rsUnit}
            </div>
          </div>

          {/* 2. Solution Gas-Oil Ratio Equation */}
          <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-amber-400">2. Solution Gas-Oil Ratio (R<sub>s</sub>)</span>
              <span className="text-cyan-400">R<sub>s</sub> = {rsDisplay.toFixed(1)} {rsUnit}</span>
            </div>

            {method === 'standing' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`R_s = \gamma_g \left[ \left(\frac{P}{18.2} + 1.4\right) 10^{(0.0125 \text{API} - 0.00091 T)} \right]^{1.2048}`)} />
            )}
            {method === 'vasquez_beggs' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`R_s = C_1 \gamma_{gs} P^{C_2} \exp\left[ C_3 \left(\frac{\text{API}}{T + 460}\right) \right]`)} />
            )}
            {method === 'glaso' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`R_s = \gamma_g \left[ \frac{P_b^* (\text{API})^{0.989}}{T^{0.172}} \right]^{\frac{1}{0.816}}`)} />
            )}
            {method === 'marhoun' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`R_s = \left[ \frac{P}{0.0053808 \, \gamma_g^{-1.87784} \, \gamma_o^{3.1437} \, T_R^{1.32657}} \right]^{\frac{1}{0.715082}}`)} />
            )}
            {method === 'petrosky_farshad' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`R_s = \left[ \left(\frac{P}{112.727} + 12.340\right) 10^{-X_{pf}} \gamma_g^{0.8439} \right]^{\frac{1}{0.577421}}`)} />
            )}

            <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
              State: <strong>{blackOilResults.fluidState}</strong> | R<sub>s</sub> = <strong>{rsDisplay.toFixed(1)} {rsUnit}</strong>
            </div>
          </div>

          {/* 3. Oil Formation Volume Factor Equation */}
          <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-amber-400">3. Saturated Oil Vol Factor (B<sub>o</sub>)</span>
              <span className="text-emerald-400">B<sub>o</sub> = {blackOilResults.oilFormationVolumeFactor.toFixed(4)} {boUnit}</span>
            </div>

            {method === 'standing' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`B_o = 0.9759 + 0.000120 \left[ R_s \left(\frac{\gamma_g}{\gamma_o}\right)^{0.5} + 1.25 T \right]^{1.2}`)} />
            )}
            {method === 'vasquez_beggs' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`B_o = 1.0 + B_1 R_s + (T - 60)\left(\frac{\text{API}}{\gamma_{gs}}\right) [B_2 + B_3 R_s]`)} />
            )}
            {method === 'glaso' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`B_o = 1.0 + 10^{\left( -3.586 + 1.0282 \log A_{ob} - 0.002761 \log^2 A_{ob} \right)}`)} />
            )}
            {method === 'marhoun' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`B_o = 0.497069 + 0.862963\times 10^{-3} F + 0.182594\times 10^{-6} F^2`)} />
            )}
            {method === 'petrosky_farshad' && (
              <div dangerouslySetInnerHTML={renderLatex(String.raw`B_o = 1.0113 + 7.2046\times 10^{-5} \left[ R_s^{0.3738} \left(\frac{\gamma_g^{0.2914}}{\gamma_o^{0.6265}}\right) + 0.24626 T^{0.5371} \right]^{3.0936}`)} />
            )}

            <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
              B<sub>o</sub> = <strong>{blackOilResults.oilFormationVolumeFactor.toFixed(4)} {boUnit}</strong>
            </div>
          </div>

          {/* 4. Isothermal Oil Compressibility & Undersaturated Density */}
          <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-amber-400">4. Undersaturated Compressibility & Density</span>
              <span className="text-purple-400">c<sub>o</sub> = {coDisplay.toExponential(3)} psi⁻¹</span>
            </div>

            <div dangerouslySetInnerHTML={renderLatex(String.raw`\rho_o(P) = \rho_{ob} \exp\left[ c_o (P - P_b) \right] \quad \text{for } P \ge P_b`)} />

            <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
              Calculated Crude Oil Density ρ<sub>o</sub> = <strong>{blackOilResults.oilDensityLbFt3.toFixed(2)} lb/ft³</strong>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Natural Gas Formulations
  const densityVal = isField ? results.realDensityLbFt3 : results.realDensityKgM3;
  const idealDensityVal = isField ? results.idealDensityLbFt3 : results.idealDensityKgM3;
  const zMethod = results.zFactorMethod;
  const ppcMeth = results.ppcMethod;

  return (
    <div className={`${cardBg} border rounded-2xl p-5 sm:p-6 shadow-md space-y-6 transition-colors`}>
      
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-slate-800/60 pb-4">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
          <BookOpen className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            Natural Gas Thermodynamics & EOS Correlations
          </h2>
          <p className="text-xs text-amber-400 font-mono">
            Active Z-factor: {zMethod === 'dranchuk_abu_kassem' ? 'Dranchuk-Abu Kassem (1975)' : 'Hall-Yarborough (1973)'}
          </p>
        </div>
      </div>

      {/* Equations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 1. Pseudocritical Properties */}
        <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
          <div className="flex items-center justify-between text-xs font-bold font-mono">
            <span className="text-amber-400">1. Pseudocritical Method ({ppcMeth})</span>
            <span className="text-emerald-400">P<sub>pc</sub> = {results.pseudoCriticalPressure.toFixed(1)} psia</span>
          </div>

          {ppcMeth === 'kay_compositional' ? (
            <div dangerouslySetInnerHTML={renderLatex(String.raw`P_{pc} = \sum_{i=1}^{n} y_i P_{ci} \quad \text{and} \quad T_{pc} = \sum_{i=1}^{n} y_i T_{ci}`)} />
          ) : ppcMeth === 'standing_dry' ? (
            <div dangerouslySetInnerHTML={renderLatex(String.raw`T_{pc} = 168 + 325\gamma_g - 12.5\gamma_g^2 \quad \text{and} \quad P_{pc} = 677 + 15\gamma_g - 37.5\gamma_g^2`)} />
          ) : (
            <div dangerouslySetInnerHTML={renderLatex(String.raw`T_{pc} = 187 + 330\gamma_g - 71.5\gamma_g^2 \quad \text{and} \quad P_{pc} = 706 - 51.7\gamma_g - 11.1\gamma_g^2`)} />
          )}

          <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono space-y-1">
            <div>
              Kay's Uncorrected: P<sub>pr</sub> = <strong>{results.pseudoReducedPressureUncorrected.toFixed(3)}</strong> | T<sub>pr</sub> = <strong>{results.pseudoReducedTempUncorrected.toFixed(3)}</strong> (P<sub>pc</sub> = {results.pseudoCriticalPressureUncorrected.toFixed(1)} psia, T<sub>pc</sub> = {results.pseudoCriticalTempUncorrected.toFixed(1)} °R)
            </div>
            {results.sourGasMethod === 'carr_kobayashi_burrows' && (
              <div className="text-amber-400">
                Carr-Kobayashi-Burrows Corrected: P<sub>pr</sub>' = <strong>{results.pseudoReducedPressure.toFixed(3)}</strong> | T<sub>pr</sub>' = <strong>{results.pseudoReducedTemp.toFixed(3)}</strong> (P<sub>pc</sub>' = {results.pseudoCriticalPressure.toFixed(1)} psia, T<sub>pc</sub>' = {results.pseudoCriticalTemp.toFixed(1)} °R)
              </div>
            )}
            {results.sourGasMethod === 'piper' && (
              <div className="text-amber-400">
                Piper et al. Corrected: P<sub>pr</sub>' = <strong>{results.pseudoReducedPressure.toFixed(3)}</strong> | T<sub>pr</sub>' = <strong>{results.pseudoReducedTemp.toFixed(3)}</strong> (P<sub>pc</sub>' = {results.pseudoCriticalPressure.toFixed(1)} psia, T<sub>pc</sub>' = {results.pseudoCriticalTemp.toFixed(1)} °R)
              </div>
            )}
            {results.sourGasMethod === 'wichert_aziz' && results.isSourGasCorrected && (
              <div className="text-amber-400">
                Wichert-Aziz Sour Corrected: P<sub>pr</sub>' = <strong>{results.pseudoReducedPressure.toFixed(3)}</strong> | T<sub>pr</sub>' = <strong>{results.pseudoReducedTemp.toFixed(3)}</strong> (ε = {results.wichertAzizFactor.toFixed(2)}°R, P<sub>pc</sub>' = {results.pseudoCriticalPressure.toFixed(1)} psia)
              </div>
            )}
          </div>
        </div>

        {/* 2. Z-Factor EOS */}
        <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
          <div className="flex items-center justify-between text-xs font-bold font-mono">
            <span className="text-amber-400">2. Compressibility Z-Factor Engine</span>
            <span className="text-cyan-400">Z = {results.zFactor.toFixed(4)}</span>
          </div>

          {zMethod === 'hall_yarborough' ? (
            <div dangerouslySetInnerHTML={renderLatex(String.raw`z = \frac{0.06125 P_{pr} t}{\rho_r} \exp\left( -1.2(1-t)^2 \right)`)} />
          ) : (
            <div dangerouslySetInnerHTML={renderLatex(String.raw`z = 1 + T_1 \rho_r + T_2 \rho_r^2 - T_3 \rho_r^5 + A_{10}(1+A_{11}\rho_r^2)\frac{\rho_r^2}{T_{pr}^3} e^{-A_{11}\rho_r^2}`)} />
          )}

          <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
            Solver: Newton-Raphson 100-iter convergence. Real Gas Density ρ = <strong>{densityVal.toFixed(3)} {densityUnit}</strong>
          </div>
        </div>

        {/* 3. Lee-Kesler Pure Vapor Pressure Correlation */}
        <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
          <div className="flex items-center justify-between text-xs font-bold font-mono">
            <span className="text-amber-400">3. Lee-Kesler Vapor Pressure Correlation</span>
            <span className="text-purple-400">P<sub>vr</sub> = P<sub>c</sub> \exp(f^{(0)} + \omega f^{(1)})</span>
          </div>

          <div dangerouslySetInnerHTML={renderLatex(String.raw`\ln P_{vr} = f^{(0)}(T_r) + \omega f^{(1)}(T_r)`)} />

          <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
            Used for pure component vapor-liquid equilibrium and reduced temperature state scaling.
          </div>
        </div>

        {/* 4. Clausius-Clapeyron Phase Equation */}
        <div className={`${boxBg} border rounded-xl p-4 space-y-2`}>
          <div className="flex items-center justify-between text-xs font-bold font-mono">
            <span className="text-amber-400">4. Clausius-Clapeyron Enthalpy Relation</span>
            <span className="text-indigo-400">Phase Boundary</span>
          </div>

          <div dangerouslySetInnerHTML={renderLatex(String.raw`\ln(P_v) = -\frac{L_v}{R} \frac{1}{T} + C`)} />

          <div className="p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono">
            Relates enthalpy of vaporization L<sub>v</sub> to temperature derivative along liquid-vapor equilibrium line.
          </div>
        </div>

      </div>

    </div>
  );
};
