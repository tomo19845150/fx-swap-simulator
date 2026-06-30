import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis, ReferenceArea, ReferenceLine } from 'recharts';
import { getMarketBands } from './marketHours';
import { getCurrencyFlags } from './currencyFlags';
import { getCompanyLogo } from './companyLogos';

function FlagPair({ flags }) {
  return (
    <span className="flag-pair">
      {flags.baseUrl && <img src={flags.baseUrl} alt="" className="flag-img" />}
      {flags.quoteUrl && <img src={flags.quoteUrl} alt="" className="flag-img" />}
    </span>
  );
}

function StockIcon({ symbol }) {
  const logoUrl = getCompanyLogo(symbol);
  if (!logoUrl) return null;
  return (
    <img
      src={logoUrl}
      alt=""
      className="company-logo"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

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

const PERIODS = ['5m', '60m', '1D', '3D', '1W', '1M', '1Y'];
const BARS = ['5m', '15m', '1h', '4h', '1D', '1W'];

function getDefaultPeriod(symbol) {
  return '3D';
}

export default function StockCard({ stock, onRemove, onExpand }) {
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState(() => getDefaultPeriod(stock?.symbol));
  const [chartMode, setChartMode] = useState('period');
  const [loadingChart, setLoadingChart] = useState(false);
  const mouseDownPos = React.useRef(null);

  const handleMouseDown = (e) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e) => {
    if (!mouseDownPos.current) return;
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    if (dx > 5 || dy > 5) return;
    onExpand?.(stock);
  };

  useEffect(() => {
    if (!stock || stock.error || !stock.price) return;
    setLoadingChart(true);
    fetchHistory(stock.symbol, period, chartMode)
      .then(setHistory)
      .finally(() => setLoadingChart(false));
  }, [stock?.symbol, stock?.price, period, chartMode]);

  if (!stock) return <div className="stock-card loading">読み込み中...</div>;
  if (stock.error) return <div className="stock-card error">取得エラー</div>;
  if (!stock.price) return <div className="stock-card loading">読み込み中...</div>;

  const isUp = stock.change >= 0;
  const sign = isUp ? '+' : '-';
  const colorClass = isUp ? 'up' : 'down';
  const downAlert = !isUp && Math.abs(stock.changePercent || 0) > 3;
  const chartColor = isUp ? '#0044cc' : downAlert ? '#ff0022' : '#cc33aa';
  const flags = getCurrencyFlags(stock.symbol);
  const logo = getCompanyLogo(stock.symbol);
  const absPercent = Math.min(Math.abs(stock.changePercent || 0), 10);
  const intensity = absPercent / 10 * 0.8;
  const isVolatile = absPercent > 0;

  let cardStyle;
  if (isVolatile && absPercent > 2) {
    if (!isUp) {
      cardStyle = {
        borderColor: `rgba(255, 0, 0, ${Math.min(intensity + 0.2, 0.8)})`,
        boxShadow: `0 0 ${absPercent * 3}px rgba(255, 0, 0, ${intensity * 0.4}), inset 0 0 ${absPercent * 2}px rgba(255, 0, 0, ${intensity * 0.15})`,
      };
    } else {
      cardStyle = {
        borderColor: `rgba(0, 200, 255, ${Math.min(intensity + 0.2, 0.8)})`,
        boxShadow: `0 0 ${absPercent * 3}px rgba(0, 200, 255, ${intensity * 0.4}), inset 0 0 ${absPercent * 2}px rgba(0, 255, 136, ${intensity * 0.15})`,
      };
    }
  }

  return (
    <div
      className={`stock-card ${colorClass}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={cardStyle}
    >
      {isVolatile && !isUp && (
        <div className="drop-overlay" style={{
          background: `linear-gradient(135deg,
            rgba(255, 0, 0, ${intensity}) 0%,
            rgba(200, 0, 60, ${intensity * 0.8}) 30%,
            rgba(150, 0, 80, ${intensity * 0.6}) 60%,
            rgba(80, 0, 40, ${intensity * 0.4}) 100%)`,
          boxShadow: absPercent > 3 ? `inset 0 0 ${absPercent * 4}px rgba(255, 0, 0, ${intensity * 0.5})` : 'none',
        }} />
      )}
      {isVolatile && isUp && (
        <div className="drop-overlay" style={{
          background: `linear-gradient(135deg,
            rgba(0, 200, 255, ${intensity * 0.7}) 0%,
            rgba(0, 150, 200, ${intensity * 0.5}) 30%,
            rgba(0, 100, 180, ${intensity * 0.3}) 60%,
            rgba(0, 60, 120, ${intensity * 0.2}) 100%)`,
          boxShadow: absPercent > 3 ? `inset 0 0 ${absPercent * 4}px rgba(0, 200, 255, ${intensity * 0.4})` : 'none',
        }} />
      )}
      <div className="card-top">
        <div className="stock-header">
          <span className="stock-name">
            {logo ? <StockIcon symbol={stock.symbol} /> : flags ? <FlagPair flags={flags} /> : null}
            {stock.name}
          </span>
          <div className="stock-header-actions">
            <button className="expand-btn" onClick={(e) => { e.stopPropagation(); onExpand?.(stock); }} title="拡大表示">⤢</button>
            <button className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(stock.symbol); }} title="削除">×</button>
          </div>
        </div>
      </div>

      <div className="card-bottom">
        <div className="period-selector">
          <button
            className={`mode-toggle ${chartMode === 'period' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setChartMode(chartMode === 'period' ? 'bar' : 'period'); setPeriod(chartMode === 'period' ? '5m' : getDefaultPeriod(stock?.symbol)); }}
          >
            {chartMode === 'period' ? '期間' : '足'}
          </button>
          {(chartMode === 'period' ? PERIODS : BARS).map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setPeriod(p); }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="stock-price-row">
          <div className="stock-price">
            {stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`stock-change ${colorClass}`}>
            <span>{sign}{Math.abs(stock.change)?.toFixed(2)}</span>
            <span className={`stock-percent ${!isUp && Math.abs(stock.changePercent) > 3 ? 'alert' : ''}`}>({sign}{Math.abs(stock.changePercent)?.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div className="chart-area">
        {loadingChart ? (
          <div className="chart-loading">チャート読込中...</div>
        ) : history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history.map((d) => ({ ...d, ts: new Date(d.date).getTime() }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={downAlert ? 0.6 : 0.3} />
                  <stop offset="50%" stopColor={downAlert ? '#aa0000' : chartColor} stopOpacity={downAlert ? 0.3 : 0.1} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.02} />
                </linearGradient>
                <filter id={`glow-${stock.symbol}`}>
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feFlood floodColor={chartColor} floodOpacity="0.8" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <XAxis dataKey="ts" type="number" domain={['dataMin', 'dataMax']} hide />
              <YAxis domain={([dataMin, dataMax]) => {
                const range = dataMax - dataMin || 1;
                const pad = range * 0.15;
                return [dataMin - pad, dataMax + pad];
              }} hide />
              {history.length > 0 && (() => {
                const closes = history.map(d => d.close).filter(Boolean);
                const high = Math.max(...closes);
                const low = Math.min(...closes);
                const current = closes[closes.length - 1];
                const fmt = (v) => v >= 10000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
                return (
                  <>
                    <ReferenceLine y={history[0].close} stroke="rgba(255, 255, 255, 0.8)" strokeWidth={2.5} label={{ value: fmt(history[0].close), position: 'right', fontSize: 8, fill: 'rgba(255,255,255,0.8)', dx: -4 }} />
                    <ReferenceLine y={high} stroke="rgba(255, 220, 0, 0.4)" strokeWidth={0.5} label={{ value: fmt(high), position: 'right', fontSize: 8, fill: 'rgba(255,220,0,0.6)', dx: -4 }} />
                    <ReferenceLine y={current} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={0.5} strokeDasharray="2 2" label={{ value: fmt(current), position: 'right', fontSize: 9, fill: '#ffffff', fontWeight: 700, dx: -4 }} />
                    <ReferenceLine y={current} stroke="none" label={{ value: fmt(current), position: 'left', fontSize: 9, fill: '#ffffff', fontWeight: 700, dx: 4 }} />
                    <ReferenceLine y={low} stroke="rgba(255, 220, 0, 0.4)" strokeWidth={0.5} label={{ value: fmt(low), position: 'right', fontSize: 8, fill: 'rgba(255,220,0,0.6)', dx: -4 }} />
                  </>
                );
              })()}
              {getMarketBands(stock.symbol, history).map((band, idx) => (
                <ReferenceArea key={idx} x1={band.x1} x2={band.x2} fill="#ffdd00" fillOpacity={0.15} />
              ))}
              <Tooltip
                contentStyle={{ background: '#1a2634', border: '1px solid #3a4a5a', borderRadius: 6, fontSize: 12 }}
                labelFormatter={(ts) => {
                  if (ts) return new Date(ts).toLocaleString('ja-JP');
                  return '';
                }}
                formatter={(value) => [value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), '終値']}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={4}
                fill={`url(#grad-${stock.symbol})`}
                dot={false}
                activeDot={false}
                filter={`url(#glow-${stock.symbol})`}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#ffffff"
                strokeWidth={1.5}
                fill="none"
                dot={(props) => {
                  const { cx, cy, index, payload } = props;
                  if (index !== history.length - 1) return null;
                  const v = payload.close;
                  const label = v >= 10000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
                  return (
                    <g key="last-dot">
                      <circle cx={cx} cy={cy} r={3} fill="#fff" stroke={chartColor} strokeWidth={1.5} />
                      <text x={cx} y={cy - 7} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={700}
                        style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>{label}</text>
                    </g>
                  );
                }}
                activeDot={{ r: 4, fill: '#fff', stroke: chartColor, strokeWidth: 2 }}
                strokeOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-loading">データなし</div>
        )}
      </div>

    </div>
  );
}
