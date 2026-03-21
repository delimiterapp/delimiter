import type { ReactNode } from 'react'

const styles = {
  info: {
    container: 'border-l-4 border-blue-500 bg-blue-50',
    title: 'text-blue-700',
    label: 'Note',
  },
  warning: {
    container: 'border-l-4 border-yellow-500 bg-yellow-50',
    title: 'text-yellow-700',
    label: 'Warning',
  },
  tip: {
    container: 'border-l-4 border-green-500 bg-green-50',
    title: 'text-green-700',
    label: 'Tip',
  },
}

export function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip'
  children: ReactNode
}) {
  const style = styles[type]

  return (
    <div className={`my-6 rounded-lg p-4 ${style.container}`}>
      <p className={`mb-1 font-semibold ${style.title}`}>{style.label}</p>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  )
}
