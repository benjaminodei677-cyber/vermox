import React, { useState } from 'react';
import { X, BookOpen, Code, ShieldAlert, CheckCircle2, FileText, Layers, Activity, AlertTriangle, ExternalLink, Cpu, Terminal, HelpCircle } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'guide' | 'readme' | 'disclaimer';
  theme: 'dark' | 'light';
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'guide',
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'readme' | 'disclaimer'>(initialTab);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Documentation & User Manual
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Petroleum Engineering Suite v3.2 Documentation Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className={`flex items-center space-x-2 px-6 py-2.5 border-b text-xs font-semibold ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-100/60'}`}>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'guide'
                ? isDark ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'bg-slate-900 text-white font-bold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. User Manual & Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'readme'
                ? isDark ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'bg-slate-900 text-white font-bold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>2. Technical Readme & Codebase</span>
          </button>

          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>3. Liability Disclaimer</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      User Operational Manual
                    </h3>
                    <p className="text-xs opacity-90">
                      Learn how to set reservoir conditions, enter fluid compositions, configure Black Oil correlations, set up well IPR parameters, and accurately interpret generated calculation graphs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: PVT Input Workflow */}
              <div className="space-y-3">
                <h4 className="font-bold text-base flex items-center space-x-2 border-b pb-1 text-amber-500" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <Layers className="w-4 h-4" />
                  <span>Module 1: Reservoir Fluid PVT Properties</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h5 className="font-bold text-sm mb-1.5 text-cyan-400">Natural Gas Mode Input Steps</h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li>Set <strong>Reservoir Pressure ($P$)</strong> and <strong>Temperature ($T$)</strong> in the left control panel.</li>
                      <li>Select a pre-configured composition preset or enter custom mole fractions ($y_i$) in the Gas Composition table.</li>
                      <li>Click <strong>Fix Sum (Normalize)</strong> if the mole fraction total deviates from 100%.</li>
                      <li>Select Equation of State (EOS) solver: <strong>Hall-Yarborough</strong> or <strong>Dranchuk-Abu Kassem</strong>.</li>
                      <li>Choose non-hydrocarbon correction method (Wichert-Aziz, Carr-Kobayashi-Burrows, or Piper) for sour gas ($CO_2, H_2S, N_2$).</li>
                    </ol>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h5 className="font-bold text-sm mb-1.5 text-emerald-400">Crude Oil (Black Oil) Input Steps</h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li>Select <strong>Crude Oil</strong> under Fluid Type selector.</li>
                      <li>Input <strong>Stock Tank Oil Gravity (°API)</strong>, <strong>Gas Gravity (γ_g)</strong>, and <strong>Initial GOR (R_si)</strong>.</li>
                      <li>Select your preferred correlation suite: <em>Standing</em>, <em>Vasquez-Beggs</em>, <em>Glaso</em>, <em>Marhoun</em>, or <em>Petrosky-Farshad</em>.</li>
                      <li>Inspect the calculated Bubble Point Pressure (P_b), Saturated B_o (B_ob), and Solution GOR (R_s).</li>
                      <li>Toggle between Field (psia, °F) and SI (bar, °C) unit systems anytime.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Section 2: IPR Workflow */}
              <div className="space-y-3">
                <h4 className="font-bold text-base flex items-center space-x-2 border-b pb-1 text-emerald-500" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <Activity className="w-4 h-4" />
                  <span>Module 2: Reservoir Fluid Flow & IPR Analysis</span>
                </h4>
                
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p>
                    <strong>Inflow Performance Relationship (IPR)</strong> models wellbore deliverability by plotting Flowing Bottomhole Pressure (P_wf) against Production Rate (q).
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Permeability (k) & Pay Thickness (h)</strong>: Define reservoir rock transmissibility (kh).</li>
                    <li><strong>Skin Factor (S)</strong>: Positive values (S &gt; 0) simulate mechanical formation damage; negative values (S &lt; 0) simulate stimulated/acid-fractured performance.</li>
                    <li><strong>Single-Phase Darcy Flow (P_wf &ge; P_b)</strong>: Linear inflow behavior governed by Productivity Index J.</li>
                    <li><strong>Vogel Two-Phase Flow (P_wf &lt; P_b)</strong>: Parabolic quadratic drawdown curve accounting for gas liberation and relative permeability impairment.</li>
                    <li><strong>Absolute Open Flow (AOF)</strong>: Theoretical maximum production capacity occurring when P_wf = 0 psia (maximum drawdown).</li>
                  </ul>
                </div>
              </div>

              {/* Section 3: Interpreting Results */}
              <div className="space-y-3">
                <h4 className="font-bold text-base flex items-center space-x-2 border-b pb-1 text-purple-400" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Interpreting Calculation Results & Visualizations</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <strong className="text-amber-400 block mb-1">Compressibility Factor (Z)</strong>
                    <p className="text-slate-300">
                      Z &lt; 1.0 reflects gas compression dominated by attractive intermolecular forces. Z &gt; 1.0 at high pressures reflects finite molecular repulsion.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <strong className="text-cyan-400 block mb-1">Formation Volume Factors ($B_g, B_o$)</strong>
                    <p className="text-slate-300">
                      $B_g$ shrinks monotonically with pressure. $B_o$ expands up to bubble point $P_b$ as gas dissolves into oil, then slightly compresses above $P_b$.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <strong className="text-emerald-400 block mb-1">IPR Skin Comparison</strong>
                    <p className="text-slate-300">
                      The green solid curve shows actual inflow with skin ($S$), while the dashed curve shows ideal undamaged deliverability ($S = 0$).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="space-y-6">
              {/* Architecture Summary */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start space-x-3">
                  <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      Technical Architecture & Codebase Overview
                    </h3>
                    <p className="text-xs text-slate-400">
                      Built as a high-performance React + TypeScript single-page app bundled with Express & Vite. All mathematical solvers run as pure synchronous functions with zero server roundtrip latency.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Libraries */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-amber-500 border-b pb-1">Primary Libraries & Tooling</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100'}`}>
                    <strong className="block text-slate-200">React 18</strong>
                    <span className="text-slate-400 text-[11px]">UI Rendering Engine</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100'}`}>
                    <strong className="block text-slate-200">TypeScript 5</strong>
                    <span className="text-slate-400 text-[11px]">Type-safe domain logic</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100'}`}>
                    <strong className="block text-slate-200">Recharts</strong>
                    <span className="text-slate-400 text-[11px]">Hardware-accelerated SVG charts</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100'}`}>
                    <strong className="block text-slate-200">Tailwind CSS</strong>
                    <span className="text-slate-400 text-[11px]">Responsive UI styling</span>
                  </div>
                </div>
              </div>

              {/* Mathematical Modules */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-cyan-400 border-b pb-1">Core Calculation Engine Files</h4>
                <div className="space-y-2 text-xs">
                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100'}`}>
                    <code className="text-amber-400 font-bold block mb-1">src/utils/pvtCalculations.ts</code>
                    <p className="text-slate-300">
                      Contains Newton-Raphson solvers for Hall-Yarborough and Dranchuk-Abu Kassem $Z$-factor EOS, non-hydrocarbon corrections (Wichert-Aziz, CKB, Piper), Lee-Gonzalez gas viscosity, and 5 Black Oil correlation suites (Standing, Vasquez-Beggs, Glaso, Marhoun, Petrosky-Farshad).
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100'}`}>
                    <code className="text-emerald-400 font-bold block mb-1">src/utils/iprCalculations.ts</code>
                    <p className="text-slate-300">
                      Computes Productivity Index (J), ideal and actual drawdown pressure curves, Darcy single-phase rate, Vogel two-phase inflow, and Absolute Open Flow (AOF) potential at P_wf = 0.
                    </p>
                  </div>
                </div>
              </div>

              {/* Setup & Test Suite Commands */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-emerald-400 border-b pb-1">Setup & Test Execution Commands</h4>
                <div className={`p-3 rounded-lg border font-mono text-xs space-y-2 ${isDark ? 'bg-slate-950 border-slate-800 text-amber-300' : 'bg-slate-900 text-amber-300'}`}>
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span># Install Dependencies</span>
                  </div>
                  <p className="text-slate-300 pl-5">npm install</p>

                  <div className="flex items-center space-x-2 pt-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span># Run 167-Test Verification Suite</span>
                  </div>
                  <p className="text-slate-300 pl-5">npx tsx scripts/testSuite.ts</p>

                  <div className="flex items-center space-x-2 pt-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span># Start Development Server</span>
                  </div>
                  <p className="text-slate-300 pl-5">npm run dev</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-5">
              {/* Liability Header Warning */}
              <div className="p-4 rounded-xl border bg-rose-950/40 border-rose-800/60 text-rose-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      Petroleum Engineering Liability Notice
                    </h3>
                    <p className="text-xs text-rose-300/90 leading-relaxed">
                      Please read this liability disclaimer carefully before using calculation outputs for field development, well design, or financial decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer Body Clauses */}
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-slate-100 text-sm mb-1">1. Estimation & Benchmarking Scope Only</h4>
                  <p>
                    The Petroleum Engineering Suite application and its underlying algorithms (including $Z$-factor EOS solvers, sour gas correction formulas, Black Oil empirical suites, and Vogel IPR curves) are provided strictly for **preliminary screening, comparative estimation, academic research, and rapid analytical benchmarking**.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-slate-100 text-sm mb-1">2. No Substitute for Certified Commercial Packages or Lab PVT</h4>
                  <p>
                    This tool is **not intended to replace laboratory-measured PVT fluid reports** (e.g., constant composition expansion, differential liberation, separator flash tests) or certified commercial numerical reservoir simulators (e.g., ECLIPSE, CMG, Kappa Rubis, Prosper/MBAL). Critical well completion designs, reserve reporting, field development plans (FDP), or regulatory submissions must be independently verified by a licensed **Professional Petroleum Engineer (PE)**.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-slate-100 text-sm mb-1">3. Warranty & Liability Limits</h4>
                  <p>
                    The software is provided **"AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED**. In no event shall the authors, copyright holders, or developers be liable for any claim, reservoir damage, well blowout, equipment failure, financial loss, or indirect damages arising from the use of this software.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-t text-xs ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Petroleum Engineering Suite v3.2 Documentation Center</span>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
