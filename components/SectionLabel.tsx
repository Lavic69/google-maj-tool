interface SectionLabelProps {
  n: string;
  children: React.ReactNode;
}

export function SectionLabel({ n, children }: SectionLabelProps) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11.5px] text-mute uppercase tracking-[0.14em]">
      <span className="text-accent">§ {n}</span>
      <span className="h-px w-8 bg-line2" />
      <span>{children}</span>
    </div>
  );
}
