import type { ReactNode } from 'react'

export function Table({ children }: { children?: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }: { children?: ReactNode }) {
  return (
    <thead className="border-b-2 border-border text-left font-mono text-xs uppercase tracking-wider text-text-secondary">
      {children}
    </thead>
  )
}

export function Tbody({ children }: { children?: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function Tr({ children }: { children?: ReactNode }) {
  return <tr className="hover:bg-surface">{children}</tr>
}

export function Th({ children }: { children?: ReactNode }) {
  return <th className="px-4 py-3">{children}</th>
}

export function Td({ children }: { children?: ReactNode }) {
  return <td className="border-b border-border-light px-4 py-3">{children}</td>
}
