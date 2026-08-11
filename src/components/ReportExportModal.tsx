import React from 'react';
import { CalculatedResults, ReservoirConditions } from '../types';
import { X, Printer, Download, FileSpreadsheet, CheckCircle, Flame } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CalculatedResults;
  conditions: ReservoirConditions;
  theme?: 'dark' | 'light';
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  results,
  conditions,
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const isField = conditions.unitSystem === 'field';

  // Export CSV generator
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'RESERVOIR FLUID CALCULATOR - PVT ANALYSIS REPORT\n';
    csvContent += `Report Generated: ${new Date().toLocaleString()}\n\n`;

    csvContent += 'RESERVOIR CONDITIONS\n';
    csvContent += `Pressure,${conditions.pressure},${isField ? 'psia' : 'bar'}\n`;
    csvContent += `Temperature,${conditions.temperature},${isField ? '°F' : '°C'}\n\n`;

    csvContent += 'CALCULATED PVT THERMODYNAMIC PROPERTIES\n';
    csvContent += `Apparent Molecular Weight (Ma),${results.apparentMolWeight.toFixed(4)},lb/lb-mol\n`;
    csvContent += `Gas Specific Gravity (Air=1.0),${results.gasSpecificGravity.toFixed(4)}\n`;
    csvContent += `Uncorrected Pseudo-critical Pressure (P_pc),${results.pseudoCriticalPressureUncorrected.toFixed(2)},psia\n`;
    csvContent += `Uncorrected Pseudo-critical Temp (T_pc),${results.pseudoCriticalTempUncorrected.toFixed(2)},°R\n`;
    csvContent += `Sour Gas Correction Factor (Wichert-Aziz),${results.wichertAzizFactor.toFixed(2)},°R\n`;
    csvContent += `Corrected Pseudo-critical Pressure (P_pc'),${results.pseudoCriticalPressure.toFixed(2)},psia\n`;
    csvContent += `Corrected Pseudo-critical Temp (T_pc'),${results.pseudoCriticalTemp.toFixed(2)},°R\n`;
    csvContent += `Pseudo-Reduced Pressure (P_pr),${results.pseudoReducedPressure.toFixed(4)}\n`;
    csvContent += `Pseudo-Reduced Temp (T_pr),${results.pseudoReducedTemp.toFixed(4)}\n`;
    csvContent += `Compressibility Z-Factor (Hall-Yarborough),${results.zFactor.toFixed(4)}\n`;
    csvContent += `Ideal Gas Density,${results.idealDensityLbFt3.toFixed(4)},lb/ft3\n`;
    csvContent += `Real Gas Density,${results.realDensityLbFt3.toFixed(4)},lb/ft3\n`;
    csvContent += `Gas Formation Volume Factor (Bg),${results.gasFormationVolumeFactorBgFt3Scf.toFixed(6)},ft3/scf\n`;
    csvContent += `Gas Viscosity (mu_g),${results.gasViscosityCp.toFixed(4)},cP\n\n`;

    csvContent += 'GAS COMPOSITION BREAKDOWN\n';
    csvContent += 'Component,Formula,Mole Fraction,Mole Percent,Mass Percent,Mol Weight\n';

    results.componentsBreakdown.forEach((c) => {
      csvContent += `"${c.component.name}",${c.component.formula},${c.moleFraction.toFixed(4)},${c.molePercent.toFixed(2)}%,${(c.massFraction * 100).toFixed(2)}%,${c.component.molWeight.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reservoir_Gas_PVT_Report_${conditions.pressure}psi_${conditions.temperature}F.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Petroleum Engineering PVT Analysis Report
              </h3>
              <p className="text-xs text-slate-400">
                Official fluid property calculation summary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200 text-xs sm:text-sm font-sans" id="printable-report">
          
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <h4 className="font-bold text-lg text-amber-400">Reservoir Gas Summary</h4>
              <p className="text-slate-400 text-xs">Methodology: Ahmed Tarek Reservoir Engineering Handbook</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Status: {results.isValidComposition ? 'Verified (Σy_i = 1.0)' : 'Normalized'}</p>
            </div>
          </div>

          {/* Conditions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">RESERVOIR PRESSURE</span>
              <strong className="text-amber-400">{conditions.pressure} psia</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">RESERVOIR TEMP</span>
              <strong className="text-amber-400">{conditions.temperature} °F / {(conditions.temperature + 459.67).toFixed(1)} °R</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Z-FACTOR (H-Y)</span>
              <strong className="text-blue-400">{results.zFactor.toFixed(4)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">REAL DENSITY</span>
              <strong className="text-emerald-400">{results.realDensityLbFt3.toFixed(4)} lb/ft³</strong>
            </div>
          </div>

          {/* Calculated Properties Summary Table */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-100 text-xs uppercase tracking-wide">
              Thermodynamic Calculated Parameters
            </h5>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr className="bg-slate-950/40">
                    <td className="py-2 px-3 text-slate-400 font-sans">Apparent Molecular Weight (M<sub>a</sub>)</td>
                    <td className="py-2 px-3 font-bold text-amber-400 text-right">{results.apparentMolWeight.toFixed(3)} lb/lb-mol</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Gas Specific Gravity (Air = 1.0)</td>
                    <td className="py-2 px-3 font-bold text-slate-200 text-right">{results.gasSpecificGravity.toFixed(4)}</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="py-2 px-3 text-slate-400 font-sans">Pseudo-critical Pressure (P<sub>pc</sub>')</td>
                    <td className="py-2 px-3 font-bold text-slate-200 text-right">{results.pseudoCriticalPressure.toFixed(2)} psia</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Pseudo-critical Temperature (T<sub>pc</sub>')</td>
                    <td className="py-2 px-3 font-bold text-slate-200 text-right">{results.pseudoCriticalTemp.toFixed(2)} °R</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="py-2 px-3 text-slate-400 font-sans">Ideal Gas Density (ρ<sub>ideal</sub>)</td>
                    <td className="py-2 px-3 font-bold text-slate-200 text-right">{results.idealDensityLbFt3.toFixed(4)} lb/ft³</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Real Gas Density (ρ<sub>real</sub>)</td>
                    <td className="py-2 px-3 font-bold text-amber-400 text-right">{results.realDensityLbFt3.toFixed(4)} lb/ft³</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="py-2 px-3 text-slate-400 font-sans">Gas Formation Volume Factor (B<sub>g</sub>)</td>
                    <td className="py-2 px-3 font-bold text-purple-300 text-right">{results.gasFormationVolumeFactorBgFt3Scf.toFixed(6)} ft³/scf</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Gas Viscosity (μ<sub>g</sub>)</td>
                    <td className="py-2 px-3 font-bold text-emerald-400 text-right">{results.gasViscosityCp.toFixed(4)} cP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for export</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={printReport}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Summary</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
