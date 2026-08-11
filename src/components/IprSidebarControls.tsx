import React from 'react';
import { IprInputs, ReservoirConditions } from '../types';
import { Sliders, Layers, Activity } from 'lucide-react';

interface IprSidebarControlsProps {
  inputs: IprInputs;
  onChangeInputs: (updated: Partial<IprInputs>) => void;
  conditions: ReservoirConditions;
  theme?: 'dark' | 'light';
}

export const IprSidebarControls: React.FC<IprSidebarControlsProps> = ({
  inputs,
  onChangeInputs,
  conditions,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const isField = conditions.unitSystem === 'field';
  const lengthUnit = isField ? 'ft' : 'm';
  const pressureUnit = isField ? 'psia' : 'bar';
  const viscUnit = isField ? 'cP' : 'mPa·s';
  const boUnit = isField ? 'rb/STB' : 'm³/m³';

  // Range limits depending on field or SI units
  const maxP = isField ? 10000 : 700;
  const minP = isField ? 14.7 : 1.013;
  const stepP = isField ? 50 : 5;

  const maxH = isField ? 500 : 150;
  const maxRe = isField ? 5000 : 1500;

  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const boxBg = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200';
  const inputBg = isDark ? 'bg-slate-900 border-slate-700 text-amber-400 font-bold' : 'bg-white border-slate-300 text-slate-900 font-bold';

  return (
    <div className={`${cardBg} border rounded-2xl p-5 shadow-lg flex flex-col gap-5 transition-colors`}>
      
      {/* Module Title Header */}
      <div className={`flex items-center space-x-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            Reservoir & Well Flow Parameters
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Darcy Radial Inflow & Vogel Two-Phase Model
          </p>
        </div>
      </div>

      {/* 1. Rock & Reservoir Matrix Parameters */}
      <div className="space-y-3">
        <span className="text-xs font-bold flex items-center space-x-1.5" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>1. Rock & Reservoir Matrix</span>
        </span>

        {/* Permeability k */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Permeability k (md)</label>
            <input
              type="number"
              min={0.1}
              max={5000}
              step={10}
              value={inputs.permeability}
              onChange={(e) => onChangeInputs({ permeability: parseFloat(e.target.value) || 0.1 })}
              className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={1}
            max={1000}
            step={5}
            value={inputs.permeability}
            onChange={(e) => onChangeInputs({ permeability: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Reservoir Net Thickness h */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Net Thickness h ({lengthUnit})</label>
            <input
              type="number"
              min={1}
              max={maxH}
              step={5}
              value={inputs.thickness}
              onChange={(e) => onChangeInputs({ thickness: parseFloat(e.target.value) || 1 })}
              className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={5}
            max={maxH}
            step={5}
            value={inputs.thickness}
            onChange={(e) => onChangeInputs({ thickness: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Drainage Radius r_e */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Drainage Radius r<sub>e</sub> ({lengthUnit})</label>
            <input
              type="number"
              min={50}
              max={maxRe}
              step={50}
              value={inputs.drainageRadius}
              onChange={(e) => onChangeInputs({ drainageRadius: parseFloat(e.target.value) || 50 })}
              className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={100}
            max={maxRe}
            step={50}
            value={inputs.drainageRadius}
            onChange={(e) => onChangeInputs({ drainageRadius: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Pressures & Operating Point */}
      <div className="space-y-3">
        <span className="text-xs font-bold flex items-center space-x-1.5" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>2. Pressures & Operating Point</span>
        </span>

        {/* Reservoir Pressure P_r */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Reservoir Pressure P<sub>r</sub> ({pressureUnit})</label>
            <input
              type="number"
              min={minP}
              max={maxP}
              step={stepP}
              value={inputs.reservoirPressure}
              onChange={(e) => onChangeInputs({ reservoirPressure: parseFloat(e.target.value) || minP })}
              className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={minP}
            max={maxP}
            step={stepP}
            value={inputs.reservoirPressure}
            onChange={(e) => onChangeInputs({ reservoirPressure: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Bubble Point Pressure P_b */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Bubble Point P<sub>b</sub> ({pressureUnit})</label>
            <input
              type="number"
              min={minP}
              max={maxP}
              step={stepP}
              value={inputs.bubblePointPressure}
              onChange={(e) => onChangeInputs({ bubblePointPressure: parseFloat(e.target.value) || minP })}
              className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={minP}
            max={maxP}
            step={stepP}
            value={inputs.bubblePointPressure}
            onChange={(e) => onChangeInputs({ bubblePointPressure: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Operating Target Flowing BHP (P_wf) */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Operating BHP P<sub>wf</sub> ({pressureUnit})</label>
            <input
              type="number"
              min={0}
              max={inputs.reservoirPressure}
              step={stepP}
              value={inputs.targetPwf}
              onChange={(e) => onChangeInputs({ targetPwf: parseFloat(e.target.value) || 0 })}
              className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={0}
            max={inputs.reservoirPressure}
            step={stepP}
            value={inputs.targetPwf}
            onChange={(e) => onChangeInputs({ targetPwf: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Skin Factor S */}
        <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Skin Factor (S)</label>
            <input
              type="number"
              min={-5}
              max={20}
              step={0.5}
              value={inputs.skinFactor}
              onChange={(e) => onChangeInputs({ skinFactor: parseFloat(e.target.value) || 0 })}
              className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
            />
          </div>
          <input
            type="range"
            min={-5}
            max={20}
            step={0.5}
            value={inputs.skinFactor}
            onChange={(e) => onChangeInputs({ skinFactor: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
};
