'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Hero } from '@/components/Hero';
import { Loader } from '@/components/Loader';
import { Result } from '@/components/Result';
import { EmailGate } from '@/components/EmailGate';
import { LimitReached } from '@/components/LimitReached';
import { Footer } from '@/components/Footer';
import { CarnageSection } from '@/components/landing/CarnageSection';
import { ExplainerSection } from '@/components/landing/ExplainerSection';
import { ReasonsSection } from '@/components/landing/ReasonsSection';
import { ToolExplainSection } from '@/components/landing/ToolExplainSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ForWhoSection } from '@/components/landing/ForWhoSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import type { UsageCookie, Verdict } from '@/lib/types';
import { readUsage, recordAnalysis, markEmailProvided } from '@/lib/usage-cookie';

type Phase = 'idle' | 'loading' | 'result' | 'emailGate' | 'limitReached';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [url, setUrl] = useState<URL | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setUsage] = useState<UsageCookie>({ count: 0, emailProvided: false, domains: [] });

  useEffect(() => {
    setUsage(readUsage());
  }, []);

  const start = async (u: URL) => {
    setUrl(u);
    setPhase('loading');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u.toString() }),
      });
      if (!res.ok) throw new Error('analyze failed');
      const data: Verdict = await res.json();
      setVerdict(data);
      const next = recordAnalysis(u.hostname);
      setUsage(next);
      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      setError("Le scan a échoué. Réessaie dans 1 minute.");
      setPhase('idle');
    }
  };

  const handleRestart = () => {
    const current = readUsage();
    if (current.count >= 2) {
      setPhase('limitReached');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    if (current.count === 1 && !current.emailProvided) {
      setPhase('emailGate');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    setUrl(null);
    setVerdict(null);
    setPhase('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmailUnlock = () => {
    const next = markEmailProvided();
    setUsage(next);
    setUrl(null);
    setVerdict(null);
    setPhase('idle');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleEmailCancel = () => {
    if (verdict && url) {
      setPhase('result');
    } else {
      setPhase('idle');
    }
  };

  const handleBackHome = () => {
    setUrl(null);
    setVerdict(null);
    setPhase('idle');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">
        {phase === 'idle' && (
          <>
            <Hero onSubmit={start} error={error} setError={setError} />
            <CarnageSection />
            <ExplainerSection />
            <ReasonsSection />
            <ToolExplainSection />
            <HowItWorksSection />
            <ForWhoSection />
            <FAQSection />
            <FinalCTA />
          </>
        )}
        {phase === 'loading' && url && <Loader url={url} onDone={() => { /* finish handled in start() */ }} />}
        {phase === 'result' && url && verdict && <Result url={url} verdict={verdict} onRestart={handleRestart} />}
        {phase === 'emailGate' && url && verdict && (
          <EmailGate
            domain={url.hostname}
            score={verdict.score}
            onSuccess={handleEmailUnlock}
            onCancel={handleEmailCancel}
          />
        )}
        {phase === 'limitReached' && <LimitReached onBackHome={handleBackHome} />}
      </main>
      <Footer />
    </div>
  );
}
