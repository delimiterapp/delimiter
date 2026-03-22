export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#7c3aed"/>
            <path d="M9.5 10.5h13M9.5 16h13M9.5 21.5h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Delimiter
        </a>
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/syedos/delimiter"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            GitHub
          </a>
          <a
            href="/docs"
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            Docs
          </a>
          <div className="ml-2 h-5 w-px bg-border" />
          <a
            href="/sign-in"
            className="ml-2 rounded-lg bg-text-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            Sign in
          </a>
        </div>
      </nav>
    </header>
  )
}
