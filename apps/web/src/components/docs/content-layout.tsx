import { Breadcrumbs } from './breadcrumbs'
import { PageNav } from './page-nav'
import { TableOfContents } from './table-of-contents'

export function ContentLayout({
  section,
  page,
  children,
}: {
  section: string
  page: string
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <div className="mx-auto max-w-3xl flex-1 px-8 py-8">
        <Breadcrumbs section={section} page={page} />
        <article className="prose prose-neutral max-w-none">
          {children}
        </article>
        <PageNav />
      </div>
      <TableOfContents />
    </div>
  )
}
