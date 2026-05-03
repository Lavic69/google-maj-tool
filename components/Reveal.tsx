'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  threshold = 0.15,
  once = true,
}: RevealProps) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold, once]);

  const cls = revealed ? 'risein ' + className : 'opacity-0 ' + className;

  return (
    <div
      ref={ref}
      className={cls.trim()}
      style={{ animationDelay: delay + 'ms' }}
    >
      {children}
    </div>
  );
}
