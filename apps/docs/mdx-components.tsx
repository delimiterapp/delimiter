import type { MDXComponents } from 'mdx/types'
import { H1, H2, H3, H4 } from '@/components/mdx/heading'
import { CodeBlock, InlineCode } from '@/components/mdx/code-block'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/mdx/table'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    pre: CodeBlock,
    code: InlineCode,
    table: Table,
    thead: Thead,
    tbody: Tbody,
    tr: Tr,
    th: Th,
    td: Td,
    a: (props) => (
      <a
        {...props}
        className="text-accent underline underline-offset-2 hover:text-accent-hover"
      />
    ),
    ...components,
  }
}
