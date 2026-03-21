export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="/" className="text-lg font-semibold tracking-tight">
          ◈ Delimiter
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/docs"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Docs
          </a>
          <a
            href="/sign-in"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            Sign in
          </a>
        </div>
      </nav>
    </header>
  )
}
