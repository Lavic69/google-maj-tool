export function Footer() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        <div className="font-mono text-[11.5px] text-mute">
          Build by <span className="text-white">MV Agency</span> ·{' '}
          <a href="https://mvagency.ai" className="ulink hover:text-white">mvagency.ai</a>
        </div>
        <div className="font-mono text-[11.5px] text-mute hidden sm:block">© 2026 · made for survivors</div>
      </div>
    </footer>
  );
}
