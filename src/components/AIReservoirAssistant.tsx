import React, { useState } from 'react';
import { CalculatedResults, ReservoirConditions, FluidType, BlackOilInputs, BlackOilResults } from '../types';
import { Sparkles, Loader2, AlertCircle, Cpu, CheckCircle2, Droplet } from 'lucide-react';

interface AIReservoirAssistantProps {
  fluidType?: FluidType;
  results: CalculatedResults;
  conditions: ReservoirConditions;
  blackOilInputs?: BlackOilInputs;
  blackOilResults?: BlackOilResults;
  theme?: 'dark' | 'light';
}

export const AIReservoirAssistant: React.FC<AIReservoirAssistantProps> = ({
  fluidType = 'gas',
  results,
  conditions,
  blackOilInputs,
  blackOilResults,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const boxBg = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200';
  const [loading, setLoading] = useState(false);
  const [insightText, setInsightText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      let payload: any = {};

      if (fluidType === 'oil' && blackOilInputs && blackOilResults) {
        payload = {
          fluidType: 'oil',
          pressure: blackOilInputs.pressure,
          temperature: blackOilInputs.temperature,
          apiGravity: blackOilInputs.apiGravity,
          gasSg: blackOilInputs.gasSpecificGravity,
          solutionGorInit: blackOilInputs.solutionGasOilRatioInitial,
          currentRs: blackOilResults.currentSolutionGasOilRatio.toFixed(1),
          bo: blackOilResults.oilFormationVolumeFactor.toFixed(4),
          pb: blackOilResults.bubblePointPressure.toFixed(1),
          fluidState: blackOilResults.fluidState
        };
      } else {
        const activeComposition = results.componentsBreakdown
          .filter((c) => c.moleFraction > 0)
          .map((c) => ({
            component: `${c.component.formula} (${c.component.name})`,
            moleFraction: c.moleFraction,
            molePercent: `${c.molePercent.toFixed(2)}%`
          }));

        payload = {
          fluidType: 'gas',
          pressure: conditions.pressure,
          temperature: conditions.temperature,
          ma: results.apparentMolWeight.toFixed(2),
          sg: results.gasSpecificGravity.toFixed(3),
          zFactor: results.zFactor.toFixed(4),
          realDensity: results.realDensityLbFt3.toFixed(4),
          idealDensity: results.idealDensityLbFt3.toFixed(4),
          bg: results.gasFormationVolumeFactorBgFt3Scf.toFixed(5),
          viscosity: results.gasViscosityCp.toFixed(4),
          isSourGas: results.isSourGasCorrected,
          compositionSummary: activeComposition
        };
      }

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success && data.text) {
        setInsightText(data.text);
      } else {
        throw new Error(data.error || 'Failed to fetch AI insights');
      }
    } catch (err: any) {
      console.error('AI Insights Error:', err);
      setError(err.message || 'An error occurred while analyzing the reservoir fluid.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`${cardBg} border rounded-2xl p-5 sm:p-6 shadow-lg space-y-4 transition-colors`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} pb-4`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'} tracking-tight`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Gemini Reservoir Engineering Assistant
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              Fluid classification, flow assurance risk analysis & operational recommendations
            </p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading}
          className={`px-4 py-2 ${isDark ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold' : 'bg-slate-900 text-white hover:bg-slate-800'} rounded-xl text-xs transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50 shadow-sm cursor-pointer`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Fluid Physics...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              <span>{insightText ? 'Re-Analyze Fluid Brief' : 'Generate AI Fluid Brief'}</span>
            </>
          )}
        </button>
      </div>

      {/* Content area */}
      {error && (
        <div className="p-3.5 bg-red-600/90 text-white border border-red-500 rounded-xl font-mono text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {insightText ? (
        <div className={`${boxBg} border rounded-xl p-4 sm:p-5 ${isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'} text-xs sm:text-sm leading-relaxed space-y-3 font-mono overflow-x-auto`}>
          {insightText.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('#') || paragraph.startsWith('**1.') || paragraph.startsWith('**2.') || paragraph.startsWith('**3.') || paragraph.startsWith('**4.')) {
              return (
                <div key={i} className={`font-bold ${isDark ? 'text-amber-400 border-slate-800' : 'text-slate-900 border-slate-200'} text-sm pt-2 border-t first:border-0 first:pt-0`}>
                  {paragraph}
                </div>
              );
            }
            return (
              <p key={i}>
                {paragraph}
              </p>
            );
          })}
        </div>
      ) : (
        <div className={`${boxBg} border border-dashed ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'} rounded-xl p-6 text-center text-xs space-y-2 font-mono`}>
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
          <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-wider text-xs`}>
            Ready for Petroleum Thermodynamics Analysis
          </p>
          <p className="text-[11px] max-w-md mx-auto opacity-75">
            Click "Generate AI Fluid Brief" to evaluate phase behavior, flow assurance hazards (hydrates, scaling), and processing recommendations.
          </p>
        </div>
      )}

    </div>
  );
};
