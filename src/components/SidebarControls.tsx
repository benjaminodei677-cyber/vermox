import React, { useState } from 'react';
import { GasComponent, ReservoirConditions, C7PlusConfig, FluidType, BlackOilInputs } from '../types';
import { Sliders, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Layers, Flame, Droplet } from 'lucide-react';

interface SidebarControlsProps {
  fluidType: FluidType;
  onChangeFluidType: (type: FluidType) => void;
  conditions: ReservoirConditions;
  onChangeConditions: (conds: Partial<ReservoirConditions>) => void;
  blackOilInputs: BlackOilInputs;
  onChangeBlackOilInputs: (inputs: Partial<BlackOilInputs>) => void;
  components: GasComponent[];
  onChangeComponentFraction: (id: string, value: number) => void;
  c7PlusConfig: C7PlusConfig;
  onChangeC7PlusConfig: (config: Partial<C7PlusConfig>) => void;
  totalMoleFraction: number;
  onNormalize: () => void;
  autoNormalize: boolean;
  onToggleAutoNormalize: (val: boolean) => void;
  zFactorMethod?: string;
  onChangeZFactorMethod?: (method: any) => void;
  ppcMethod?: string;
  onChangePpcMethod?: (method: any) => void;
  sourGasMethod?: string;
  onChangeSourGasMethod?: (method: any) => void;
  theme?: 'dark' | 'light';
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  fluidType,
  onChangeFluidType,
  conditions,
  onChangeConditions,
  blackOilInputs,
  onChangeBlackOilInputs,
  components,
  onChangeComponentFraction,
  c7PlusConfig,
  onChangeC7PlusConfig,
  totalMoleFraction,
  onNormalize,
  autoNormalize,
  onToggleAutoNormalize,
  zFactorMethod = 'hall_yarborough',
  onChangeZFactorMethod,
  ppcMethod = 'kay_compositional',
  onChangePpcMethod,
  sourGasMethod = 'wichert_aziz',
  onChangeSourGasMethod,
  theme = 'dark'
}) => {
  const [showC7Details, setShowC7Details] = useState(false);
  const [activeTab, setActiveTab] = useState<'reservoir' | 'composition'>('reservoir');

  const isDark = theme === 'dark';
  const isValidTotal = Math.abs(totalMoleFraction - 1.0) < 0.001;

  // Unit display helpers
  const isField = conditions.unitSystem === 'field';
  const pressureUnit = isField ? 'psia' : 'bar';
  const tempUnit = isField ? '°F' : '°C';

  // Range bounds based on units
  const minP = isField ? 14.7 : 1.013;
  const maxP = isField ? 10000 : 700;
  const stepP = isField ? 50 : 5;
  const minT = isField ? 50 : 10;
  const maxT = isField ? 350 : 180;
  const rsUnit = isField ? 'scf/STB' : 'm³/m³';
  const minRs = 0;
  const maxRs = isField ? 3000 : 534;
  const stepRs = isField ? 25 : 5;

  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const boxBg = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200';
  const inputBg = isDark ? 'bg-slate-900 border-slate-700 text-amber-400 font-bold' : 'bg-white border-slate-300 text-slate-900 font-bold';

  return (
    <div className={`${cardBg} border rounded-2xl p-5 shadow-lg flex flex-col gap-5 transition-colors`}>
      
      {/* FLUID PHASE SELECTOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Fluid Phase</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
            isDark ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' : 'bg-slate-100 text-slate-700'
          }`}>
            {fluidType === 'gas' ? 'Gas PVT Models' : 'Crude Oil Correlations'}
          </span>
        </div>
        
        <div className={`grid grid-cols-2 gap-2 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-xl border`}>
          <button
            onClick={() => onChangeFluidType('gas')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              fluidType === 'gas'
                ? isDark ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>Natural Gas</span>
          </button>

          <button
            onClick={() => onChangeFluidType('oil')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              fluidType === 'oil'
                ? isDark ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-4 h-4 text-amber-950 fill-amber-950/20" />
            <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>Crude Oil</span>
          </button>
        </div>
      </div>

      {fluidType === 'gas' ? (
        <>
          {/* Sub-Tabs for Natural Gas */}
          <div className={`flex ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-xl border gap-1 text-xs font-bold`}>
            <button
              onClick={() => setActiveTab('reservoir')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'reservoir'
                  ? isDark ? 'bg-slate-800 text-amber-400 shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>Reservoir & EOS</span>
            </button>
            <button
              onClick={() => setActiveTab('composition')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'composition'
                  ? isDark ? 'bg-slate-800 text-amber-400 shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>Composition</span>
              {!isValidTotal && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* RESERVOIR PARAMETERS TAB */}
          {activeTab === 'reservoir' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Reservoir State</h3>
                <span className="text-[10px] font-mono text-amber-400">
                  {isField ? 'Field Units' : 'SI Units'}
                </span>
              </div>

              {/* Pressure Control */}
              <div className={`${boxBg} border rounded-xl p-3.5 space-y-2`}>
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    Pressure ({pressureUnit})
                  </label>
                  <input
                    type="number"
                    min={minP}
                    max={maxP}
                    step={stepP}
                    value={conditions.pressure}
                    onChange={(e) => onChangeConditions({ pressure: parseFloat(e.target.value) || minP })}
                    className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>
                <input
                  type="range"
                  min={minP}
                  max={maxP}
                  step={stepP}
                  value={conditions.pressure}
                  onChange={(e) => onChangeConditions({ pressure: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 rounded-lg bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Temperature Control */}
              <div className={`${boxBg} border rounded-xl p-3.5 space-y-2`}>
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    Temperature ({tempUnit})
                  </label>
                  <input
                    type="number"
                    min={minT}
                    max={maxT}
                    step={1}
                    value={conditions.temperature}
                    onChange={(e) => onChangeConditions({ temperature: parseFloat(e.target.value) || minT })}
                    className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>
                <input
                  type="range"
                  min={minT}
                  max={maxT}
                  step={1}
                  value={conditions.temperature}
                  onChange={(e) => onChangeConditions({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 rounded-lg bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Z-factor Model Selector */}
              <div className={`${boxBg} border rounded-xl p-3.5 space-y-2`}>
                <label className="text-xs font-semibold block" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  Z-Factor Correlation Engine
                </label>
                <select
                  value={zFactorMethod}
                  onChange={(e) => onChangeZFactorMethod && onChangeZFactorMethod(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg text-xs p-2 focus:outline-none cursor-pointer border`}
                >
                  <option value="hall_yarborough">Hall-Yarborough (1973) EOS</option>
                  <option value="dranchuk_abu_kassem">Dranchuk-Abu Kassem (1975) DAK</option>
                </select>
              </div>

              {/* Pseudocritical Method Selector */}
              <div className={`${boxBg} border rounded-xl p-3.5 space-y-2`}>
                <label className="text-xs font-semibold block" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  Pseudocritical Method (P<sub>pc</sub>, T<sub>pc</sub>)
                </label>
                <select
                  value={ppcMethod}
                  onChange={(e) => onChangePpcMethod && onChangePpcMethod(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg text-xs p-2 focus:outline-none cursor-pointer border`}
                >
                  <option value="kay_compositional">Kay's Compositional Mixing Rule</option>
                  <option value="standing_dry">Standing Gravity (Dry Natural Gas)</option>
                  <option value="standing_condensate">Standing Gravity (Gas Condensate)</option>
                </select>
              </div>

              {/* Sour Gas / Non-Hydrocarbon Correction Method */}
              <div className={`${boxBg} border rounded-xl p-3.5 space-y-2`}>
                <label className="text-xs font-semibold block" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  Sour Gas / Impurity Correlation
                </label>
                <select
                  value={sourGasMethod}
                  onChange={(e) => onChangeSourGasMethod && onChangeSourGasMethod(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg text-xs p-2 focus:outline-none cursor-pointer border`}
                >
                  <option value="wichert_aziz">Wichert-Aziz (1972) Sour Gas</option>
                  <option value="carr_kobayashi_burrows">Carr-Kobayashi-Burrows (1954)</option>
                  <option value="piper">Piper et al. (1993) Correlation</option>
                  <option value="none">None (Uncorrected Kay's Rule)</option>
                </select>
              </div>

            </div>
          )}

          {/* COMPOSITION TAB */}
          {activeTab === 'composition' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Components Mole Fraction</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={onNormalize}
                    className="text-[10px] font-bold text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-1 rounded-md border border-amber-500/40 transition-colors cursor-pointer"
                  >
                    Normalize Sum
                  </button>
                </div>
              </div>

              {/* Components List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {components.map((comp) => (
                  <div key={comp.id} className={`flex items-center justify-between ${boxBg} border rounded-lg p-2 text-xs`}>
                    <div>
                      <span className="font-bold text-amber-400 font-mono">{comp.formula}</span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} ml-1.5 font-medium`}>{comp.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={comp.moleFraction}
                        onChange={(e) => onChangeComponentFraction(comp.id, parseFloat(e.target.value) || 0)}
                        className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
                      />
                      <span className="text-[10px] text-amber-400 font-mono w-8 text-right">
                        {(comp.moleFraction * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Mole Fraction Status */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                isValidTotal
                  ? isDark ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isDark ? 'bg-amber-950/60 border-amber-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center space-x-1.5">
                  {isValidTotal ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Mole Total: <strong className="font-mono">{(totalMoleFraction * 100).toFixed(1)}%</strong></span>
                </div>
                {!isValidTotal && (
                  <button
                    onClick={onNormalize}
                    className="underline text-[11px] font-bold text-amber-400 cursor-pointer"
                  >
                    Fix Sum
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* CRUDE OIL BLACK OIL CONTROLS */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Black Oil Correlation Inputs</h3>
            <span className="text-[10px] font-mono text-amber-400 capitalize">
              {(blackOilInputs.correlationMethod || 'standing').replace('_', ' ')}
            </span>
          </div>

          {/* Empirical Correlation Selector */}
          <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
            <label className="text-xs font-semibold block" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Correlation Suite Selection
            </label>
            <select
              value={blackOilInputs.correlationMethod || 'standing'}
              onChange={(e) => onChangeBlackOilInputs({ correlationMethod: e.target.value as any })}
              className={`w-full ${inputBg} rounded-lg text-xs p-2 focus:outline-none cursor-pointer border`}
            >
              <option value="standing">Standing (1947 / 1977)</option>
              <option value="vasquez_beggs">Vasquez-Beggs (1980)</option>
              <option value="glaso">Glaso (1980) North Sea</option>
              <option value="marhoun">Marhoun (1988) Middle East</option>
              <option value="petrosky_farshad">Petrosky-Farshad (1993) GOM</option>
            </select>
          </div>

          {/* Pressure */}
          <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Pressure ({pressureUnit})</label>
              <input
                type="number"
                min={minP}
                max={maxP}
                step={stepP}
                value={blackOilInputs.pressure}
                onChange={(e) => onChangeBlackOilInputs({ pressure: parseFloat(e.target.value) || minP })}
                className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
              />
            </div>
            <input
              type="range"
              min={minP}
              max={maxP}
              step={stepP}
              value={blackOilInputs.pressure}
              onChange={(e) => onChangeBlackOilInputs({ pressure: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* API Gravity */}
          <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Oil Gravity (°API)</label>
              <input
                type="number"
                min={10}
                max={60}
                step={1}
                value={blackOilInputs.apiGravity}
                onChange={(e) => onChangeBlackOilInputs({ apiGravity: parseFloat(e.target.value) || 10 })}
                className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
              />
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={1}
              value={blackOilInputs.apiGravity}
              onChange={(e) => onChangeBlackOilInputs({ apiGravity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Gas Specific Gravity */}
          <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Gas Gravity (γ<sub>g</sub>)</label>
              <input
                type="number"
                min={0.55}
                max={1.5}
                step={0.01}
                value={blackOilInputs.gasSpecificGravity}
                onChange={(e) => onChangeBlackOilInputs({ gasSpecificGravity: parseFloat(e.target.value) || 0.55 })}
                className={`w-20 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
              />
            </div>
            <input
              type="range"
              min={0.55}
              max={1.2}
              step={0.01}
              value={blackOilInputs.gasSpecificGravity}
              onChange={(e) => onChangeBlackOilInputs({ gasSpecificGravity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Initial Solution Gas Oil Ratio */}
          <div className={`${boxBg} border rounded-xl p-3 space-y-1.5`}>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Solution GOR R<sub>si</sub> ({rsUnit})</label>
              <input
                type="number"
                min={minRs}
                max={maxRs}
                step={stepRs}
                value={blackOilInputs.solutionGasOilRatioInitial}
                onChange={(e) => onChangeBlackOilInputs({ solutionGasOilRatioInitial: parseFloat(e.target.value) || minRs })}
                className={`w-24 ${inputBg} rounded-md text-right font-mono text-xs px-2 py-1 focus:outline-none`}
              />
            </div>
            <input
              type="range"
              min={minRs}
              max={maxRs}
              step={stepRs}
              value={blackOilInputs.solutionGasOilRatioInitial}
              onChange={(e) => onChangeBlackOilInputs({ solutionGasOilRatioInitial: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

    </div>
  );
};
