import type { ReactNode } from 'react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function getTextContent(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(getTextContent).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as { props: Record<string, unknown> }).props
    return getTextContent(props.children as ReactNode)
  }
  return ''
}

function Heading({
  as: Tag,
  className,
  children,
}: {
  as: 'h1' | 'h2' | 'h3' | 'h4'
  className: string
  children?: ReactNode
}) {
  const text = getTextContent(children)
  const id = slugify(text)

  return (
    <Tag id={id} className={`group relative ${className}`}>
      {children}
      {Tag !== 'h1' && (
        <a
          href={`#${id}`}
          className="ml-2 text-text-tertiary opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
          aria-label={`Link to ${text}`}
        >
          #
        </a>
      )}
    </Tag>
  )
}

export function H1({ children }: { children?: ReactNode }) {
  return (
    <Heading as="h1" className="mb-6 mt-2 text-4xl font-bold tracking-tight">
      {children}
    </Heading>
  )
}

export function H2({ children }: { children?: ReactNode }) {
  return (
    <Heading as="h2" className="mb-4 mt-12 border-b border-border pb-2 text-2xl font-bold tracking-tight">
      {children}
    </Heading>
  )
}

export function H3({ children }: { children?: ReactNode }) {
  return (
    <Heading as="h3" className="mb-3 mt-8 text-xl font-semibold">
      {children}
    </Heading>
  )
}

export function H4({ children }: { children?: ReactNode }) {
  return (
    <Heading as="h4" className="mb-2 mt-6 text-lg font-semibold">
      {children}
    </Heading>
  )
}
