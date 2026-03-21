'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll('main h2, main h3')
    ) as HTMLElement[]

    const items = elements.map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))

    setHeadings(items)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="hidden xl:block">
      <div className="sticky top-16 h-[calc(100vh-64px)] w-56 overflow-y-auto px-4 py-8">
        <h4 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-text-primary">
          On this page
        </h4>
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block py-1 text-sm transition-colors ${
                  heading.level === 3 ? 'pl-3' : ''
                } ${
                  activeId === heading.id
                    ? 'font-medium text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
