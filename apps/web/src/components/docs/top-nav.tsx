export function TopNav() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-white">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-6">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-1.5">
          <svg width="14" height="18" viewBox="0 0 32 40" fill="none">
            <path d="M22 0H12L0 40h10L22 0z" fill="currentColor"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            Delimiter
          </span>
        </a>

        {/* Center: Documentation tab */}
        <nav className="flex h-full items-center">
          <a
            href="/docs"
            className="flex h-full items-center border-b-2 border-accent px-4 text-sm font-medium text-text-primary"
          >
            Documentation
          </a>
        </nav>

        {/* Right: Search + Dashboard */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="h-9 w-[300px] rounded-lg border border-border bg-white pl-10 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 text-xs text-text-tertiary">
              /
            </span>
          </div>
          <a
            href="#"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-text-primary hover:bg-surface"
          >
            Dashboard
            <svg
              className="h-3.5 w-3.5 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
