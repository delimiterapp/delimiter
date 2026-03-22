export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-1.5">
          <svg width="10" height="14" viewBox="0 0 32 40" fill="none">
            <path d="M22 0H12L0 40h10L22 0z" fill="currentColor"/>
          </svg>
          <span>Delimiter</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/syedos/delimiter"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-text-secondary"
          >
            GitHub
          </a>
          <a href="/docs" className="transition-colors hover:text-text-secondary">
            Docs
          </a>
          <span>MIT licensed</span>
        </div>
      </div>
    </footer>
  )
}
