export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-sm text-text-secondary">
        <span>MIT open source</span>
        <span aria-hidden="true">&middot;</span>
        <a
          href="https://github.com/syedos/delimiter"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-text-primary"
        >
          GitHub
        </a>
        <span aria-hidden="true">&middot;</span>
        <span>delimiter.app</span>
      </div>
    </footer>
  )
}
