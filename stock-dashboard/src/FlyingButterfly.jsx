import React, { useState, useEffect, useRef } from 'react';

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FlyingButterfly({ onDone, webTraps = [], flowers = [], onSipStart, onSipEnd }) {
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
        await new Promise(r => setTimeout(r, rand(800, 2500)));
        if (!alive) break;
        const n = Math.floor(rand(5, 14));
        const spd = rand(80, 150);
        for (let i = 0; i < n; i++) {
          if (!alive) break;
          wingRef.current = 0.2;
          setWingOpen(0.2);
          await new Promise(r => setTimeout(r, spd));
          wingRef.current = 1;
          setWingOpen(1);
          await new Promise(r => setTimeout(r, spd * 0.6));
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
    let wx = 0, wy = 0, twx = rand(-0.04, 0.04), twy = rand(-0.04, 0.04);
    let wt = 0, hover = false, ht = 0, hd = 0;
    const px = rand(0, 100), py = rand(0, 100);
    let fleeVx = 0, fleeVy = 0;
    const startTime = Date.now();
    let lastSipTime = Date.now();
    const maxLifeMs = 3 * 60 * 60 * 1000;

    fleeRef.current = () => {
      fleeVx = rand(-0.4, 0.4);
      fleeVy = rand(-0.4, 0.4);
      if (Math.abs(fleeVx) < 0.15) fleeVx = fleeVx < 0 ? -0.3 : 0.3;
      if (Math.abs(fleeVy) < 0.15) fleeVy = fleeVy < 0 ? -0.3 : 0.3;
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
          twx = rand(-0.06, 0.06);
          twy = rand(-0.06, 0.06);
          el.style.left = x + 'vw';
          el.style.top = y + 'vh';
        } else {
          el.style.opacity = Math.max(0.1, 1 - lifeProgress);
          const glow = 8 + Math.sin(t * 0.05) * 4;
          el.style.filter = `drop-shadow(0 0 ${glow}px rgba(130,220,255,0.7)) drop-shadow(0 0 ${glow * 2}px rgba(100,200,255,0.4))`;
          el.style.transform = `rotate(${Math.sin(t * 0.01) * 3}deg)`;
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
            x = f.x - 1.5 + rand(-0.2, 0.2);
            y = f.y - 1.5 + rand(-0.2, 0.2);
            sipFlowerId = f.id;
            onSipStartRef.current?.(f.id);
            el.style.left = x + 'vw';
            el.style.top = y + 'vh';
            break;
          }
        }
      }

      if (wt > rand(100, 350)) {
        wt = 0;
        twx = rand(-0.06, 0.06); twy = rand(-0.06, 0.06);

        if (Math.random() < 0.15) {
          twx = rand(-0.1, 0.1); twy = rand(-0.1, 0.1);
        }

        if (Math.random() < 0.2 && !hover) {
          hover = true; hd = rand(120, 350); ht = 0;
          twx = rand(-0.005, 0.005); twy = rand(-0.005, 0.005);
        }
      }
      if (hover && ++ht > hd) { hover = false; twx = rand(-0.06, 0.06); twy = rand(-0.06, 0.06); }
      wx += (twx - wx) * 0.008;
      wy += (twy - wy) * 0.008;

      fleeVx *= 0.985;
      fleeVy *= 0.985;

      const w = wingRef.current;
      if (w < 0.5 && prevW >= 0.5) {
        bounce = rand(-0.06, 0.04);
      }
      prevW = w;
      bounce *= 0.92;

      const dx = Math.sin(px + t * 0.003) * 0.008 + Math.sin(px + t * 0.007) * 0.005
                + Math.cos(px + t * 0.0043) * 0.004;
      const dy = Math.sin(py + t * 0.0025) * 0.01 + Math.sin(py + t * 0.006) * 0.005
                + Math.cos(py + t * 0.0037) * 0.004;

      const vx = wx + dx + fleeVx;
      const vy = wy + dy + bounce + fleeVy;
      x += vx; y += vy;

      if (x < 2) { x = 2; twx = Math.abs(twx); fleeVx = Math.abs(fleeVx) * 0.5; }
      if (x > 95) { x = 95; twx = -Math.abs(twx); fleeVx = -Math.abs(fleeVx) * 0.5; }
      if (y < 3) { y = 3; twy = Math.abs(twy); fleeVy = Math.abs(fleeVy) * 0.5; }
      if (y > 90) { y = 90; twy = -Math.abs(twy); fleeVy = -Math.abs(fleeVy) * 0.5; }

      const tilt = (vy + fleeVy) * 25 + Math.sin(t * 0.004) * 2;
      el.style.left = x + 'vw';
      el.style.top = y + 'vh';
      el.style.transform = `rotate(${tilt}deg)`;

      for (const wt of webTrapsRef.current) {
        const wdx = x - wt.x;
        const wdy = y - wt.y;
        const webR = wt.radius / 12;
        if (wdx * wdx + wdy * wdy < webR * webR) {
          wt.onCaught?.('butterfly');
          onDoneRef.current?.();
          return;
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { alive = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const w = wingOpen;

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    x: rand(5, 115), y: rand(5, 125),
    r: rand(0.5, 1.5), delay: rand(0, 5), dur: rand(1.5, 3),
  }));

  return (
    <div className="flying-butterfly" ref={ref} onClick={() => fleeRef.current?.()} onDoubleClick={() => onDone?.()}>
      <svg viewBox="0 0 120 130" width="80" height="87">
        <defs>
          <linearGradient id="fbWing" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#eeffff" />
            <stop offset="25%" stopColor="#aaf0ff" />
            <stop offset="50%" stopColor="#66ddff" />
            <stop offset="80%" stopColor="#44ccee" />
            <stop offset="100%" stopColor="#33aabb" />
          </linearGradient>
          <radialGradient id="fbHL" cx="0.4" cy="0.35" r="0.55">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="fbSp">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feFlood floodColor="#fff" floodOpacity="0.7" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {sparkles.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" filter="url(#fbSp)">
            <animate attributeName="opacity" values="0;0.8;0" dur={s.dur + 's'} begin={s.delay + 's'} repeatCount="indefinite" />
          </circle>
        ))}

        {/* 左上翅 */}
        <path d={`M56,50 C${56 - 6 * w},${50 - 12 * w} ${56 - 18 * w * 1.1},${50 - 32 * w} ${56 - 32 * w * 1.1},${50 - 42 * w}
          C${56 - 46 * w},${50 - 48 * w} ${56 - 54 * w},${50 - 40 * w} ${56 - 54 * w},${50 - 30 * w}
          C${56 - 54 * w},${50 - 16 * w} ${56 - 44 * w},${50 - 6 * w} ${56 - 34 * w},${50 - 2 * w}
          C${56 - 20 * w},${50 + 2 * w} 56,50 56,50Z`}
          fill="url(#fbWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
        <path d={`M56,50 C${56 - 6 * w},${50 - 12 * w} ${56 - 18 * w * 1.1},${50 - 32 * w} ${56 - 32 * w * 1.1},${50 - 42 * w}
          C${56 - 46 * w},${50 - 48 * w} ${56 - 54 * w},${50 - 40 * w} ${56 - 54 * w},${50 - 30 * w}
          C${56 - 54 * w},${50 - 16 * w} ${56 - 44 * w},${50 - 6 * w} ${56 - 34 * w},${50 - 2 * w}
          C${56 - 20 * w},${50 + 2 * w} 56,50 56,50Z`}
          fill="url(#fbHL)" />
        {/* 右上翅 */}
        <path d={`M64,50 C${64 + 6 * w},${50 - 12 * w} ${64 + 18 * w * 1.1},${50 - 32 * w} ${64 + 32 * w * 1.1},${50 - 42 * w}
          C${64 + 46 * w},${50 - 48 * w} ${64 + 54 * w},${50 - 40 * w} ${64 + 54 * w},${50 - 30 * w}
          C${64 + 54 * w},${50 - 16 * w} ${64 + 44 * w},${50 - 6 * w} ${64 + 34 * w},${50 - 2 * w}
          C${64 + 20 * w},${50 + 2 * w} 64,50 64,50Z`}
          fill="url(#fbWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
        <path d={`M64,50 C${64 + 6 * w},${50 - 12 * w} ${64 + 18 * w * 1.1},${50 - 32 * w} ${64 + 32 * w * 1.1},${50 - 42 * w}
          C${64 + 46 * w},${50 - 48 * w} ${64 + 54 * w},${50 - 40 * w} ${64 + 54 * w},${50 - 30 * w}
          C${64 + 54 * w},${50 - 16 * w} ${64 + 44 * w},${50 - 6 * w} ${64 + 34 * w},${50 - 2 * w}
          C${64 + 20 * w},${50 + 2 * w} 64,50 64,50Z`}
          fill="url(#fbHL)" />
        {/* 左下翅 */}
        <path d={`M56,54 C${56 - 12 * w},${54 + 4 * w} ${56 - 28 * w},${54 + 12 * w} ${56 - 38 * w},${54 + 24 * w}
          C${56 - 44 * w},${54 + 34 * w} ${56 - 44 * w},${54 + 42 * w} ${56 - 40 * w},${54 + 42 * w}
          C${56 - 34 * w},${54 + 40 * w} ${56 - 20 * w},${54 + 28 * w} ${56 - 10 * w},${54 + 14 * w} Z`}
          fill="url(#fbWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
        {/* 左尾 */}
        <path d={`M${56 - 38 * w},${54 + 24 * w} C${56 - 42 * w},${54 + 34 * w} ${56 - 44 * w},${54 + 50 * w} ${56 - 40 * w},${54 + 56 * w}
          C${56 - 38 * w},${54 + 58 * w} ${56 - 36 * w},${54 + 52 * w} ${56 - 36 * w},${54 + 44 * w}`}
          fill="url(#fbWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
        {/* 右下翅 */}
        <path d={`M64,54 C${64 + 12 * w},${54 + 4 * w} ${64 + 28 * w},${54 + 12 * w} ${64 + 38 * w},${54 + 24 * w}
          C${64 + 44 * w},${54 + 34 * w} ${64 + 44 * w},${54 + 42 * w} ${64 + 40 * w},${54 + 42 * w}
          C${64 + 34 * w},${54 + 40 * w} ${64 + 20 * w},${54 + 28 * w} ${64 + 10 * w},${54 + 14 * w} Z`}
          fill="url(#fbWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
        {/* 右尾 */}
        <path d={`M${64 + 38 * w},${54 + 24 * w} C${64 + 42 * w},${54 + 34 * w} ${64 + 44 * w},${54 + 50 * w} ${64 + 40 * w},${54 + 56 * w}
          C${64 + 38 * w},${54 + 58 * w} ${64 + 36 * w},${54 + 52 * w} ${64 + 36 * w},${54 + 44 * w}`}
          fill="url(#fbWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
        {/* 翅脈 */}
        <path d={`M56,50 L${56 - 40 * w},${50 - 30 * w}`} fill="none" stroke="#0a2030" strokeWidth="0.4" opacity="0.3" />
        <path d={`M56,50 L${56 - 48 * w},${50 - 18 * w}`} fill="none" stroke="#0a2030" strokeWidth="0.3" opacity="0.2" />
        <path d={`M64,50 L${64 + 40 * w},${50 - 30 * w}`} fill="none" stroke="#0a2030" strokeWidth="0.4" opacity="0.3" />
        <path d={`M64,50 L${64 + 48 * w},${50 - 18 * w}`} fill="none" stroke="#0a2030" strokeWidth="0.3" opacity="0.2" />
        {/* 胴体 */}
        <ellipse cx="60" cy="54" rx="2.5" ry="12" fill="#0a2030" />
        {/* 触角 */}
        <path d="M58,43 C54,34 48,26 44,20" fill="none" stroke="#0a2030" strokeWidth="0.5" />
        <path d="M62,43 C66,34 72,26 76,20" fill="none" stroke="#0a2030" strokeWidth="0.5" />
        <circle cx="44" cy="20" r="1.2" fill="#0a2030" />
        <circle cx="76" cy="20" r="1.2" fill="#0a2030" />
      </svg>
    </div>
  );
}
