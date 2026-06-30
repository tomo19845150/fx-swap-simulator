import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, ComposedChart,
} from 'recharts';
import { getCurrencyFlags } from './currencyFlags';
import { getCompanyLogo } from './companyLogos';

async function fetchHistory(symbol, period, mode) {
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, period, mode }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

const PERIODS = ['5m', '60m', '1D', '3D', '1W', '1M', '1Y', '3Y', '5Y', '10Y'];
const BARS = ['5m', '15m', '1h', '4h', '1D', '1W'];
const CHART_TYPES = [
  { key: 'area', label: 'エリア' },
  { key: 'candle', label: 'OHLC' },
  { key: 'volume', label: '出来高' },
];

function formatDate(dateStr, period) {
  const d = new Date(dateStr);
  if (period === '5m' || period === '60m') {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (period === '1D') {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (period === '3D') {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (period === '3Y' || period === '5Y' || period === '10Y') {
    return `${d.getFullYear()}/${d.getMonth() + 1}`;
  }
  if (period === '1Y') {
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatPrice(value) {
  if (value == null) return '';
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CandleBar(props) {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const { open, close, high, low } = payload;
  if (open == null || close == null) return null;

  const isUp = close >= open;
  const color = isUp ? '#4caf50' : '#f44336';
  const yScale = props.yScale || ((v) => y);

  const bodyTop = yScale(Math.max(open, close));
  const bodyBottom = yScale(Math.min(open, close));
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
  const wickTop = yScale(high);
  const wickBottom = yScale(low);
  const centerX = x + width / 2;

  return (
    <g>
      <line x1={centerX} y1={wickTop} x2={centerX} y2={wickBottom} stroke={color} strokeWidth={1} />
      <rect x={x + 1} y={bodyTop} width={Math.max(width - 2, 2)} height={bodyHeight} fill={color} />
    </g>
  );
}

export default function StockDetail({ stock, onClose }) {
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('3D');
  const [chartMode, setChartMode] = useState('period');
  const [chartType, setChartType] = useState('area');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHistory(stock.symbol, period, chartMode)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [stock.symbol, period, chartMode]);

  const isUp = stock.change >= 0;
  const chartColor = isUp ? '#00aaff' : '#cc33aa';
  const flags = getCurrencyFlags(stock.symbol);
  const logoUrl = getCompanyLogo(stock.symbol);

  const stats = history.length > 0 ? {
    high: Math.max(...history.map((d) => d.high).filter(Boolean)),
    low: Math.min(...history.map((d) => d.low).filter(Boolean)),
    avgVolume: Math.round(history.reduce((s, d) => s + (d.volume || 0), 0) / history.length),
  } : null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div>
            <h2>{logoUrl ? <img src={logoUrl} alt="" className="company-logo logo-lg" onError={(e) => { e.target.style.display = 'none'; }} /> : flags ? <span className="flag-pair">{flags.baseUrl && <img src={flags.baseUrl} alt="" className="flag-img flag-lg" />}{flags.quoteUrl && <img src={flags.quoteUrl} alt="" className="flag-img flag-lg" />}</span> : null} {stock.name}</h2>
            <span className="detail-symbol">{stock.symbol}</span>
          </div>
          <div className="detail-price-area">
            <span className="detail-price">{formatPrice(stock.price)}</span>
            <span className={`detail-change ${isUp ? 'up' : 'down'}`}>
              {isUp ? '▲' : '▼'} {formatPrice(Math.abs(stock.change))} ({stock.changePercent?.toFixed(2)}%)
            </span>
            {history.length > 0 && (() => {
              const firstClose = history[0].close;
              const lastClose = history[history.length - 1].close;
              const pctChange = ((lastClose - firstClose) / firstClose) * 100;
              const pctUp = pctChange >= 0;
              return (
                <span className="detail-period-change">
                  <span className="detail-open-price">始値: {formatPrice(firstClose)}</span>
                  <span className="detail-close-price">終値: {formatPrice(lastClose)}</span>
                  <span className={`detail-pct ${pctUp ? 'up' : 'down'}`}>
                    {pctUp ? '▲' : '▼'} {pctUp ? '+' : ''}{pctChange.toFixed(2)}%
                  </span>
                </span>
              );
            })()}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="detail-controls">
          <div className="detail-periods">
            <button
              className="detail-period-btn mode-toggle active"
              onClick={() => { setChartMode(chartMode === 'period' ? 'bar' : 'period'); setPeriod(chartMode === 'period' ? '5m' : '3D'); }}
            >
              {chartMode === 'period' ? '期間' : '足'}
            </button>
            {(chartMode === 'period' ? PERIODS : BARS).map((p) => (
              <button
                key={p}
                className={`detail-period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="detail-chart-types">
            {CHART_TYPES.map((t) => (
              <button
                key={t.key}
                className={`detail-period-btn ${chartType === t.key ? 'active' : ''}`}
                onClick={() => setChartType(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-chart">
          {loading ? (
            <div className="chart-loading">読み込み中...</div>
          ) : history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'volume' ? (
                <BarChart data={history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3040" />
                  <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, period)} stroke="#546e7a" fontSize={11} />
                  <YAxis stroke="#546e7a" fontSize={11} tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
                  <Tooltip
                    contentStyle={{ background: '#1a2634', border: '1px solid #3a4a5a', borderRadius: 6, fontSize: 12 }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? new Date(payload[0].payload.date).toLocaleDateString('ja-JP') : ''}
                    formatter={(value) => [(value || 0).toLocaleString(), '出来高']}
                  />
                  <Bar dataKey="volume" fill="#4fc3f7" opacity={0.6} />
                </BarChart>
              ) : (
                <AreaChart data={history} margin={{ top: 10, right: 5, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0.02} />
                    </linearGradient>
                    <filter id="detailGlow">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor={chartColor} floodOpacity="0.8" result="color" />
                      <feComposite in="color" in2="blur" operator="in" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid horizontal={true} vertical={false} stroke="#3a5060" />
                  <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, period)} stroke="#546e7a" fontSize={11} axisLine={{ stroke: '#546e7a' }} />
                  <XAxis xAxisId="top" orientation="top" tick={false} axisLine={{ stroke: '#546e7a' }} tickLine={false} />
                  <YAxis domain={([dataMin, dataMax]) => {
                    const range = dataMax - dataMin || 1;
                    const pad = range * 0.15;
                    return [dataMin - pad, dataMax + pad];
                  }} stroke="#546e7a" fontSize={11} tickFormatter={formatPrice} axisLine={{ stroke: '#546e7a' }} />
                  <YAxis yAxisId="right" orientation="right" domain={([dataMin, dataMax]) => {
                    const range = dataMax - dataMin || 1;
                    const pad = range * 0.15;
                    return [dataMin - pad, dataMax + pad];
                  }} stroke="#546e7a" fontSize={10} tick={{ fill: '#aaccdd' }} tickFormatter={formatPrice} mirror={true} axisLine={{ stroke: '#546e7a' }} />
                  <Tooltip
                    contentStyle={{ background: '#1a2634', border: '1px solid #3a4a5a', borderRadius: 6, fontSize: 12 }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? new Date(payload[0].payload.date).toLocaleDateString('ja-JP') : ''}
                    formatter={(value) => [formatPrice(value), '終値']}
                  />
                  <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2.5} fill="url(#detailGrad)" dot={(() => {
                    const closes = history.map(d => d.close).filter(Boolean);
                    const highVal = Math.max(...closes);
                    const lowVal = Math.min(...closes);
                    const highIdx = history.findIndex(d => d.close === highVal);
                    const lowIdx = history.findIndex(d => d.close === lowVal);
                    const fmt = (v) => v >= 10000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
                    const range = highVal - lowVal || 1;
                    const threshold = range * 0.08;
                    const peakSet = new Set();
                    const w = 3;
                    for (let i = w; i < history.length - w; i++) {
                      if (i === highIdx || i === lowIdx) continue;
                      const c = history[i].close;
                      let isPeak = true, isValley = true;
                      for (let j = 1; j <= w; j++) {
                        if (history[i - j].close >= c || history[i + j].close >= c) isPeak = false;
                        if (history[i - j].close <= c || history[i + j].close <= c) isValley = false;
                      }
                      if (isPeak) {
                        const leftMin = Math.min(...history.slice(Math.max(0, i - w * 2), i).map(d => d.close));
                        const rightMin = Math.min(...history.slice(i + 1, Math.min(history.length, i + w * 2 + 1)).map(d => d.close));
                        if (c - Math.max(leftMin, rightMin) > threshold) peakSet.add(i);
                      }
                      if (isValley) {
                        const leftMax = Math.max(...history.slice(Math.max(0, i - w * 2), i).map(d => d.close));
                        const rightMax = Math.max(...history.slice(i + 1, Math.min(history.length, i + w * 2 + 1)).map(d => d.close));
                        if (Math.min(leftMax, rightMax) - c > threshold) peakSet.add(i);
                      }
                    }
                    const fmtDate = (dateStr) => {
                      const d = new Date(dateStr);
                      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
                    };
                    return (props) => {
                      const { cx, cy, index } = props;
                      const isFirst = index === 0;
                      const isLast = index === history.length - 1;
                      if (isFirst || isLast) {
                        const v = props.payload.close;
                        const dateLabel = fmtDate(props.payload.date);
                        return (
                          <g key={isFirst ? 'first-dot' : 'last-dot'}>
                            <circle cx={cx} cy={cy} r={4} fill="#fff" stroke={chartColor} strokeWidth={2} />
                            <text x={cx} y={cy + (isFirst ? 18 : -18)} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={8}
                              style={{ textShadow: '0 0 3px rgba(0,0,0,0.9)' }}>{dateLabel}</text>
                            {isLast && (
                              <text x={cx} y={cy - 9} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={700}
                                style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>{fmt(v)}</text>
                            )}
                          </g>
                        );
                      }
                      if (index === highIdx) {
                        return (
                          <g key="high-dot">
                            <circle cx={cx} cy={cy} r={2.5} fill="#ffdd00" stroke="#ffaa00" strokeWidth={1} />
                            <text x={cx} y={cy - 6} textAnchor="middle" fill="#ffdd00" fontSize={9} fontWeight={600}
                              style={{ textShadow: '0 0 3px rgba(0,0,0,0.9)' }}>{fmt(highVal)}</text>
                          </g>
                        );
                      }
                      if (index === lowIdx) {
                        return (
                          <g key="low-dot">
                            <circle cx={cx} cy={cy} r={2.5} fill="#ff5577" stroke="#cc3355" strokeWidth={1} />
                            <text x={cx} y={cy + 13} textAnchor="middle" fill="#ff5577" fontSize={9} fontWeight={600}
                              style={{ textShadow: '0 0 3px rgba(0,0,0,0.9)' }}>{fmt(lowVal)}</text>
                          </g>
                        );
                      }
                      if (peakSet.has(index)) {
                        const v = props.payload.close;
                        const isPeakUp = history[index].close > history[index - 1].close;
                        return (
                          <g key={`peak-${index}`}>
                            <circle cx={cx} cy={cy} r={2} fill="#fff" strokeWidth={0} />
                            <text x={cx} y={isPeakUp ? cy - 6 : cy + 12} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={600}
                              style={{ textShadow: '0 0 3px rgba(0,0,0,0.9)' }}>{fmt(v)}</text>
                          </g>
                        );
                      }
                      return null;
                    };
                  })()} activeDot={{ r: 5, fill: '#fff', stroke: chartColor, strokeWidth: 2 }} filter="url(#detailGlow)" />
                  <Area yAxisId="right" type="monotone" dataKey="close" stroke="none" fill="none" dot={false} activeDot={false} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="chart-loading">データなし</div>
          )}
        </div>

        {stats && (
          <div className="detail-stats">
            <div className="stat-item">
              <span className="stat-label">期間高値</span>
              <span className="stat-value">{formatPrice(stats.high)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">期間安値</span>
              <span className="stat-value">{formatPrice(stats.low)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">平均出来高</span>
              <span className="stat-value">{stats.avgVolume?.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
