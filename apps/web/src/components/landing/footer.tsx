export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#7c3aed"/>
            <path d="M9.5 10.5h13M9.5 16h13M9.5 21.5h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
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
