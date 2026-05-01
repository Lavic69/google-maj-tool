'use client';

import { useState } from 'react';
import { Arrow, Check, Mail, Spin } from './Icons';

interface EmailGateProps {
  domain: string;
  score: number;
  onSuccess: () => void;
  onCancel: () => void;
}

type Phase = 'idle' | 'sending' | 'done' | 'error';

export function EmailGate({ domain, score, onSuccess, onCancel }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setErr("Ton email a l’air bizarre. Re-tente.");
      return;
    }
    setErr(null);
    setPhase('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), domain, score }),
      });
      if (!res.ok) throw new Error('lead failed');
      setPhase('done');
      setTimeout(onSuccess, 800);
    } catch {
      setPhase('error');
      setErr("Une erreur est survenue. Réessaie dans 1 minute.");
    }
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-14 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-accent/40" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.18), rgba(37,99,235,0.06))' }}>
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.45), transparent)' }} />
          <div className="relative px-5 sm:px-8 py-8 sm:py-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-[11.5px] font-mono">
              📩 1 analyse de plus
            </div>

            <h2 className="mt-3 text-[24px] sm:text-[30px] font-semibold tracking-tight max-w-[28ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
              Tu veux analyser un autre site ? Donne-moi ton email.
            </h2>
            <p className="mt-2 text-[14.5px] text-white/75 max-w-[44ch]">
              On te débloque une analyse de plus. Pas de spam. Pas de séquence à 12 mails.
            </p>

            {phase !== 'done' ? (
              <form onSubmit={submit} className="mt-6">
                <div className={'flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border ' + (err ? 'border-bad/60' : 'border-accent/50') + ' bg-ink/60 p-2'}>
                  <div className="flex items-center gap-2 px-3 sm:flex-1">
                    <Mail className="h-4 w-4 text-mute shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (err) setErr(null);
                      }}
                      placeholder="ton@email.com"
                      className="focus-ring w-full bg-transparent py-3 text-[15.5px] placeholder:text-mute2 text-white outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={phase === 'sending'}
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-accent hover:bg-accent2 active:scale-[0.99] disabled:opacity-70 transition px-4 py-3 sm:py-2.5 font-semibold text-[14.5px]"
                  >
                    {phase === 'sending' ? (
                      <><Spin className="h-4 w-4 spin" /> envoi…</>
                    ) : (
                      <>Débloquer une analyse <Arrow className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
                {err && <div className="mt-2 font-mono text-[12.5px] text-bad">{err}</div>}
              </form>
            ) : (
              <div className="mt-6 risein rounded-xl border border-ok/40 bg-ok/10 p-4 sm:p-5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-ok/20 text-ok grid place-items-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[15.5px] font-semibold tracking-tight">C’est parti.</div>
                  <div className="mt-0.5 text-[13.5px] text-white/75">On te redirige…</div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <button
                type="button"
                onClick={onCancel}
                className="text-[13px] font-mono text-mute hover:text-white underline-offset-4 hover:underline"
              >
                ← retour au verdict
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
