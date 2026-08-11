import React from 'react';
import katex from 'katex';
import { IprInputs, IprResults, ReservoirConditions } from '../types';
import { BookOpen, Activity } from 'lucide-react';

interface IprEquationsSectionProps {
  inputs: IprInputs;
  results: IprResults;
  conditions: ReservoirConditions;
  theme?: 'dark' | 'light';
}

export const IprEquationsSection: React.FC<IprEquationsSectionProps> = ({
  inputs,
  results,
  conditions,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const boxBg = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200';
  const isField = conditions.unitSystem === 'field';
  const flowUnit = isField ? 'STB/day' : 'm³/day';
  const pressureUnit = isField ? 'psia' : 'bar';
  const jUnit = isField ? 'STB/d/psi' : 'm³/d/bar';

  const renderLatex = (latex: string) => {
    try {
      return {
        __html: katex.renderToString(latex, { throwOnError: false, displayMode: true })
      };
    } catch {
      return { __html: latex };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl">
          <BookOpen className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Inflow Performance & Radial Flow Formulations
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Darcy's Law, Vogel's Two-Phase Model, and Near-Wellbore Skin Dynamics
          </p>
        </div>
      </div>

      {/* Equations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 1. Darcy Law for Radial Flow */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-mono">
            <span>1. Darcy's Law for Steady Radial Flow</span>
            <span className="text-indigo-600">J = {results.productivityIndex.toFixed(3)} {jUnit}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Relates single-phase liquid flow rate to formation permeability ($k$), net height ($h$), fluid viscosity ($\mu$), formation volume factor ($B_o$), and skin ($S$):
          </p>
          <div
            className="text-slate-900 py-2 font-mono overflow-x-auto text-sm"
            dangerouslySetInnerHTML={renderLatex(String.raw`q = \frac{0.00708 \cdot k \cdot h \cdot (p_r - p_{wf})}{\mu \cdot B_o \cdot \left[ \ln(r_e/r_w) + S \right]}`)}
          />
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800">
            <strong>Productivity Index:</strong> J = q / (P<sub>r</sub> - P<sub>wf</sub>) = (0.00708 × {inputs.permeability} × {inputs.thickness}) / [{inputs.viscosity} × {inputs.formationVolumeFactor} × (ln({inputs.drainageRadius}/{inputs.wellboreRadius}) + {inputs.skinFactor})] = <strong>{results.productivityIndex.toFixed(3)}</strong> {jUnit}
          </div>
        </div>

        {/* 2. Vogel's Two-Phase IPR Model */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-mono">
            <span>2. Vogel's Empirical IPR Equation (1968)</span>
            <span className="text-amber-600">q<sub>max</sub> = {results.qMaxAof.toLocaleString()} {flowUnit}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Accounts for gas saturation buildup and relative permeability changes below bubble point pressure:
          </p>
          <div
            className="text-slate-900 py-2 font-mono overflow-x-auto text-sm"
            dangerouslySetInnerHTML={renderLatex(String.raw`\frac{q_o}{q_{\text{max}}} = 1 - 0.2 \left( \frac{p_{wf}}{p_r} \right) - 0.8 \left( \frac{p_{wf}}{p_r} \right)^2`)}
          />
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800">
            <strong>Max Open Flow (AOF):</strong> q<sub>max</sub> = (J × P<sub>r</sub>) / 1.8 = <strong>{results.qMaxAof.toLocaleString()}</strong> {flowUnit}
          </div>
        </div>

        {/* 3. Combined Vogel & Darcy Model */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-mono">
            <span>3. Combined Darcy-Vogel Inflow</span>
            <span className="text-indigo-600">P<sub>b</sub> = {inputs.bubblePointPressure} {pressureUnit}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            For undersaturated reservoirs ($P_r &gt; P_b$), single-phase Darcy flow operates down to $P_b$, and Vogel's model applies below $P_b$:
          </p>
          <div
            className="text-slate-900 py-2 font-mono overflow-x-auto text-sm"
            dangerouslySetInnerHTML={renderLatex(String.raw`q_o = J(p_r - p_b) + \frac{J p_b}{1.8} \left[ 1 - 0.2 \left( \frac{p_{wf}}{p_b} \right) - 0.8 \left( \frac{p_{wf}}{p_b} \right)^2 \right]`)}
          />
        </div>

        {/* 4. Skin Factor & Flow Efficiency */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-mono">
            <span>4. Near-Wellbore Skin Pressure Drop & FE</span>
            <span className="text-emerald-600">FE = {results.feEfficiency.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Additional skin pressure drop (ΔP<sub>skin</sub>) caused by formation damage or stimulation:
          </p>
          <div
            className="text-slate-900 py-2 font-mono overflow-x-auto text-sm"
            dangerouslySetInnerHTML={renderLatex(String.raw`\Delta p_{\text{skin}} = \frac{q_o}{J_{\text{ideal}}} \cdot \frac{S}{\ln(r_e/r_w)}, \quad \text{FE} = \frac{p_r - p_{wf} - \Delta p_{\text{skin}}}{p_r - p_{wf}}`)}
          />
        </div>

      </div>

    </div>
  );
};
