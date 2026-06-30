import React, { useState, useEffect, useRef } from 'react';

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

const BeeSVG = ({ wingOpen = 1, size = 80 }) => {
  const wo = wingOpen;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <radialGradient id="beeWing" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ccddff" stopOpacity="0.2" />
        </radialGradient>
        <filter id="beeGlow">
          <feGaussianBlur stdDeviation="1" result="b" />
          <feFlood floodColor="#ffdd44" floodOpacity="0.3" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 左翅 */}
      <ellipse cx={48 - 12 * wo} cy={40 - 14 * wo} rx={10 * wo} ry={16 * wo}
        fill="url(#beeWing)" stroke="rgba(200,220,255,0.35)" strokeWidth="0.3"
        transform={`rotate(${-20 * wo}, ${48 - 12 * wo}, ${40 - 14 * wo})`} />
      {/* 右翅 */}
      <ellipse cx={52 + 12 * wo} cy={40 - 14 * wo} rx={10 * wo} ry={16 * wo}
        fill="url(#beeWing)" stroke="rgba(200,220,255,0.35)" strokeWidth="0.3"
        transform={`rotate(${20 * wo}, ${52 + 12 * wo}, ${40 - 14 * wo})`} />

      <g filter="url(#beeGlow)">
        {/* 頭 */}
        <ellipse cx="50" cy="32" rx="7" ry="6" fill="#1a1a00" />
        <circle cx="46" cy="30" r="1.5" fill="#222200" stroke="#ffee88" strokeWidth="0.3" />
        <circle cx="54" cy="30" r="1.5" fill="#222200" stroke="#ffee88" strokeWidth="0.3" />
        {/* 触角 */}
        <path d="M47,27 C44,20 40,16 38,14" fill="none" stroke="#1a1a00" strokeWidth="0.6" />
        <path d="M53,27 C56,20 60,16 62,14" fill="none" stroke="#1a1a00" strokeWidth="0.6" />
        <circle cx="38" cy="14" r="1" fill="#1a1a00" />
        <circle cx="62" cy="14" r="1" fill="#1a1a00" />

        {/* 胸部 */}
        <ellipse cx="50" cy="42" rx="9" ry="7" fill="#2a2000" />
        <ellipse cx="50" cy="42" rx="7" ry="5" fill="#3a3000" />

        {/* 腹部 - 黄黒縞 */}
        <ellipse cx="50" cy="60" rx="11" ry="16" fill="#ffcc00" />
        <path d="M39,54 C42,52 58,52 61,54" fill="none" stroke="#1a1400" strokeWidth="3" />
        <path d="M39,60 C42,58 58,58 61,60" fill="none" stroke="#1a1400" strokeWidth="3" />
        <path d="M40,66 C43,64 57,64 60,66" fill="none" stroke="#1a1400" strokeWidth="2.5" />
        <path d="M42,72 C45,70 55,70 58,72" fill="none" stroke="#1a1400" strokeWidth="2" />

        {/* 針 */}
        <path d="M50,76 L50,82" stroke="#1a1400" strokeWidth="0.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default function FlyingBee({ onDone, webTraps = [], flowers = [], onSipStart, onSipEnd }) {
  const ref = useRef(null);
  const animRef = useRef(null);
  const [wingOpen, setWingOpen] = useState(1);
  const wingRef = useRef(1);
  const fleeRef = useRef(null);
  const webTrapsRef = useRef(webTraps);
  const flowersRef = useRef(flowers);
  const onDoneRef = useRef(onDone);
  webTrapsRef.current = webTraps;
  flowersRef.current = flowers;
  onDoneRef.current = onDone;
  const onSipStartRef = useRef(onSipStart);
  const onSipEndRef = useRef(onSipEnd);
  onSipStartRef.current = onSipStart;
  onSipEndRef.current = onSipEnd;

  useEffect(() => {
    let alive = true;
    const flapLoop = async () => {
      while (alive) {
        await new Promise(r => setTimeout(r, rand(300, 800)));
        if (!alive) break;
        const n = Math.floor(rand(8, 20));
        const spd = rand(30, 60);
        for (let i = 0; i < n; i++) {
          if (!alive) break;
          wingRef.current = 0.3;
          setWingOpen(0.3);
          await new Promise(r => setTimeout(r, spd));
          wingRef.current = 1;
          setWingOpen(1);
          await new Promise(r => setTimeout(r, spd * 0.5));
        }
      }
    };
    flapLoop();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let alive = true;
    let x = rand(10, 90), y = rand(10, 80), t = 0;
    let sipping = false, sipTimer = 0, sipFlowerId = null;
    const sipDuration = 5400;
    let bounce = 0, prevW = 1;
    const startTime = Date.now();
    let lastSipTime = Date.now();
    const maxLifeMs = 3 * 60 * 60 * 1000;
    let wx = 0, wy = 0, twx = rand(-0.05, 0.05), twy = rand(-0.05, 0.05);
    let wt = 0, hover = false, ht = 0, hd = 0;
    const px = rand(0, 100), py = rand(0, 100);
    let fleeVx = 0, fleeVy = 0;

    fleeRef.current = () => {
      fleeVx = rand(-0.5, 0.5);
      fleeVy = rand(-0.5, 0.5);
      if (Math.abs(fleeVx) < 0.2) fleeVx = fleeVx < 0 ? -0.35 : 0.35;
      if (Math.abs(fleeVy) < 0.2) fleeVy = fleeVy < 0 ? -0.35 : 0.35;
    };

    const tick = () => {
      if (!alive) return;
      t++; wt++;

      const now = Date.now();
      const timeSinceLastSip = now - lastSipTime;
      const lifeProgress = Math.min(timeSinceLastSip / maxLifeMs, 1);

      if (sipping) {
        sipTimer++;
        if (sipTimer >= sipDuration) {
          sipping = false;
          sipTimer = 0;
          lastSipTime = Date.now();
          el.style.filter = '';
          onSipEndRef.current?.(sipFlowerId);
          sipFlowerId = null;
          x += rand(-8, 8);
          y += rand(-8, 8);
          twx = rand(-0.05, 0.05);
          twy = rand(-0.05, 0.05);
          el.style.left = x + 'vw';
          el.style.top = y + 'vh';
        } else {
          el.style.opacity = Math.max(0.1, 1 - lifeProgress);
          const glow = 6 + Math.sin(t * 0.06) * 3;
          el.style.filter = `drop-shadow(0 0 ${glow}px rgba(255,220,50,0.7)) drop-shadow(0 0 ${glow * 2}px rgba(255,200,0,0.4))`;
          el.style.transform = `rotate(${Math.sin(t * 0.015) * 5}deg)`;
          animRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      const opacity = Math.max(0.05, 1 - lifeProgress);
      el.style.opacity = opacity;

      if (lifeProgress >= 1) { onDoneRef.current?.(); return; }

      if (!sipping && flowersRef.current.length > 0) {
        for (const f of flowersRef.current) {
          const fdx = x - f.x;
          const fdy = y - f.y;
          if (fdx * fdx + fdy * fdy < 2) {
            sipping = true;
            sipTimer = 0;
            sipFlowerId = f.id;
            onSipStartRef.current?.(f.id);
            x = f.x - 1.5 + rand(-0.2, 0.2);
            y = f.y - 1.5 + rand(-0.2, 0.2);
            el.style.left = x + 'vw';
            el.style.top = y + 'vh';
            break;
          }
        }
      }

      if (wt > rand(80, 300)) {
        wt = 0;
        twx = rand(-0.05, 0.05); twy = rand(-0.05, 0.05);

        if (Math.random() < 0.2) {
          twx = rand(-0.1, 0.1); twy = rand(-0.1, 0.1);
        }

        if (Math.random() < 0.15 && !hover) {
          hover = true; hd = rand(80, 250); ht = 0;
          twx = rand(-0.005, 0.005); twy = rand(-0.005, 0.005);
        }
      }
      if (hover && ++ht > hd) { hover = false; twx = rand(-0.05, 0.05); twy = rand(-0.05, 0.05); }
      wx += (twx - wx) * 0.007;
      wy += (twy - wy) * 0.007;

      fleeVx *= 0.985;
      fleeVy *= 0.985;

      const w = wingRef.current;
      if (w < 0.5 && prevW >= 0.5) {
        bounce = rand(-0.04, 0.03);
      }
      prevW = w;
      bounce *= 0.94;

      const dx = Math.sin(px + t * 0.004) * 0.007 + Math.sin(px + t * 0.011) * 0.005
                + Math.cos(px + t * 0.006) * 0.003;
      const dy = Math.sin(py + t * 0.003) * 0.008 + Math.sin(py + t * 0.009) * 0.005
                + Math.cos(py + t * 0.005) * 0.003;

      const vx = wx + dx + fleeVx;
      const vy = wy + dy + bounce + fleeVy;
      x += vx; y += vy;

      if (x < 2) { x = 2; twx = Math.abs(twx); fleeVx = Math.abs(fleeVx) * 0.5; }
      if (x > 95) { x = 95; twx = -Math.abs(twx); fleeVx = -Math.abs(fleeVx) * 0.5; }
      if (y < 3) { y = 3; twy = Math.abs(twy); fleeVy = Math.abs(fleeVy) * 0.5; }
      if (y > 90) { y = 90; twy = -Math.abs(twy); fleeVy = -Math.abs(fleeVy) * 0.5; }

      const tilt = (vy + fleeVy) * 20;
      el.style.left = x + 'vw';
      el.style.top = y + 'vh';
      el.style.transform = `rotate(${tilt}deg)`;

      for (const wt of webTrapsRef.current) {
        const wdx = x - wt.x;
        const wdy = y - wt.y;
        const webR = wt.radius / 12;
        if (wdx * wdx + wdy * wdy < webR * webR) {
          wt.onCaught?.('bee');
          onDoneRef.current?.();
          return;
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { alive = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="flying-bee" ref={ref} onClick={() => fleeRef.current?.()} onDoubleClick={() => onDone?.()}>
      <BeeSVG wingOpen={wingOpen} size={55} />
    </div>
  );
}

export { BeeSVG };
