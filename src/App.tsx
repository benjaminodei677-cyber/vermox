import React, { useState, useMemo } from 'react';
import { AppMode, GasComponent, ReservoirConditions, C7PlusConfig, CompositionPreset, FluidType, BlackOilInputs, IprInputs } from './types';
import { PURE_GAS_COMPONENTS } from './data/components';
import { COMPOSITION_PRESETS } from './data/presets';
import { calculateFluidProperties, calculateBlackOilProperties } from './utils/pvtCalculations';
import { calculateIprProperties } from './utils/iprCalculations';

import { Header } from './components/Header';
import { SidebarControls } from './components/SidebarControls';
import { MetricCards } from './components/MetricCards';
import { SensitivityCharts } from './components/SensitivityCharts';
import { CompositionTable } from './components/CompositionTable';
import { EquationsSection } from './components/EquationsSection';
import { AIReservoirAssistant } from './components/AIReservoirAssistant';
import { ReportExportModal } from './components/ReportExportModal';
import { DocumentationModal } from './components/DocumentationModal';

import { IprSidebarControls } from './components/IprSidebarControls';
import { IprMetricCards } from './components/IprMetricCards';
import { IprCharts } from './components/IprCharts';
import { IprEquationsSection } from './components/IprEquationsSection';

export default function App() {
  // -1. Navigation Module Mode ('pvt' or 'ipr')
  const [appMode, setAppMode] = useState<AppMode>('pvt');

  // 0. Fluid Type Selector (Natural Gas vs Crude Oil)
  const [fluidType, setFluidType] = useState<FluidType>('gas');

  // 1. Reservoir Conditions State
  const [conditions, setConditions] = useState<ReservoirConditions>({
    pressure: 3000.0,
    temperature: 150.0,
    unitSystem: 'field'
  });

  // 1b. Black Oil Inputs State (for Crude Oil)
  const [blackOilInputs, setBlackOilInputs] = useState<BlackOilInputs>({
    pressure: 3000.0,
    temperature: 150.0,
    apiGravity: 35.0,
    gasSpecificGravity: 0.75,
    solutionGasOilRatioInitial: 750.0
  });

  // 1c. IPR Fluid Flow Inputs State (for Module 2)
  const [iprInputs, setIprInputs] = useState<IprInputs>({
    permeability: 50.0,
    thickness: 30.0,
    reservoirPressure: 3000.0,
    drainageRadius: 1000.0,
    wellboreRadius: 0.328,
    skinFactor: 0.0,
    viscosity: 1.5,
    formationVolumeFactor: 1.2,
    bubblePointPressure: 2200.0,
    useVogelCombined: true,
    targetPwf: 1500.0
  });

  // 1d. EOS Model Options for Natural Gas
  const [zFactorMethod, setZFactorMethod] = useState<'hall_yarborough' | 'dranchuk_abu_kassem'>('hall_yarborough');
  const [ppcMethod, setPpcMethod] = useState<'kay_compositional' | 'standing_dry' | 'standing_condensate'>('kay_compositional');
  const [sourGasMethod, setSourGasMethod] = useState<'wichert_aziz' | 'carr_kobayashi_burrows' | 'piper' | 'none'>('wichert_aziz');

  // Keep pressure and temperature synced between conditions, blackOilInputs, and iprInputs when updated
  const handleUpdateConditions = (updated: Partial<ReservoirConditions>) => {
    setConditions((prev) => {
      // Unit System toggle handling with mathematical unit conversion
      if (updated.unitSystem && updated.unitSystem !== prev.unitSystem) {
        const toSi = updated.unitSystem === 'si';

        let newP: number;
        let newT: number;
        let newRs: number;
        let newPrIpr: number;
        let newPbIpr: number;
        let newPwfIpr: number;

        if (toSi) {
          // Field -> SI conversion
          newP = Number((prev.pressure * 0.0689476).toFixed(1));
          newT = Number(((prev.temperature - 32) * (5 / 9)).toFixed(1));
          newRs = Number((blackOilInputs.solutionGasOilRatioInitial * 0.178107).toFixed(1));

          newPrIpr = Number((iprInputs.reservoirPressure * 0.0689476).toFixed(1));
          newPbIpr = Number((iprInputs.bubblePointPressure * 0.0689476).toFixed(1));
          newPwfIpr = Number((iprInputs.targetPwf * 0.0689476).toFixed(1));
        } else {
          // SI -> Field conversion
          newP = Number((prev.pressure / 0.0689476).toFixed(0));
          newT = Number((prev.temperature * 1.8 + 32).toFixed(0));
          newRs = Number((blackOilInputs.solutionGasOilRatioInitial / 0.178107).toFixed(0));

          newPrIpr = Number((iprInputs.reservoirPressure / 0.0689476).toFixed(0));
          newPbIpr = Number((iprInputs.bubblePointPressure / 0.0689476).toFixed(0));
          newPwfIpr = Number((iprInputs.targetPwf / 0.0689476).toFixed(0));
        }

        const nextConditions = { ...prev, ...updated, pressure: newP, temperature: newT };
        setBlackOilInputs((bPrev) => ({
          ...bPrev,
          pressure: newP,
          temperature: newT,
          solutionGasOilRatioInitial: newRs
        }));
        setIprInputs((iPrev) => ({
          ...iPrev,
          reservoirPressure: newPrIpr,
          bubblePointPressure: newPbIpr,
          targetPwf: newPwfIpr
        }));
        return nextConditions;
      }

      const next = { ...prev, ...updated };
      if (updated.pressure !== undefined || updated.temperature !== undefined) {
        setBlackOilInputs((bPrev) => ({
          ...bPrev,
          pressure: next.pressure !== undefined ? next.pressure : bPrev.pressure,
          temperature: next.temperature !== undefined ? next.temperature : bPrev.temperature
        }));
        if (updated.pressure !== undefined) {
          setIprInputs((iPrev) => ({ ...iPrev, reservoirPressure: updated.pressure! }));
        }
      }
      return next;
    });
  };

  const handleUpdateBlackOilInputs = (updated: Partial<BlackOilInputs>) => {
    setBlackOilInputs((prev) => {
      const next = { ...prev, ...updated };
      if (updated.pressure !== undefined || updated.temperature !== undefined) {
        setConditions((cPrev) => ({
          ...cPrev,
          pressure: next.pressure !== undefined ? next.pressure : cPrev.pressure,
          temperature: next.temperature !== undefined ? next.temperature : cPrev.temperature
        }));
      }
      return next;
    });
  };

  const handleUpdateIprInputs = (updated: Partial<IprInputs>) => {
    setIprInputs((prev) => ({ ...prev, ...updated }));
  };

  // 2. Gas Components Composition State
  const [components, setComponents] = useState<GasComponent[]>(PURE_GAS_COMPONENTS);

  // 3. C7+ Characterization
  const [c7PlusConfig, setC7PlusConfig] = useState<C7PlusConfig>({
    molWeight: 114.2,
    specificGravity: 0.785
  });

  // 4. Preset & Auto-normalize State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('dry_gas');
  const [autoNormalize, setAutoNormalize] = useState<boolean>(false);

  // 5. Modals State
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [docsTab, setDocsTab] = useState<'guide' | 'readme' | 'disclaimer'>('guide');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'equations' | 'ai'>('dashboard');

  // Handle Preset Selection
  const handleSelectPreset = (preset: CompositionPreset) => {
    setSelectedPresetId(preset.id);
    
    // Update component mole fractions from preset
    setComponents((prev) =>
      prev.map((comp) => {
        const val = preset.compositions[comp.id] !== undefined ? preset.compositions[comp.id] : 0;
        return {
          ...comp,
          moleFraction: val
        };
      })
    );

    if (preset.c7Plus) {
      setC7PlusConfig(preset.c7Plus);
    }
  };

  // Handle individual component fraction edit
  const handleChangeComponentFraction = (id: string, value: number) => {
    setSelectedPresetId('custom');
    const clampedVal = Math.max(0, Math.min(1.0, value));

    setComponents((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, moleFraction: clampedVal } : c));
      
      if (autoNormalize) {
        const sum = updated.reduce((s, c) => s + c.moleFraction, 0);
        if (sum > 0) {
          return updated.map((c) => ({ ...c, moleFraction: Number((c.moleFraction / sum).toFixed(4)) }));
        }
      }
      return updated;
    });
  };

  // Handle manual composition normalization
  const handleNormalize = () => {
    const total = components.reduce((sum, c) => sum + c.moleFraction, 0);
    if (total <= 0) return;

    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        moleFraction: Number((c.moleFraction / total).toFixed(4))
      }))
    );
  };

  // Synchronize C7+ properties into components list
  const activeComponentsWithC7 = useMemo(() => {
    return components.map((c) => {
      if (c.id === 'c7plus') {
        return {
          ...c,
          molWeight: c7PlusConfig.molWeight
        };
      }
      return c;
    });
  }, [components, c7PlusConfig]);

  // Helper: Normalize current inputs to Field units (psia, °F, scf/STB) for calculation engine
  const isField = conditions.unitSystem === 'field';
  const pPsia = isField ? conditions.pressure : conditions.pressure / 0.0689476;
  const tempF = isField ? conditions.temperature : conditions.temperature * 1.8 + 32;
  const rsiScfStb = isField
    ? blackOilInputs.solutionGasOilRatioInitial
    : blackOilInputs.solutionGasOilRatioInitial / 0.178107;

  // Main PVT Calculation engine invocation
  const results = useMemo(() => {
    return calculateFluidProperties(
      activeComponentsWithC7,
      pPsia,
      tempF,
      zFactorMethod,
      ppcMethod,
      sourGasMethod
    );
  }, [activeComponentsWithC7, pPsia, tempF, zFactorMethod, ppcMethod, sourGasMethod]);

  // Global Dark/Light Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('petroleum_app_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('petroleum_app_theme', next);
      return next;
    });
  };

  // Black Oil Standing Correlation calculation
  const blackOilResults = useMemo(() => {
    return calculateBlackOilProperties({
      ...blackOilInputs,
      pressure: pPsia,
      temperature: tempF,
      solutionGasOilRatioInitial: rsiScfStb
    });
  }, [blackOilInputs, pPsia, tempF, rsiScfStb]);

  // Module 2 IPR Calculation invocation
  const iprResults = useMemo(() => {
    return calculateIprProperties(iprInputs, conditions.unitSystem);
  }, [iprInputs, conditions.unitSystem]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-[#0b0f19] text-slate-100 selection:bg-amber-500 selection:text-slate-950' : 'bg-slate-100 text-slate-900 selection:bg-slate-900 selection:text-white'
    }`}>
      
      {/* Top Header Navigation with AppMode Switcher */}
      <Header
        appMode={appMode}
        onChangeAppMode={setAppMode}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        conditions={conditions}
        onChangeConditions={handleUpdateConditions}
        totalMoleFraction={results.totalMoleFraction}
        onNormalize={handleNormalize}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenEquations={() => setActiveTab('equations')}
        onOpenDocs={(tab) => {
          setDocsTab(tab || 'guide');
          setIsDocsOpen(true);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Main Grid: Left Controls (4 cols) | Right Dashboards (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            {appMode === 'pvt' ? (
              <SidebarControls
                fluidType={fluidType}
                onChangeFluidType={setFluidType}
                blackOilInputs={blackOilInputs}
                onChangeBlackOilInputs={handleUpdateBlackOilInputs}
                conditions={conditions}
                onChangeConditions={handleUpdateConditions}
                components={components}
                onChangeComponentFraction={handleChangeComponentFraction}
                c7PlusConfig={c7PlusConfig}
                onChangeC7PlusConfig={(cfg) => setC7PlusConfig((prev) => ({ ...prev, ...cfg }))}
                totalMoleFraction={results.totalMoleFraction}
                onNormalize={handleNormalize}
                autoNormalize={autoNormalize}
                onToggleAutoNormalize={setAutoNormalize}
                zFactorMethod={zFactorMethod}
                onChangeZFactorMethod={setZFactorMethod}
                ppcMethod={ppcMethod}
                onChangePpcMethod={setPpcMethod}
                sourGasMethod={sourGasMethod}
                onChangeSourGasMethod={setSourGasMethod}
                theme={theme}
              />
            ) : (
              <IprSidebarControls
                inputs={iprInputs}
                onChangeInputs={handleUpdateIprInputs}
                conditions={conditions}
                theme={theme}
              />
            )}
          </div>

          {/* Right Column: Key Dashboard & Visualizers */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            
            {/* Nav Tabs for Main Content - Industrial Slate Tabs */}
            <div className={`flex flex-wrap items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  activeTab === 'dashboard'
                    ? isDark ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-extrabold' : 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                    : isDark ? 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800' : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
              >
                {appMode === 'pvt' ? 'PVT Metrics & Sensitivity' : 'IPR Deliverability Dashboard'}
              </button>
              <button
                onClick={() => setActiveTab('equations')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  activeTab === 'equations'
                    ? isDark ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-extrabold' : 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                    : isDark ? 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800' : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
              >
                Engineering Physics & Formulas
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all border flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'ai'
                    ? isDark ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-extrabold' : 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                    : isDark ? 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800' : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
              >
                <span>AI Reservoir Assistant</span>
                <span className={`w-2 h-2 rounded-full ${activeTab === 'ai' ? 'bg-slate-950' : 'bg-emerald-400'} animate-pulse`} />
              </button>
            </div>

            {/* MODULE 1: PVT Calculator Views */}
            {appMode === 'pvt' && (
              <>
                {/* TAB 1: PVT Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <MetricCards
                      fluidType={fluidType}
                      results={results}
                      conditions={conditions}
                      blackOilInputs={blackOilInputs}
                      blackOilResults={blackOilResults}
                      theme={theme}
                    />

                    <SensitivityCharts
                      fluidType={fluidType}
                      components={activeComponentsWithC7}
                      conditions={conditions}
                      blackOilInputs={blackOilInputs}
                      blackOilResults={blackOilResults}
                      zFactorMethod={zFactorMethod}
                      ppcMethod={ppcMethod}
                      theme={theme}
                    />

                    {fluidType === 'gas' && <CompositionTable results={results} theme={theme} />}
                  </div>
                )}

                {/* TAB 2: PVT Equations */}
                {activeTab === 'equations' && (
                  <div>
                    <EquationsSection
                      fluidType={fluidType}
                      results={results}
                      conditions={conditions}
                      blackOilInputs={blackOilInputs}
                      blackOilResults={blackOilResults}
                      theme={theme}
                    />
                  </div>
                )}

                {/* TAB 3: AI Reservoir Assistant */}
                {activeTab === 'ai' && (
                  <div>
                    <AIReservoirAssistant
                      fluidType={fluidType}
                      results={results}
                      conditions={conditions}
                      blackOilInputs={blackOilInputs}
                      blackOilResults={blackOilResults}
                      theme={theme}
                    />
                  </div>
                )}
              </>
            )}

            {/* MODULE 2: Fluid Flow & IPR Calculator Views */}
            {appMode === 'ipr' && (
              <>
                {/* TAB 1: IPR Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <IprMetricCards
                      results={iprResults}
                      inputs={iprInputs}
                      conditions={conditions}
                      theme={theme}
                    />

                    <IprCharts
                      results={iprResults}
                      inputs={iprInputs}
                      conditions={conditions}
                      theme={theme}
                    />
                  </div>
                )}

                {/* TAB 2: IPR Equations */}
                {activeTab === 'equations' && (
                  <div>
                    <IprEquationsSection
                      inputs={iprInputs}
                      results={iprResults}
                      conditions={conditions}
                      theme={theme}
                    />
                  </div>
                )}

                {/* TAB 3: AI Reservoir Assistant (Contextualized for IPR Flow) */}
                {activeTab === 'ai' && (
                  <div>
                    <AIReservoirAssistant
                      fluidType={fluidType}
                      results={results}
                      conditions={conditions}
                      blackOilInputs={blackOilInputs}
                      blackOilResults={blackOilResults}
                      theme={theme}
                    />
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </main>

      {/* Application Engineering Footer & Disclaimer Link */}
      <footer className={`mt-auto border-t py-4 px-6 text-xs transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-200/80 border-slate-300 text-slate-600'
      }`}>
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Petroleum Engineering Suite v3.2</span>
            <span>•</span>
            <span>Reservoir Fluid PVT & Well IPR Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => { setDocsTab('guide'); setIsDocsOpen(true); }}
              className="hover:underline font-semibold cursor-pointer text-amber-500 hover:text-amber-400"
            >
              User Manual & Guide
            </button>
            <span>•</span>
            <button
              onClick={() => { setDocsTab('readme'); setIsDocsOpen(true); }}
              className="hover:underline font-semibold cursor-pointer text-cyan-400 hover:text-cyan-300"
            >
              Technical Readme
            </button>
            <span>•</span>
            <button
              onClick={() => { setDocsTab('disclaimer'); setIsDocsOpen(true); }}
              className="hover:underline font-semibold cursor-pointer text-rose-400 hover:text-rose-300"
            >
              Liability Disclaimer
            </button>
          </div>
        </div>
      </footer>

      {/* Export Report Modal */}
      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        results={results}
        conditions={conditions}
        theme={theme}
      />

      {/* Interactive Documentation & Manual Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        initialTab={docsTab}
        theme={theme}
      />

    </div>
  );
}


