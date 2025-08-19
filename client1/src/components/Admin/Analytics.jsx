import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import reportService from '../../services/reportService';

export default function AdminAnalytics() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [useMock, setUseMock] = useState(true);
  const [highRiskAreas, setHighRiskAreas] = useState([]);

  const buildMockSeries = (numDays) => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (numDays - 1));

    let v = 4 + Math.random() * 4; // base verified
    let a = 3 + Math.random() * 3; // base action taken
    let c = 2 + Math.random() * 3; // base closed

    const arr = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      // small day-to-day drift
      v = Math.max(0, v + (Math.random() - 0.45) * 2);
      a = Math.max(0, a + (Math.random() - 0.45) * 1.6);
      c = Math.max(0, c + (Math.random() - 0.45) * 1.4);

      // weekly seasonality bump on weekdays
      const dayOfWeek = d.getDay(); // 0..6
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;

      arr.push({
        date: d.toISOString().slice(0, 10),
        verified: Math.round(v * weekdayFactor),
        actionTaken: Math.round(a * weekdayFactor),
        closed: Math.round(c * weekdayFactor),
      });
    }
    return arr;
  };

  const buildMockHighRisk = () => {
    const areas = [
      'Rajwada',
      'Rajnagar',
      'New Rajwada',
      'Industrial Zone',
      'Riverbank'
    ];
    return areas.map((name) => ({
      name,
      risk: Math.round(60 + Math.random() * 40),
      count: Math.round(10 + Math.random() * 60)
    })).sort((a, b) => b.risk - a.risk);
  };

  useEffect(() => {
    const load = async () => {
      if (useMock) {
        setSeries(buildMockSeries(days));
        setHighRiskAreas(buildMockHighRisk());
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const resp = await reportService.getReportTimeSeries(days);
        const data = resp.data || resp;
        setSeries(Array.isArray(data.series) ? data.series : []);
        // TODO: Replace with real high-risk endpoint when available
        setHighRiskAreas([]);
      } catch (e) {
        console.error('Failed to load time-series', e);
        setSeries([]);
        setHighRiskAreas([]);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [days, useMock]);

  const svgData = useMemo(() => {
    if (!series.length) return null;

    // Dimensions
    const width = 800;
    const height = 260;
    const padding = { top: 16, right: 20, bottom: 28, left: 36 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    // X scale: points along width
    const xStep = innerW / Math.max(series.length - 1, 1);
    const xAt = (i) => padding.left + i * xStep;

    // Y scale: based on max among all series
    const maxY = Math.max(
      1,
      ...series.map((d) => Math.max(d.verified || 0, d.actionTaken || 0, d.closed || 0))
    );
    const yAt = (v) => padding.top + innerH - (v / maxY) * innerH;

    const toPath = (key) =>
      series
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(d[key] || 0).toFixed(1)}`)
        .join(' ');

    const ticks = 4;
    const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((i * maxY) / ticks));

    return {
      width,
      height,
      xAt,
      yAt,
      maxY,
      yTicks,
      pathVerified: toPath('verified'),
      pathAction: toPath('actionTaken'),
      pathClosed: toPath('closed'),
      labels: series.map((d) => d.date.slice(5)),
    };
  }, [series]);

  const successRate = useMemo(() => {
    if (!series.length) return 0;
    const totals = series.reduce(
      (acc, d) => {
        acc.v += d.verified || 0;
        acc.a += d.actionTaken || 0;
        acc.c += d.closed || 0;
        return acc;
      },
      { v: 0, a: 0, c: 0 }
    );
    const denom = totals.v + totals.a + totals.c;
    if (denom === 0) return 0;
    return Math.round((totals.c / denom) * 100);
  }, [series]);

  return (
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Insights across reports, enforcement and workers</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Status Over Time</h2>
            <div className="flex items-center gap-2">
              <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10) || 30)} className="text-sm border border-gray-300 dark:border-neutral-700 rounded-md px-2 py-1 bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200">
                <option value={7}>7d</option>
                <option value={14}>14d</option>
                <option value={30}>30d</option>
                <option value={60}>60d</option>
                <option value={90}>90d</option>
              </select>
              <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={useMock} onChange={(e) => setUseMock(e.target.checked)} />
                Mock data
              </label>
              <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm">Export</button>
            </div>
          </div>
          <div className="h-60 bg-gray-50 dark:bg-neutral-800 rounded-lg p-2 overflow-x-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">Loading...</div>
            ) : !svgData ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data</div>
            ) : (
              <svg width={svgData.width} height={svgData.height} className="[&_*]:transition-all">
                {/* Y grid & ticks */}
                {svgData.yTicks.map((t, idx) => {
                  const y = svgData.yAt(t);
                  return (
                    <g key={idx}>
                      <line x1={40} x2={svgData.width - 12} y1={y} y2={y} stroke="#e5e7eb" className="dark:stroke-neutral-700" />
                      <text x={8} y={y + 4} fontSize="10" fill="#6b7280" className="dark:fill-neutral-400">{t}</text>
                    </g>
                  );
                })}
                {/* Lines */}
                <path d={svgData.pathVerified} fill="none" stroke="#3b82f6" strokeWidth="2" />
                <path d={svgData.pathAction} fill="none" stroke="#ef4444" strokeWidth="2" />
                <path d={svgData.pathClosed} fill="none" stroke="#10b981" strokeWidth="2" />
                {/* X labels (sparse) */}
                {svgData.labels.map((label, i) =>
                  (i % Math.ceil(svgData.labels.length / 10) === 0 ? (
                    <text key={i} x={svgData.xAt(i)} y={svgData.height - 6} fontSize="10" fill="#6b7280" className="dark:fill-neutral-400" textAnchor="middle">{label}</text>
                  ) : null)
                )}
                {/* Legend */}
                <g transform="translate(50, 12)">
                  <circle r="5" fill="#3b82f6" cx="0" cy="0" />
                  <text x="10" y="4" fontSize="12" fill="#374151" className="dark:fill-neutral-300">Verified</text>
                </g>
                <g transform="translate(130, 12)">
                  <circle r="5" fill="#ef4444" cx="0" cy="0" />
                  <text x="10" y="4" fontSize="12" fill="#374151" className="dark:fill-neutral-300">Action Taken</text>
                </g>
                <g transform="translate(250, 12)">
                  <circle r="5" fill="#10b981" cx="0" cy="0" />
                  <text x="10" y="4" fontSize="12" fill="#374151" className="dark:fill-neutral-300">Closed</text>
                </g>
              </svg>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">High-Risk Areas</h2>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(highRiskAreas, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'high-risk-areas.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm"
            >
              Export
            </button>
          </div>
          <div className="h-60 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 overflow-y-auto">
            {highRiskAreas.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data</div>
            ) : (
              <div className="space-y-3">
                {highRiskAreas.map((item, idx) => {
                  const widthPct = Math.min(Math.max(item.risk, 0), 100);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-gray-800 dark:text-gray-200 truncate">{item.name}</div>
                      <div className="flex-1">
                        <div className="w-full h-3 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 dark:bg-red-600" style={{ width: `${widthPct}%` }} />
                        </div>
                      </div>
                      <div className="w-28 text-right text-sm text-gray-600 dark:text-gray-400">Risk {item.risk}% • {item.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Success Rate</h2>
          <button
            onClick={() => {
              const payload = { days, series, successRate };
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'success-rate.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Download size={16}/> Export All
          </button>
        </div>
        <div className="h-56 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          {/* Donut chart */}
          <svg width="220" height="220" viewBox="0 0 220 220">
            <g transform="translate(110,110)">
              {(() => {
                const radius = 90;
                const thickness = 22;
                const circumference = 2 * Math.PI * radius;
                const value = Math.max(0, Math.min(100, successRate));
                const dash = (value / 100) * circumference;
                const gap = circumference - dash;
                return (
                  <>
                    <circle r={radius} fill="none" stroke="#e5e7eb" className="dark:stroke-neutral-700" strokeWidth={thickness} />
                    <circle
                      r={radius}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={thickness}
                      strokeDasharray={`${dash} ${gap}`}
                      transform="rotate(-90)"
                      strokeLinecap="round"
                    />
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="fill-gray-800 dark:fill-gray-200" fontSize="28" fontWeight="700">
                      {value}%
                    </text>
                    <text x="0" y="24" textAnchor="middle" dominantBaseline="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="12">
                      Closed share
                    </text>
                  </>
                );
              })()}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
