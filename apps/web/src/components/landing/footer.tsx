export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-0.5 font-black">
          <svg width="8" height="12" viewBox="0 0 32 44" fill="none">
            <path d="M24 0H14L0 44h10L24 0z" fill="currentColor"/>
          </svg>
          <span>delimiter</span>
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
