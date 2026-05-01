'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  color: string;
}

export function ScoreRing({ score, color }: ScoreRingProps) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | undefined;
    const dur = 900;
    const step = (t: number) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = C - (shown / 100) * C;

  return (
    <div className="relative h-[140px] w-[140px]">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={R} stroke="#252A36" strokeWidth="10" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={R}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 60ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="tabular text-[40px] leading-none font-semibold tracking-tight">{shown}</div>
          <div className="font-mono text-[10.5px] text-mute mt-1">/ 100</div>
        </div>
      </div>
    </div>
  );
}
