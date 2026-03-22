export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-text-tertiary">
        <img src="/logo.png" alt="delimiter" className="h-5" />
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/syedos/delimiter"
            target="_blank"
            rel="noopener noreferrer"
            className="shine-hover-light rounded px-1 py-0.5 transition-colors hover:text-text-secondary"
          >
            GitHub
          </a>
          <a
            href="/docs"
            className="shine-hover-light rounded px-1 py-0.5 transition-colors hover:text-text-secondary"
          >
            Docs
          </a>
          <span>MIT licensed</span>
        </div>
      </div>
    </footer>
  )
}
