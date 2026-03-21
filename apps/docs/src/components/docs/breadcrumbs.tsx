export function Breadcrumbs({ section, page }: { section: string; page: string }) {
  return (
    <div className="mb-8 font-mono text-xs uppercase tracking-widest text-text-secondary">
      {section} / {page}
    </div>
  )
}
