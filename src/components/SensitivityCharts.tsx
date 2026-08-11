import React, { useState, useMemo } from 'react';
import { GasComponent, ReservoirConditions, FluidType, BlackOilInputs, BlackOilResults, ZFactorMethod, GasPpcMethod } from '../types';
import { calculateFluidProperties, calculateBlackOilProperties } from '../utils/pvtCalculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { LineChart as ChartIcon, Sliders, Droplet } from 'lucide-react';

interface SensitivityChartsProps {
  fluidType: FluidType;
  components: GasComponent[];
  conditions: ReservoirConditions;
  blackOilInputs: BlackOilInputs;
  blackOilResults: BlackOilResults;
  zFactorMethod?: ZFactorMethod;
  ppcMethod?: GasPpcMethod;
  theme?: 'dark' | 'light';
}

export const SensitivityCharts: React.FC<SensitivityChartsProps> = ({
  fluidType,
  components,
  conditions,
  blackOilInputs,
  blackOilResults,
  zFactorMethod = 'hall_yarborough',
  ppcMethod = 'kay_compositional',
  theme = 'dark'
}) => {
  const [activeChart, setActiveChart] = useState<'density' | 'zfactor' | 'bg' | 'viscosity'>('density');
  const [activeOilChart, setActiveOilChart] = useState<'bo' | 'rs'>('bo');

  const isDark = theme === 'dark';
  const isField = conditions.unitSystem === 'field';
  const pressureUnit = isField ? 'psia' : 'bar';
  const tempUnit = isField ? '°F' : '°C';
  const densityUnit = isField ? 'lb/ft³' : 'kg/m³';
  const bgUnit = isField ? 'ft³/scf' : 'm³/m³';
  const viscUnit = isField ? 'cP' : 'mPa·s';
  const boUnit = isField ? 'rb/STB' : 'm³/m³';
  const rsUnit = isField ? 'scf/STB' : 'm³/m³';

  // Range bounds for Max Pressure Axis Limit slider based on unit system
  const minSliderP = isField ? 1000 : 100;
  const maxSliderP = isField ? 10000 : 700;
  const stepSliderP = isField ? 500 : 25;

  const [maxPressurePlot, setMaxPressurePlot] = useState<number>(isField ? 6000 : 400);

  // Automatically adjust slider max value if switching unit systems
  const effectiveMaxP = useMemo(() => {
    if (isField && maxPressurePlot < 800) return 6000;
    if (!isField && maxPressurePlot > 1000) return 400;
    return maxPressurePlot;
  }, [isField, maxPressurePlot]);

  // Generate sensitivity curve data for Natural Gas
  const gasChartData = useMemo(() => {
    const steps = 40;
    const pMin = isField ? 100 : 10;
    const pMax = effectiveMaxP;
    const pStep = (pMax - pMin) / steps;

    const data = [];
    for (let i = 0; i <= steps; i++) {
      const p = Math.round(pMin + i * pStep);
      const pPsia = isField ? p : p / 0.0689476;
      const tempF = isField ? conditions.temperature : conditions.temperature * 1.8 + 32;
      
      const res = calculateFluidProperties(
        components,
        pPsia,
        tempF,
        zFactorMethod as ZFactorMethod,
        ppcMethod as GasPpcMethod
      );

      const realDens = isField ? res.realDensityLbFt3 : res.realDensityKgM3;
      const idealDens = isField ? res.idealDensityLbFt3 : res.idealDensityKgM3;
      const bgVal = res.gasFormationVolumeFactorBgFt3Scf; // ft³/scf is numerically identical to m³/m³

      data.push({
        pressure: p,
        realDensityPlot: parseFloat(realDens.toFixed(3)),
        idealDensityPlot: parseFloat(idealDens.toFixed(3)),
        zFactor: parseFloat(res.zFactor.toFixed(4)),
        bgPlot: parseFloat(bgVal.toFixed(6)),
        viscosityCp: parseFloat(res.gasViscosityCp.toFixed(4))
      });
    }
    return data;
  }, [components, conditions, effectiveMaxP, isField, zFactorMethod, ppcMethod]);

  // Generate sensitivity curve data for Black Oil
  const oilChartData = useMemo(() => {
    const steps = 40;
    const pMin = isField ? 100 : 10;
    const pMax = effectiveMaxP;
    const pStep = (pMax - pMin) / steps;

    const data = [];
    for (let i = 0; i <= steps; i++) {
      const pDisplay = Math.round(pMin + i * pStep);
      const pPsia = isField ? pDisplay : pDisplay / 0.0689476;
      const tempF = isField ? conditions.temperature : conditions.temperature * 1.8 + 32;
      const rsiScfStb = isField
        ? blackOilInputs.solutionGasOilRatioInitial
        : blackOilInputs.solutionGasOilRatioInitial / 0.178107;

      const res = calculateBlackOilProperties({
        ...blackOilInputs,
        pressure: pPsia,
        temperature: tempF,
        solutionGasOilRatioInitial: rsiScfStb
      });

      const boVal = res.oilFormationVolumeFactor;
      const rsVal = isField ? res.currentSolutionGasOilRatio : res.currentSolutionGasOilRatio * 0.178107;

      data.push({
        pressure: pDisplay,
        bo: parseFloat(boVal.toFixed(4)),
        rs: parseFloat(rsVal.toFixed(1))
      });
    }
    return data;
  }, [blackOilInputs, conditions.temperature, effectiveMaxP, isField]);

  // Calculate clean step interval for X Axis ticks so numbers never crowd
  const gasXInterval = Math.max(1, Math.floor(gasChartData.length / 6));
  const oilXInterval = Math.max(1, Math.floor(oilChartData.length / 6));

  // Chart theme colors
  const strokeGrid = isDark ? '#1e293b' : '#e2e8f0';
  const textAxis = isDark ? '#94a3b8' : '#475569';
  const textAxisLabel = isDark ? '#e2e8f0' : '#1e293b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  if (fluidType === 'oil') {
    const pbDisplay = isField
      ? blackOilResults.bubblePointPressure
      : blackOilResults.bubblePointPressure * 0.0689476;

    return (
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-4 transition-colors`}>
        
        {/* Chart Header & Controls */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Black Oil PVT Property Curves vs Pressure
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Standing's Correlations at T = {blackOilInputs.temperature} {tempUnit}, {blackOilInputs.apiGravity} °API
              </p>
            </div>
          </div>

          {/* Plot Selector Tabs */}
          <div className={`grid grid-cols-2 sm:flex ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-xl border text-xs font-bold gap-1 w-full sm:w-auto`}>
            <button
              onClick={() => setActiveOilChart('bo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeOilChart === 'bo'
                  ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formation Vol Factor (B<sub>o</sub>)
            </button>
            <button
              onClick={() => setActiveOilChart('rs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeOilChart === 'rs'
                  ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solution GOR (R<sub>s</sub>)
            </button>
          </div>
        </div>

        {/* Max Pressure Range Slider */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border text-xs`}>
          <div className={`flex items-center space-x-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Max Plot Pressure Abscissa:</span>
            <span className={`font-bold font-mono ${isDark ? 'text-amber-400' : 'text-slate-900'}`}>{effectiveMaxP} {pressureUnit}</span>
          </div>

          <input
            type="range"
            min={minSliderP}
            max={maxSliderP}
            step={stepSliderP}
            value={effectiveMaxP}
            onChange={(e) => setMaxPressurePlot(parseInt(e.target.value))}
            className="w-full sm:w-36 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Chart View Area */}
        <div className={`h-[300px] xs:h-[350px] sm:h-[400px] w-full ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200'} p-1.5 sm:p-3 rounded-xl border relative`}>
          
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
            <LineChart data={oilChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeGrid} opacity={0.6} />
              
              {/* Abscissa (X-Axis): Ticks spaced neatly using interval & crisp formatting */}
              <XAxis
                dataKey="pressure"
                interval={oilXInterval}
                dy={6}
                stroke={textAxis}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
                label={{
                  value: `Reservoir Pressure Abscissa (${pressureUnit})`,
                  position: 'insideBottom',
                  offset: -18,
                  style: { fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxisLabel }
                }}
              />

              {activeOilChart === 'bo' && (
                <YAxis
                  stroke={textAxis}
                  width={48}
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                  label={{
                    value: `Oil Vol Factor B_o (${boUnit})`,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxisLabel }
                  }}
                />
              )}

              {activeOilChart === 'rs' && (
                <YAxis
                  stroke={textAxis}
                  width={48}
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                  label={{
                    value: `Solution GOR R_s (${rsUnit})`,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxisLabel }
                  }}
                />
              )}

              <Tooltip
                wrapperStyle={{ pointerEvents: 'none', outline: 'none', zIndex: 50 }}
                isAnimationActive={false}
                useTranslate3d={true}
                cursor={{ stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                  color: tooltipText,
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '12px'
                }}
                formatter={(val: any) => [
                  `${typeof val === 'number' ? val.toLocaleString() : val} ${activeOilChart === 'bo' ? boUnit : rsUnit}`,
                  activeOilChart === 'bo' ? 'Formation Volume Factor (B_o)' : 'Solution GOR (R_s)'
                ]}
                labelFormatter={(label) => `Pressure: ${typeof label === 'number' ? label.toLocaleString() : label} ${pressureUnit}`}
              />

              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '11px', color: textAxisLabel }} />

              {/* Bubble Point Reference Line */}
              <ReferenceLine
                x={Number(pbDisplay.toFixed(1))}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `P_b = ${pbDisplay.toFixed(1)} ${pressureUnit}`,
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 10,
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: 'bold'
                }}
              />

              {/* Current Pressure Line */}
              <ReferenceLine
                x={conditions.pressure}
                stroke={isDark ? '#38bdf8' : '#0284c7'}
                strokeWidth={2}
                label={{
                  value: `P = ${conditions.pressure} ${pressureUnit}`,
                  position: 'insideTopLeft',
                  fill: isDark ? '#38bdf8' : '#0284c7',
                  fontSize: 10,
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: 'bold'
                }}
              />

              {activeOilChart === 'bo' && (
                <Line
                  type="monotone"
                  dataKey="bo"
                  name={`Formation Volume Factor B_o (${boUnit})`}
                  stroke={isDark ? '#38bdf8' : '#0284c7'}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}

              {activeOilChart === 'rs' && (
                <Line
                  type="monotone"
                  dataKey="rs"
                  name={`Solution Gas-Oil Ratio R_s (${rsUnit})`}
                  stroke={isDark ? '#34d399' : '#059669'}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    );
  }

  // Natural Gas Sensitivity Charts
  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-4 transition-colors`}>
      
      {/* Chart Header & Controls */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Natural Gas Thermodynamic Profiles vs Pressure
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Isothermal sensitivity curves at T = {conditions.temperature} {tempUnit}
            </p>
          </div>
        </div>

        {/* Plot Selector Tabs */}
        <div className={`grid grid-cols-2 xs:grid-cols-4 sm:flex ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-xl border text-xs font-bold gap-1 w-full sm:w-auto`}>
          <button
            onClick={() => setActiveChart('density')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeChart === 'density'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Density (ρ<sub>g</sub>)
          </button>
          <button
            onClick={() => setActiveChart('zfactor')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeChart === 'zfactor'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Z-Factor
          </button>
          <button
            onClick={() => setActiveChart('bg')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeChart === 'bg'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            B<sub>g</sub> ({bgUnit})
          </button>
          <button
            onClick={() => setActiveChart('viscosity')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeChart === 'viscosity'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Viscosity (μ<sub>g</sub>)
          </button>
        </div>
      </div>

      {/* Plot Max Pressure Slider */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border`}>
        <span className={`flex items-center space-x-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Max Plot Pressure Abscissa: <strong className={`font-bold font-mono ${isDark ? 'text-amber-400' : 'text-slate-900'}`}>{effectiveMaxP} {pressureUnit}</strong></span>
        </span>
        <input
          type="range"
          min={minSliderP}
          max={maxSliderP}
          step={stepSliderP}
          value={effectiveMaxP}
          onChange={(e) => setMaxPressurePlot(parseInt(e.target.value))}
          className="w-full sm:w-36 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>

      {/* Recharts Container */}
      <div className={`h-[300px] xs:h-[350px] sm:h-[420px] w-full ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200'} p-1.5 sm:p-3 rounded-xl border relative`}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
          {activeChart === 'density' ? (
            <LineChart data={gasChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeGrid} opacity={0.6} />
              <XAxis
                dataKey="pressure"
                interval={gasXInterval}
                dy={6}
                stroke={textAxis}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
                label={{ value: `Pressure Abscissa (${pressureUnit})`, position: 'insideBottom', offset: -18, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <YAxis
                stroke={textAxis}
                width={48}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                label={{ value: `Density (${densityUnit})`, angle: -90, position: 'insideLeft', offset: 10, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: 'none', outline: 'none', zIndex: 50 }}
                isAnimationActive={false}
                useTranslate3d={true}
                cursor={{ stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', color: tooltipText, fontSize: '12px', fontFamily: "'Times New Roman', Times, serif" }}
                formatter={(val: any, name: string) => [
                  `${typeof val === 'number' ? val.toLocaleString() : val} ${densityUnit}`,
                  name === 'realDensityPlot' ? 'Real Gas Density (ρ_real)' : 'Ideal Gas Density (ρ_ideal)'
                ]}
                labelFormatter={(label) => `Pressure: ${typeof label === 'number' ? label.toLocaleString() : label} ${pressureUnit}`}
              />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: textAxisLabel, fontFamily: "'Times New Roman', Times, serif" }} />
              
              <Line
                type="monotone"
                dataKey="realDensityPlot"
                name={`Real Gas Density (${densityUnit})`}
                stroke={isDark ? '#38bdf8' : '#0284c7'}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="idealDensityPlot"
                name={`Ideal Gas Density (${densityUnit})`}
                stroke={isDark ? '#a855f7' : '#7c3aed'}
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <ReferenceLine
                x={conditions.pressure}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ value: `Current P: ${conditions.pressure} ${pressureUnit}`, fill: '#f59e0b', fontSize: 10, position: 'top', fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
            </LineChart>
          ) : activeChart === 'zfactor' ? (
            <LineChart data={gasChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeGrid} opacity={0.6} />
              <XAxis
                dataKey="pressure"
                interval={gasXInterval}
                dy={6}
                stroke={textAxis}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
                label={{ value: `Pressure Abscissa (${pressureUnit})`, position: 'insideBottom', offset: -18, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <YAxis
                stroke={textAxis}
                width={48}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                domain={['auto', 'auto']}
                label={{ value: 'Compressibility Z-Factor', angle: -90, position: 'insideLeft', offset: 10, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: 'none', outline: 'none', zIndex: 50 }}
                isAnimationActive={false}
                useTranslate3d={true}
                cursor={{ stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', color: tooltipText, fontSize: '12px', fontFamily: "'Times New Roman', Times, serif" }}
                formatter={(val: any) => [`${typeof val === 'number' ? val.toLocaleString() : val}`, 'Compressibility Factor (Z)']}
                labelFormatter={(label) => `Pressure: ${typeof label === 'number' ? label.toLocaleString() : label} ${pressureUnit}`}
              />
              <Line
                type="monotone"
                dataKey="zFactor"
                name="Compressibility Factor Z"
                stroke={isDark ? '#38bdf8' : '#0284c7'}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <ReferenceLine
                x={conditions.pressure}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ value: `Current P: ${conditions.pressure} ${pressureUnit}`, fill: '#f59e0b', fontSize: 10, position: 'top', fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <ReferenceLine y={1.0} stroke={isDark ? '#64748b' : '#94a3b8'} strokeDasharray="2 2" label={{ value: 'Ideal Z = 1.0', fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontFamily: "'Times New Roman', Times, serif" }} />
            </LineChart>
          ) : activeChart === 'bg' ? (
            <LineChart data={gasChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeGrid} opacity={0.6} />
              <XAxis
                dataKey="pressure"
                interval={gasXInterval}
                dy={6}
                stroke={textAxis}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
                label={{ value: `Pressure Abscissa (${pressureUnit})`, position: 'insideBottom', offset: -18, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <YAxis
                stroke={textAxis}
                width={48}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                domain={['auto', 'auto']}
                label={{ value: `Formation Vol Factor Bg (${bgUnit})`, angle: -90, position: 'insideLeft', offset: 10, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: 'none', outline: 'none', zIndex: 50 }}
                isAnimationActive={false}
                useTranslate3d={true}
                cursor={{ stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', color: tooltipText, fontSize: '12px', fontFamily: "'Times New Roman', Times, serif" }}
                formatter={(val: any) => [`${typeof val === 'number' ? val.toLocaleString() : val} ${bgUnit}`, 'Formation Volume Factor Bg']}
                labelFormatter={(label) => `Pressure: ${typeof label === 'number' ? label.toLocaleString() : label} ${pressureUnit}`}
              />
              <Line
                type="monotone"
                dataKey="bgPlot"
                name={`Gas Formation Volume Factor (${bgUnit})`}
                stroke={isDark ? '#34d399' : '#059669'}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <ReferenceLine x={conditions.pressure} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} />
            </LineChart>
          ) : (
            <LineChart data={gasChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeGrid} opacity={0.6} />
              <XAxis
                dataKey="pressure"
                interval={gasXInterval}
                dy={6}
                stroke={textAxis}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
                label={{ value: `Pressure Abscissa (${pressureUnit})`, position: 'insideBottom', offset: -18, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <YAxis
                stroke={textAxis}
                width={48}
                tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
                label={{ value: `Gas Viscosity μ_g (${viscUnit})`, angle: -90, position: 'insideLeft', offset: 10, fill: textAxisLabel, fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: 'none', outline: 'none', zIndex: 50 }}
                isAnimationActive={false}
                useTranslate3d={true}
                cursor={{ stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', color: tooltipText, fontSize: '12px', fontFamily: "'Times New Roman', Times, serif" }}
                formatter={(val: any) => [`${typeof val === 'number' ? val.toLocaleString() : val} ${viscUnit}`, 'Viscosity (Lee-Gonzalez)']}
                labelFormatter={(label) => `Pressure: ${typeof label === 'number' ? label.toLocaleString() : label} ${pressureUnit}`}
              />
              <Line
                type="monotone"
                dataKey="viscosityCp"
                name={`Gas Viscosity (${viscUnit})`}
                stroke={isDark ? '#c084fc' : '#7c3aed'}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <ReferenceLine x={conditions.pressure} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
