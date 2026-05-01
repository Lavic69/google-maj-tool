export function TopBar() {
  return (
    <header className="relative z-20 border-b border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-md bg-accent grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <span className="font-mono text-[11px] font-bold tracking-tight">GU</span>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Google Update Survivor</div>
            <div className="text-[10.5px] font-mono text-mute -mt-0.5">v1.0 · build 2026.05</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[12px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ok blink" />
            <span className="font-mono">live · check-engine OK</span>
          </span>
        </div>
      </div>
    </header>
  );
}
