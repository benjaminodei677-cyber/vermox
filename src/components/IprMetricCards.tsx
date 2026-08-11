import React from 'react';
import { IprResults, ReservoirConditions, IprInputs } from '../types';
import { Gauge, Flame, Activity, ShieldAlert, Percent } from 'lucide-react';

interface IprMetricCardsProps {
  results: IprResults;
  inputs: IprInputs;
  conditions: ReservoirConditions;
  theme?: 'dark' | 'light';
}

export const IprMetricCards: React.FC<IprMetricCardsProps> = ({
  results,
  inputs,
  conditions,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const isField = conditions.unitSystem === 'field';
  const flowUnit = isField ? 'STB/day' : 'm³/day';
  const jUnit = isField ? 'STB/d/psi' : 'm³/d/bar';
  const pressureUnit = isField ? 'psia' : 'bar';

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDark ? 'text-slate-400' : 'text-slate-500';
  const textValue = isDark ? 'text-slate-100' : 'text-slate-900';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Productivity Index J */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Productivity Index (J)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {results.productivityIndex.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {jUnit}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Permeability k:</span>
          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {inputs.permeability} md
          </span>
        </div>
      </div>

      {/* 2. Absolute Open Flow (q_max / AOF) */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Max Open Flow (q<sub>max</sub> / AOF)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {results.qMaxAof.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {flowUnit}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Flow Model:</span>
          <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {inputs.useVogelCombined && inputs.reservoirPressure > inputs.bubblePointPressure ? 'Darcy + Vogel' : 'Vogel IPR'}
          </span>
        </div>
      </div>

      {/* 3. Deliverability at Target P_wf */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Target Rate (P<sub>wf</sub> = {inputs.targetPwf})
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {results.qAtTargetPwf.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {flowUnit}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Drawdown ΔP:</span>
          <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {(inputs.reservoirPressure - inputs.targetPwf).toLocaleString()} {pressureUnit}
          </span>
        </div>
      </div>

      {/* 4. Skin Factor Damage Impact */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Skin Damage (S = {inputs.skinFactor})
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              inputs.skinFactor > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {inputs.skinFactor > 0 ? <ShieldAlert className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${
              inputs.skinFactor > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {(results.feEfficiency ?? 100).toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">
              FE
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Skin ΔP<sub>skin</sub>:</span>
          <span className={`font-bold ${inputs.skinFactor > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(results.skinPressureDrop ?? 0).toFixed(1)} {pressureUnit}
          </span>
        </div>
      </div>

    </div>
  );
};
