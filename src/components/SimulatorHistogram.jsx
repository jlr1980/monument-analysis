import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Compute histogram bins from a numeric array. Auto-range or fixed range.
function computeBins(values, nBins, valueRange) {
  const clean = values.filter((v) => v != null && Number.isFinite(v));
  if (clean.length === 0) return { bins: [], lo: 0, hi: 0, step: 0 };
  let lo, hi;
  if (valueRange) {
    [lo, hi] = valueRange;
  } else {
    lo = Math.min(...clean);
    hi = Math.max(...clean);
  }
  if (hi <= lo) hi = lo + 1;
  const step = (hi - lo) / nBins;
  const counts = new Array(nBins).fill(0);
  for (const v of clean) {
    let idx = Math.floor((v - lo) / step);
    if (idx < 0) idx = 0;
    if (idx >= nBins) idx = nBins - 1;
    counts[idx]++;
  }
  return { bins: counts, lo, hi, step };
}

// values: array of numbers; label: chart label; formatTick: format X tick;
// formatValue: format hover value; valueRange: [lo, hi] or null for auto.
export default function SimulatorHistogram({
  values,
  label,
  formatTick = (v) => v.toFixed(2),
  formatValue = (v) => v.toFixed(2),
  valueRange = null,
  nBins = 28,
  medianValue = null,
}) {
  const { data, lo, hi, step } = useMemo(() => {
    const { bins, lo, hi, step } = computeBins(values || [], nBins, valueRange);
    const data = bins.map((count, i) => ({
      x: lo + (i + 0.5) * step,
      count,
    }));
    return { data, lo, hi, step };
  }, [values, nBins, valueRange]);

  return (
    <div className="simulator-histogram">
      <div className="histogram-label">{label}</div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 4 }}>
          <Bar dataKey="count" fill="#e5251c" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[lo, hi]}
            tickCount={5}
            tickFormatter={formatTick}
            tick={{ fontSize: 10, fill: "#6b6b6b", fontFamily: "Inter" }}
            stroke="#d9cfb7"
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(229,37,28,0.08)" }}
            contentStyle={{
              background: "#faf1dd",
              border: "1px solid #d9cfb7",
              borderRadius: "4px",
              fontFamily: "Inter",
              fontSize: "0.8rem",
              padding: "0.4rem 0.6rem",
            }}
            labelFormatter={(v) => formatValue(v)}
            formatter={(v) => [v, "count"]}
          />
        </BarChart>
      </ResponsiveContainer>
      {medianValue != null && Number.isFinite(medianValue) ? (
        <div className="histogram-median">median {formatValue(medianValue)}</div>
      ) : null}
    </div>
  );
}
