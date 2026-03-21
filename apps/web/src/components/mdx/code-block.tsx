import type { ReactNode } from 'react'
import { codeToHtml } from 'shiki'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props: Record<string, unknown> }).props
    return extractText(props.children as ReactNode)
  }
  return ''
}

export async function CodeBlock(props: React.ComponentPropsWithoutRef<'pre'>) {
  const children = props.children
  if (!children || typeof children !== 'object' || !('props' in children)) {
    return <pre {...props} />
  }

  const childProps = (children as { props: Record<string, unknown> }).props
  const className = (childProps.className as string) || ''
  const langMatch = className.match(/language-(\w+)/)
  const language = langMatch ? langMatch[1] : 'text'
  const code = extractText(childProps.children as ReactNode).trim()

  const html = await codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border border-border bg-code-bg p-4 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function InlineCode(props: React.ComponentPropsWithoutRef<'code'>) {
  // If inside a pre (code block), don't apply inline styles
  const className = props.className || ''
  if (className.includes('language-')) {
    return <code {...props} />
  }

  return (
    <code
      {...props}
      className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-accent"
    />
  )
}
