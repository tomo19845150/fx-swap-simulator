import React, { useState, useEffect, useRef } from 'react';

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export const SpiderSVG = ({ size = 30 }) => (
  <svg viewBox="0 0 80 80" width={size} height={size}>
    <g>
      {/* 脚 左 */}
      <path d="M36,40 C28,32 16,26 8,20" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      <path d="M36,42 C26,38 14,36 4,34" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      <path d="M36,44 C26,44 14,48 4,52" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      <path d="M36,46 C28,50 18,58 10,66" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      {/* 脚 右 */}
      <path d="M44,40 C52,32 64,26 72,20" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      <path d="M44,42 C54,38 66,36 76,34" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      <path d="M44,44 C54,44 66,48 76,52" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      <path d="M44,46 C52,50 62,58 70,66" fill="none" stroke="#aa4444" strokeWidth="1.2" />
      {/* 頭 */}
      <ellipse cx="40" cy="32" rx="7" ry="6" fill="#552222" />
      <circle cx="37" cy="30" r="1.5" fill="#ff4444" opacity="0.9" />
      <circle cx="43" cy="30" r="1.5" fill="#ff4444" opacity="0.9" />
      {/* 腹 */}
      <ellipse cx="40" cy="46" rx="10" ry="12" fill="#441111" />
      <path d="M34,42 L40,50 L46,42" fill="none" stroke="#aa3333" strokeWidth="0.6" />
      <path d="M33,48 L40,54 L47,48" fill="none" stroke="#aa3333" strokeWidth="0.5" />
    </g>
  </svg>
);

export function SpiderWeb({ x, y, radius, growDuration, caughtInsects, onExpire }) {
  const [size, setSize] = useState(radius * 0.3);
  const maxSize = radius;

  useEffect(() => {
    const totalMs = Math.max(180000, Math.min(900000, (growDuration || 30000) / 60 * 1000));
    const steps = Math.max(6, Math.round(totalMs / 30000));
    let step = 0;

    const grow = () => {
      step++;
      const p = Math.min(step / steps, 1);
      setSize(maxSize * (0.3 + 0.7 * p));
    };

    grow();
    const iv = setInterval(() => {
      if (step >= steps) { clearInterval(iv); return; }
      grow();
    }, 30000);

    const expire = setTimeout(() => onExpire?.(), 10800000);
    return () => { clearInterval(iv); clearTimeout(expire); };
  }, []);

  const lines = 12;
  const rings = 6;
  const s = size;

  return (
    <div style={{
      position: 'fixed', left: `${x}vw`, top: `${y}vh`,
      transform: 'translate(-50%, -50%)',
      zIndex: 9990, pointerEvents: 'none',
      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6)) drop-shadow(0 0 10px rgba(255,255,255,0.3))',
    }}>
      <svg viewBox="-110 -110 220 220" width={s * 2} height={s * 2} style={{ opacity: 0.6 }}>
        {Array.from({ length: lines }, (_, i) => {
          const angle = (i / lines) * Math.PI * 2;
          return <line key={`l${i}`} x1="0" y1="0"
            x2={Math.cos(angle) * 100} y2={Math.sin(angle) * 100}
            stroke="#ffffff" strokeWidth="0.8" />;
        })}
        {Array.from({ length: rings }, (_, i) => {
          const r = ((i + 1) / rings) * 100;
          const points = Array.from({ length: lines }, (_, j) => {
            const angle = (j / lines) * Math.PI * 2;
            return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
          }).join(' ');
          return <polygon key={`r${i}`} points={points}
            fill="none" stroke="#ffffff" strokeWidth="0.5" />;
        })}
      </svg>
      {caughtInsects.map(insect => (
        <div key={insect.id} className="caught-insect" style={{
          position: 'absolute',
          left: `${50 + insect.offsetX}%`,
          top: `${50 + insect.offsetY}%`,
          opacity: insect.opacity,
          transform: 'translate(-50%,-50%) scale(0.7)',
          transition: 'opacity 2s',
        }}>
          {insect.type === 'butterfly' ? '🦋' : '🐝'}
        </div>
      ))}
    </div>
  );
}

export default function FlyingSpider({ webPos, onWebBuilt, onDone, spiderId, posRegistry = {} }) {
  const ref = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef({ x: rand(40, 60), y: 5 });
  const targetRef = useRef({ x: rand(15, 85), y: rand(20, 80) });
  const phaseRef = useRef('wandering');
  const wanderTimer = useRef(0);
  const wanderChangeTimer = useRef(0);
  const webBuiltRef = useRef(false);
  const onWebBuiltRef = useRef(onWebBuilt);
  onWebBuiltRef.current = onWebBuilt;

  const getOthers = () => {
    return Object.entries(posRegistry)
      .filter(([id]) => String(id) !== String(spiderId))
      .map(([, pos]) => pos);
  };

  const flee = () => {
    if (phaseRef.current === 'settled') return;
    targetRef.current = { x: rand(10, 90), y: rand(15, 85) };
  };

  useEffect(() => {
    if (!ref.current) return;
    let alive = true;
    const el = ref.current;
    const speedMultiplier = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
    const speed = 0.012 * speedMultiplier;
    const wanderStartTime = Date.now();
    const wanderMs = 120000;

    phaseRef.current = 'wandering';
    webBuiltRef.current = false;
    wanderChangeTimer.current = 0;

    const tick = () => {
      if (!alive) return;
      const pos = posRef.current;
      const target = targetRef.current;

      posRegistry[spiderId] = { x: pos.x, y: pos.y };

      if (phaseRef.current === 'wandering') {
        wanderChangeTimer.current++;

        const others = getOthers();

        if (wanderChangeTimer.current > rand(200, 500)) {
          wanderChangeTimer.current = 0;

          let bestX = rand(10, 90), bestY = rand(15, 85), bestDist = 0;
          for (let attempt = 0; attempt < 10; attempt++) {
            const cx = rand(10, 90), cy = rand(15, 85);
            let minDist = Infinity;
            for (const o of others) {
              const d = Math.sqrt((cx - o.x) ** 2 + (cy - o.y) ** 2);
              if (d < minDist) minDist = d;
            }
            if (others.length === 0) minDist = 100;
            if (minDist > bestDist) {
              bestDist = minDist;
              bestX = cx;
              bestY = cy;
            }
          }

          targetRef.current = { x: bestX, y: bestY };
        }

        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.3) {
          const wobbleX = Math.sin(Date.now() / 400) * 0.08;
          const wobbleY = Math.sin(Date.now() / 350) * 0.04;
          pos.x += (dx / dist) * speed + wobbleX * speed;
          pos.y += (dy / dist) * speed + wobbleY * speed;
        }

        for (const other of others) {
          const odx = pos.x - other.x;
          const ody = pos.y - other.y;
          const odist = Math.sqrt(odx * odx + ody * ody);
          if (odist < 20 && odist > 0) {
            pos.x += (odx / odist) * 0.04;
            pos.y += (ody / odist) * 0.04;
          }
        }

        pos.x = Math.max(5, Math.min(95, pos.x));
        pos.y = Math.max(10, Math.min(90, pos.y));

        if (Date.now() - wanderStartTime >= wanderMs) {
          if (!webBuiltRef.current) {
            webBuiltRef.current = true;
            phaseRef.current = 'settled';
            const webRadius = rand(80, 320);
            const growDuration = Math.floor(rand(10800, 54000));
            const cb = onWebBuiltRef.current;
            if (cb) {
              cb({ x: pos.x, y: pos.y, radius: webRadius, growDuration });
            }
          } else {
            phaseRef.current = 'settled';
          }
        }
      } else {
        const wobble = Math.sin(Date.now() / 2000) * 0.3;
        pos.x += wobble * 0.002;
      }

      el.style.left = pos.x + 'vw';
      el.style.top = pos.y + 'vh';

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { alive = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="flying-spider" ref={ref}
      onClick={flee} onDoubleClick={() => { delete posRegistry[spiderId]; onDone?.(); }}
      style={{ position: 'fixed', zIndex: 9991, cursor: 'pointer' }}>
      <SpiderSVG size={35} />
    </div>
  );
}
