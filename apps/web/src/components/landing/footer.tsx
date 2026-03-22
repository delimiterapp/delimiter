'use client'

import { useState } from 'react'
import { ScrambleText } from '@/components/ui/scramble-text'

export function Footer() {
  const [githubHoverKey, setGithubHoverKey] = useState(0)
  const [docsHoverKey, setDocsHoverKey] = useState(0)

  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-text-tertiary">
        <img src="/logo.png" alt="delimiter" className="h-5" />
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/syedos/delimiter"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-text-secondary"
            onMouseEnter={() => setGithubHoverKey((k) => k + 1)}
          >
            <ScrambleText
              key={githubHoverKey}
              text="GitHub"
              duration={0.4}
              skipInitialAnimation={githubHoverKey === 0}
            />
          </a>
          <a
            href="/docs"
            className="transition-colors hover:text-text-secondary"
            onMouseEnter={() => setDocsHoverKey((k) => k + 1)}
          >
            <ScrambleText
              key={docsHoverKey}
              text="Docs"
              duration={0.4}
              skipInitialAnimation={docsHoverKey === 0}
            />
          </a>
          <span>MIT licensed</span>
        </div>
      </div>
    </footer>
  )
}
