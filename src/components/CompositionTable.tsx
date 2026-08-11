import React, { useState } from 'react';
import { CalculatedResults } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Table, PieChart as PieIcon, BarChart2 } from 'lucide-react';

interface CompositionTableProps {
  results: CalculatedResults;
  theme?: 'dark' | 'light';
}

const DISTINCT_COLORS = [
  '#38bdf8', // Methane (Sky)
  '#34d399', // Ethane (Emerald)
  '#fbbf24', // Propane (Amber)
  '#c084fc', // i-Butane (Purple)
  '#f87171', // n-Butane (Red)
  '#fb923c', // i-Pentane (Orange)
  '#a3e635', // n-Pentane (Lime)
  '#22d3ee', // Hexane (Cyan)
  '#818cf8', // C7+ (Indigo)
  '#f43f5e', // CO2 (Rose)
  '#e879f9', // H2S (Fuchsia)
  '#94a3b8', // N2 (Slate)
];

export const CompositionTable: React.FC<CompositionTableProps> = ({ results, theme = 'dark' }) => {
  const [viewMode, setViewMode] = useState<'table' | 'pie' | 'bar'>('table');
  const isDark = theme === 'dark';

  const activeComponents = results.componentsBreakdown.filter((item) => item.moleFraction > 0);

  const pieData = activeComponents.map((item, idx) => ({
    id: item.component.id,
    formula: item.component.formula,
    name: item.component.name,
    fullName: `${item.component.formula} (${item.component.name})`,
    value: Number((item.moleFraction * 100).toFixed(2)),
    massValue: Number((item.massFraction * 100).toFixed(2)),
    color: DISTINCT_COLORS[idx % DISTINCT_COLORS.length]
  }));

  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className={`${cardBg} border rounded-2xl p-5 shadow-lg space-y-4 transition-colors`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            Hydrocarbon Mixture Breakdown
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Mole % and Weight % distribution for EOS Kay's Mixing Rule
          </p>
        </div>

        {/* View Switcher */}
        <div className={`flex ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 rounded-xl border text-xs font-bold`}>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'table'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'pie'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Pie Chart</span>
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'bar'
                ? isDark ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-white text-slate-900 shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Table */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-amber-400' : 'border-slate-200 text-slate-700'}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                <th className="py-2.5 px-3 font-bold">Formula</th>
                <th className="py-2.5 px-3 font-bold">Component Name</th>
                <th className="py-2.5 px-3 font-bold text-right">Mole % (z<sub>i</sub>)</th>
                <th className="py-2.5 px-3 font-bold text-right">Weight % (w<sub>i</sub>)</th>
                <th className="py-2.5 px-3 font-bold text-right">Mol. Wt (M<sub>i</sub>)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {results.componentsBreakdown.map((item) => (
                <tr key={item.component.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                  <td className="py-2 px-3 font-bold text-amber-400">{item.component.formula}</td>
                  <td className={`py-2 px-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.component.name}</td>
                  <td className="py-2 px-3 text-right font-bold">{(item.moleFraction * 100).toFixed(2)}%</td>
                  <td className={`py-2 px-3 text-right ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{(item.massFraction * 100).toFixed(2)}%</td>
                  <td className={`py-2 px-3 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.component.molWeight.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mode 2: Pie Chart */}
      {viewMode === 'pie' && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
          <div className="h-[240px] w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="fullName"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={2}
                  minAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontFamily: "'Times New Roman', Times, serif"
                  }}
                  formatter={(val) => [`${val}%`, 'Mole %']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Side Legend */}
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
            {pieData.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-amber-400 truncate">{item.formula}</span>
                </div>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Bar Chart */}
      {viewMode === 'bar' && (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} opacity={0.6} />
              <XAxis dataKey="formula" stroke={isDark ? '#94a3b8' : '#475569'} tick={{ fontSize: 11, fontFamily: "'Times New Roman', Times, serif" }} />
              <YAxis stroke={isDark ? '#94a3b8' : '#475569'} tick={{ fontSize: 11, fontFamily: "'Times New Roman', Times, serif" }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  borderRadius: '12px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontFamily: "'Times New Roman', Times, serif"
                }}
                formatter={(val) => [`${val}%`, 'Mole %']}
              />
              <Bar dataKey="value" name="Mole %" radius={[6, 6, 0, 0]}>
                {pieData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};
