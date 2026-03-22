export function Breadcrumbs({ section, page }: { section: string; page: string }) {
  return (
    <div className="mb-8 text-xs text-text-tertiary">
      {section} / {page}
    </div>
  )
}
