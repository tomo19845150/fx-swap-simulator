import React, { useState, useEffect } from 'react';

export default function AnalogClock({ size = 40 }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const s = time.getSeconds();
  const m = time.getMinutes();
  const h = time.getHours() % 12;

  const secAngle = s * 6;
  const minAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  const hand = (angle, length, width, color, glow) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    const x2 = cx + length * Math.cos(rad);
    const y2 = cy + length * Math.sin(rad);
    return (
      <line
        x1={cx} y1={cy} x2={x2} y2={y2}
        stroke={color} strokeWidth={width} strokeLinecap="round"
        style={glow ? { filter: `drop-shadow(0 0 ${glow}px ${color})` } : undefined}
      />
    );
  };

  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const angle = ((i * 30 - 90) * Math.PI) / 180;
    const isMain = i % 3 === 0;
    const innerR = isMain ? r * 0.75 : r * 0.85;
    ticks.push(
      <line
        key={i}
        x1={cx + innerR * Math.cos(angle)}
        y1={cy + innerR * Math.sin(angle)}
        x2={cx + r * 0.92 * Math.cos(angle)}
        y2={cy + r * 0.92 * Math.sin(angle)}
        stroke={isMain ? 'rgba(0, 200, 255, 0.7)' : 'rgba(0, 200, 255, 0.3)'}
        strokeWidth={isMain ? 1.5 : 0.5}
      />
    );
  }

  return (
    <svg width={size} height={size} className="analog-clock">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00aaff" strokeWidth={1.5}
        style={{ filter: 'drop-shadow(0 0 3px #00aaff)' }} />
      {ticks}
      {hand(hourAngle, r * 0.5, 2.5, '#00ccff', 3)}
      {hand(minAngle, r * 0.7, 1.5, '#00ccff', 2)}
      {hand(secAngle, r * 0.8, 0.5, '#ffffff', 2)}
      <circle cx={cx} cy={cy} r={1.5} fill="#ffffff"
        style={{ filter: 'drop-shadow(0 0 2px #00ccff)' }} />
    </svg>
  );
}
