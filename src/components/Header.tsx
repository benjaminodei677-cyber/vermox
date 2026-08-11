import React from 'react';
import { AppMode, CompositionPreset, ReservoirConditions } from '../types';
import { COMPOSITION_PRESETS } from '../data/presets';
import { Flame, RefreshCw, Download, FileText, Sliders, Activity, Layers, Sparkles, Sun, Moon, BookOpen, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  appMode: AppMode;
  onChangeAppMode: (mode: AppMode) => void;
  selectedPresetId: string;
  onSelectPreset: (preset: CompositionPreset) => void;
  conditions: ReservoirConditions;
  onChangeConditions: (conds: Partial<ReservoirConditions>) => void;
  totalMoleFraction: number;
  onNormalize: () => void;
  onOpenReport: () => void;
  onOpenEquations: () => void;
  onOpenDocs: (tab?: 'guide' | 'readme' | 'disclaimer') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  onChangeAppMode,
  selectedPresetId,
  onSelectPreset,
  conditions,
  onChangeConditions,
  totalMoleFraction,
  onNormalize,
  onOpenReport,
  onOpenEquations,
  onOpenDocs,
  theme,
  onToggleTheme
}) => {
  const isCompositionValid = Math.abs(totalMoleFraction - 1.0) < 0.001;
  const isDark = theme === 'dark';

  return (
    <header className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border-b sticky top-0 z-30 shadow-md transition-colors duration-200`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Brand & App Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
            <Flame className="w-5 h-5 fill-slate-950/20 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Petroleum Engineering Suite
              </h1>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                v3.2
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Reservoir Fluid PVT Properties & Inflow Performance (IPR) Engine
            </p>
          </div>
        </div>

        {/* Primary Module Tabs */}
        <div className={`flex items-center ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-xl border text-xs font-semibold`}>
          <button
            onClick={() => onChangeAppMode('pvt')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              appMode === 'pvt'
                ? isDark ? 'bg-slate-800 text-amber-400 shadow-xs font-bold' : 'bg-white text-slate-900 shadow-xs font-bold'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>1. PVT Properties</span>
          </button>

          <button
            onClick={() => onChangeAppMode('ipr')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              appMode === 'ipr'
                ? isDark ? 'bg-slate-800 text-amber-400 shadow-xs font-bold' : 'bg-white text-slate-900 shadow-xs font-bold'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>2. Fluid Flow & IPR</span>
          </button>
        </div>

        {/* Action Controls, Theme & Unit Switcher */}
        <div className="flex items-center space-x-2.5">
          
          {/* Preset Dropdown in PVT Mode */}
          {appMode === 'pvt' && (
            <div className={`hidden lg:flex items-center ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg px-2.5 py-1.5 text-xs`}>
              <Sliders className="w-3.5 h-3.5 text-amber-500 mr-2" />
              <select
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-xs"
                value={selectedPresetId}
                onChange={(e) => {
                  const found = COMPOSITION_PRESETS.find((p) => p.id === e.target.value);
                  if (found) onSelectPreset(found);
                }}
              >
                {COMPOSITION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Unit Toggle */}
          <div className={`flex ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-lg border text-xs font-bold`}>
            <button
              onClick={() => onChangeConditions({ unitSystem: 'field' })}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                conditions.unitSystem === 'field'
                  ? isDark ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-900 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Field (psia, °F)
            </button>
            <button
              onClick={() => onChangeConditions({ unitSystem: 'si' })}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                conditions.unitSystem === 'si'
                  ? isDark ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-900 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SI (bar, °C)
            </button>
          </div>

          {/* Dark / Light Theme Toggle Switch */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Normalize Notice Button */}
          {appMode === 'pvt' && !isCompositionValid && (
            <button
              onClick={onNormalize}
              className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-lg font-semibold text-xs hover:bg-amber-500/30 transition-colors cursor-pointer"
              title="Click to scale compositions to exactly 100%"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Fix Sum ({(totalMoleFraction * 100).toFixed(0)}%)</span>
            </button>
          )}

          {/* User Guide & Tech Docs Trigger */}
          <button
            onClick={() => onOpenDocs('guide')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title="User Guide, Manual & Technical Readme"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Guide & Manual</span>
          </button>

          {/* Disclaimer Trigger */}
          <button
            onClick={() => onOpenDocs('disclaimer')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
            }`}
            title="Engineering Disclaimer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden md:inline">Disclaimer</span>
          </button>

          {/* Export Report Trigger */}
          <button
            onClick={onOpenReport}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer ${
              isDark ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>
        </div>

      </div>
    </header>
  );
};



