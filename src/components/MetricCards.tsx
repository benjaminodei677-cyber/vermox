import React from 'react';
import { CalculatedResults, ReservoirConditions, FluidType, BlackOilResults, BlackOilInputs } from '../types';
import { Gauge, Activity, Scale, Box, Droplets, ArrowUpRight, ArrowDownRight, Layers, Flame } from 'lucide-react';

interface MetricCardsProps {
  fluidType: FluidType;
  results: CalculatedResults;
  conditions: ReservoirConditions;
  blackOilResults: BlackOilResults;
  blackOilInputs: BlackOilInputs;
  theme?: 'dark' | 'light';
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  fluidType,
  results,
  conditions,
  blackOilResults,
  blackOilInputs,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const isField = conditions.unitSystem === 'field';
  const pressureUnit = isField ? 'psia' : 'bar';
  const rsUnit = isField ? 'scf/STB' : 'm³/m³';
  const boUnit = isField ? 'rb/STB' : 'm³/m³';
  const densityUnit = isField ? 'lb/ft³' : 'kg/m³';
  const bgUnit = isField ? 'ft³/scf' : 'm³/m³';
  const viscUnit = isField ? 'cP' : 'mPa·s';
  const molWtUnit = isField ? 'lb/lb-mol' : 'g/mol';
  const tempCriticalUnit = isField ? '°R' : 'K';

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDark ? 'text-slate-400' : 'text-slate-500';
  const textValue = isDark ? 'text-slate-100' : 'text-slate-900';

  if (fluidType === 'oil') {
    const { bubblePointPressure, currentSolutionGasOilRatio, oilFormationVolumeFactor, oilSpecificGravity, isSaturated, fluidState } = blackOilResults;

    const pbDisplay = isField ? bubblePointPressure : bubblePointPressure * 0.0689476;
    const rsDisplay = isField ? currentSolutionGasOilRatio : currentSolutionGasOilRatio * 0.178107;
    const rsiDisplay = isField ? blackOilInputs.solutionGasOilRatioInitial : blackOilInputs.solutionGasOilRatioInitial * 0.178107;
    const pDisplay = blackOilInputs.pressure;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Bubble Point Pressure (pb) */}
        <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Bubble Point Pressure (P<sub>b</sub>)
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-1.5 my-1">
              <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {pbDisplay.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-amber-500 font-mono">
                {pressureUnit}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>State:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
              isSaturated 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {fluidState}
            </span>
          </div>
        </div>

        {/* 2. Solution Gas-Oil Ratio (Rs) */}
        <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Solution GOR (R<sub>s</sub>)
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-1.5 my-1">
              <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {rsDisplay.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {rsUnit}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Initial R<sub>si</sub>:</span>
            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {rsiDisplay.toFixed(1)} {rsUnit}
            </span>
          </div>
        </div>

        {/* 3. Oil Formation Volume Factor (Bo) */}
        <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Oil Vol Factor (B<sub>o</sub>)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-1.5 my-1">
              <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {oilFormationVolumeFactor.toFixed(4)}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {boUnit}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Pressure Ratio (P/P<sub>b</sub>):</span>
            <span className={`font-bold font-mono ${pDisplay >= pbDisplay ? 'text-emerald-400' : 'text-amber-400'}`}>
              {(pDisplay / Math.max(1, pbDisplay)).toFixed(2)}x
            </span>
          </div>
        </div>

        {/* 4. Oil Gravity & Specific Gravity */}
        <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                API Gravity & Density
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-1.5 my-1">
              <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {blackOilInputs.apiGravity.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-purple-400 font-mono">
                °API
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Specific Gravity (γ<sub>o</sub>):</span>
            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {oilSpecificGravity.toFixed(3)}
            </span>
          </div>
        </div>

      </div>
    );
  }

  // Natural Gas Metrics
  const {
    zFactor,
    realDensityLbFt3,
    realDensityKgM3,
    idealDensityLbFt3,
    idealDensityKgM3,
    gasFormationVolumeFactorBgFt3Scf,
    gasViscosityCp,
    apparentMolWeight,
    pseudoCriticalPressure,
    pseudoCriticalTemp
  } = results;

  const realDensDisplay = isField ? realDensityLbFt3 : realDensityKgM3;
  const idealDensDisplay = isField ? idealDensityLbFt3 : idealDensityKgM3;
  const bgDisplay = gasFormationVolumeFactorBgFt3Scf; // ft³/scf is numerically identical to m³/m³
  const viscosityCp = gasViscosityCp;
  const apparentMolecularWeight = apparentMolWeight;
  const pcDisplay = isField ? pseudoCriticalPressure : pseudoCriticalPressure * 0.0689476;
  const tcDisplay = isField ? pseudoCriticalTemp : pseudoCriticalTemp * (5 / 9);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Z-Factor Card */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Compressibility (Z-Factor)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {zFactor.toFixed(4)}
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              dim.
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Deviation from Ideal:</span>
          <span className={`font-bold font-mono ${zFactor < 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {((zFactor - 1.0) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 2. Real Gas Density */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Real Gas Density (ρ<sub>real</sub>)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {realDensDisplay.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {densityUnit}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Ideal Density (ρ<sub>ideal</sub>):</span>
          <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {idealDensDisplay.toFixed(3)} {densityUnit}
          </span>
        </div>
      </div>

      {/* 3. Formation Volume Factor (Bg) */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Formation Vol Factor (B<sub>g</sub>)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {bgDisplay.toFixed(5)}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {bgUnit}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Viscosity (μ<sub>g</sub>):</span>
          <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {viscosityCp.toFixed(4)} {viscUnit}
          </span>
        </div>
      </div>

      {/* 4. Pseudo-Critical Properties */}
      <div className={`${cardBg} border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${textTitle}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Apparent Mol. Wt (M<sub>a</sub>)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className={`text-2xl font-black ${textValue}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {apparentMolecularWeight.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono">
              {molWtUnit}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>P<sub>pc</sub> / T<sub>pc</sub>:</span>
            <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {pcDisplay.toFixed(0)} {pressureUnit} | {tcDisplay.toFixed(0)} {tempCriticalUnit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>P<sub>pr</sub> / T<sub>pr</sub>:</span>
            <span className="font-bold text-amber-400 font-mono">
              {results.pseudoReducedPressureUncorrected.toFixed(2)} | {results.pseudoReducedTempUncorrected.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
