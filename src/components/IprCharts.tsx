import React from 'react';
import { IprResults, ReservoirConditions, IprInputs } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { Activity, Info } from 'lucide-react';

interface IprChartsProps {
  results: IprResults;
  inputs: IprInputs;
  conditions: ReservoirConditions;
  theme?: 'dark' | 'light';
}

export const IprCharts: React.FC<IprChartsProps> = ({
  results,
  inputs,
  conditions,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const isField = conditions.unitSystem === 'field';
  const flowUnit = isField ? 'STB/day' : 'm³/day';
  const pressureUnit = isField ? 'psia' : 'bar';

  // Chart theme colors
  const strokeGrid = isDark ? '#1e293b' : '#e2e8f0';
  const textAxis = isDark ? '#94a3b8' : '#475569';
  const textAxisLabel = isDark ? '#e2e8f0' : '#1e293b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-4 transition-colors`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Inflow Performance Relationship (IPR) Curve
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Flowing Bottomhole Pressure (P<sub>wf</sub>) vs Oil Production Rate (q) | Vogel Combined Model
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className={`flex flex-wrap items-center gap-2 ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} px-3 py-1.5 rounded-xl border text-xs font-bold`}>
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" />
            <span>Actual IPR (Skin S={inputs.skinFactor})</span>
          </div>
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="inline-block w-3 h-0.5 border-t-2 border-dashed border-cyan-400" />
            <span className="text-cyan-400">Ideal IPR (S=0)</span>
          </div>
        </div>
      </div>

      {/* Main Chart View Area */}
      <div className={`h-[300px] xs:h-[350px] sm:h-[420px] w-full ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50/50 border-slate-200'} rounded-xl p-1.5 sm:p-3 border relative`}>

        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
          <LineChart
            data={results.iprCurveData}
            margin={{ top: 20, right: 20, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={strokeGrid} opacity={0.6} />
            
            {/* Abscissa (X-Axis): Flow Rate cleanly formatted and uncluttered */}
            <XAxis
              dataKey="q"
              type="number"
              domain={[0, 'auto']}
              tickCount={6}
              dy={6}
              stroke={textAxis}
              tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
              tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
              label={{
                value: `Oil Production Flow Rate Abscissa (q) [${flowUnit}]`,
                position: 'insideBottom',
                offset: -18,
                style: { fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxisLabel }
              }}
            />

            <YAxis
              dataKey="pwf"
              type="number"
              domain={[0, 'auto']}
              tickCount={6}
              width={48}
              stroke={textAxis}
              tick={{ fontSize: 10, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxis }}
              tickFormatter={(val) => typeof val === 'number' ? Math.round(val).toLocaleString() : val}
              label={{
                value: `Flowing BHP P_wf (${pressureUnit})`,
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 11, fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold', fill: textAxisLabel }
              }}
            />

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
              formatter={(val: any, name: string) => {
                if (typeof val === 'number') {
                  const rounded = Math.round(val);
                  let note = '';
                  if (rounded === 0) {
                    note = ' (AOF / Max Drawdown)';
                  } else if (Math.abs(val - inputs.reservoirPressure) < 5) {
                    note = ' (P_r / Shut-In)';
                  }
                  return [`${rounded.toLocaleString()} ${pressureUnit}${note}`, name];
                }
                return [val, name];
              }}
              labelFormatter={(label) => `Production Rate q: ${typeof label === 'number' ? Math.round(label).toLocaleString() : label} ${flowUnit}`}
            />

            <Legend
              verticalAlign="top"
              height={32}
              wrapperStyle={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '11px', color: textAxisLabel }}
            />

            {/* Bubble Point Reference Line */}
            {inputs.useVogelCombined && inputs.bubblePointPressure < inputs.reservoirPressure && (
              <ReferenceLine
                y={inputs.bubblePointPressure}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `P_b = ${inputs.bubblePointPressure.toLocaleString()} ${pressureUnit}`,
                  position: 'right',
                  fill: '#f59e0b',
                  fontSize: 10,
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: 'bold'
                }}
              />
            )}

            {/* Target Flowing BHP Horizontal Reference */}
            <ReferenceLine
              y={inputs.targetPwf}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: `Target P_wf = ${inputs.targetPwf.toLocaleString()} ${pressureUnit}`,
                position: 'insideTopLeft',
                fill: '#ef4444',
                fontSize: 10,
                fontFamily: "'Times New Roman', Times, serif",
                fontWeight: 'bold'
              }}
            />

            {/* Target Operating Point Marker Dot */}
            <ReferenceDot
              x={results.qAtTargetPwf}
              y={inputs.targetPwf}
              r={6}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={2}
            />

            {/* Actual IPR Curve */}
            <Line
              type="monotone"
              dataKey="pwf"
              name={`Actual IPR (Skin S = ${inputs.skinFactor})`}
              stroke={isDark ? '#34d399' : '#059669'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />

            {/* Ideal IPR Curve (S = 0) */}
            <Line
              type="monotone"
              dataKey="pwf"
              data={results.iprCurveData.map((d) => ({ q: d.qIdealSkin0, pwf: d.pwf }))}
              name="Ideal IPR (Skin S = 0)"
              stroke={isDark ? '#38bdf8' : '#0284c7'}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Physics Interpretation Box */}
      <div className={`${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border p-3.5 rounded-xl text-xs leading-relaxed flex items-start space-x-2.5`}>
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className={`font-extrabold uppercase tracking-wider block text-[10px] mb-0.5 ${isDark ? 'text-amber-400' : 'text-slate-900'}`} style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            Inflow Deliverability Physics & Vogel's Law:
          </span>
          <span style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            At P<sub>wf</sub> = P<sub>r</sub> ({inputs.reservoirPressure} {pressureUnit}), flow rate q = 0 (Static Reservoir). As BHP drops, flow rate increases linearly above bubble point ({inputs.bubblePointPressure} {pressureUnit}) according to Darcy's Law, and curves downward below P<sub>b</sub> due to relative permeability reduction from evolved gas bubbles (Vogel's 2-phase effect). Absolute Open Flow (AOF) reaches <strong className={isDark ? 'text-emerald-400 font-extrabold' : 'text-emerald-700 font-extrabold'}>{results.qMaxAof.toLocaleString()} {flowUnit}</strong> at P<sub>wf</sub> = 0.
          </span>
        </div>
      </div>

    </div>
  );
};
