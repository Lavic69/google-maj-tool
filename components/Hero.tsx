'use client';

import { useRef, useState } from 'react';
import { AXES } from '@/lib/verdict-mock';
import { normalizeUrl } from '@/lib/url-normalize';
import { Arrow, Globe, Spark } from './Icons';

interface HeroProps {
  onSubmit: (u: URL) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

export function Hero({ onSubmit, error, setError }: HeroProps) {
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    const u = normalizeUrl(val);
    if (!u) {
      setError("Hmm, cette URL n’a pas l’air bonne. Essaie : tonsite.com");
      return;
    }
    setError(null);
    onSubmit(u);
  };

  return (
    <section className="relative bg-grid noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-24 pb-16 sm:pb-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-ink2/60 backdrop-blur px-3 py-1 text-[11.5px] font-mono text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>diagnostic · sans inscription · 30s</span>
        </div>

        <h1 className="mt-5 sm:mt-7 text-[34px] leading-[1.05] sm:text-[64px] sm:leading-[1.02] font-semibold tracking-[-0.02em] max-w-[18ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
          Ton site survivra-t-il au prochain <span className="text-accent">Google Update</span> ?
        </h1>

        <p className="mt-4 sm:mt-6 text-[16px] sm:text-[20px] text-mute max-w-[44ch]">
          30 secondes. 4 critères. Un verdict honnête.
        </p>

        <form id="diag-form" onSubmit={submit} className="mt-7 sm:mt-10 max-w-2xl">
          <div className={'group relative flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl border ' + (error ? 'border-bad/60' : 'border-line2') + ' bg-ink2/80 backdrop-blur p-2'}>
            <div className="flex items-center gap-2 px-3 sm:px-3 sm:flex-1">
              <Globe className="h-4 w-4 text-mute shrink-0" />
              <input
                ref={inputRef}
                value={val}
                onChange={(e) => {
                  setVal(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="tonsite.com"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                className="focus-ring w-full bg-transparent py-3 text-[16px] sm:text-[17px] placeholder:text-mute2 text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent2 active:scale-[0.99] transition px-5 py-3.5 sm:py-3 font-semibold text-[15px] tracking-tight"
            >
              Analyser mon site
              <Arrow className="h-4 w-4" />
            </button>
          </div>
          {error && <div className="mt-2 text-[13px] text-bad font-mono">{error}</div>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-mono text-mute">
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-mute" /> aucun login</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-mute" /> on ne stocke pas l’URL</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-mute" /> 100% gratuit</span>
          </div>
        </form>

        <div className="mt-12 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AXES.map((a, i) => (
            <div key={a.key} className="rounded-xl border border-line bg-ink2/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-mute">0{i + 1}</span>
                <Spark className="h-3.5 w-3.5 text-mute2" />
              </div>
              <div className="mt-2 text-[14.5px] font-semibold tracking-tight">{a.label}</div>
              <div className="mt-1 text-[12.5px] text-mute leading-snug">{a.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
