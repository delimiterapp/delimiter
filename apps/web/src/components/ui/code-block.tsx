import { codeToHtml } from 'shiki'
import { CopyButton } from './copy-button'

export async function CodeBlock({
  code,
  language = 'typescript',
  filename,
}: {
  code: string
  language?: string
  filename?: string
}) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-code-bg shadow-sm">
      {filename && (
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <svg className="h-3.5 w-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-mono text-xs text-text-tertiary">{filename}</span>
        </div>
      )}
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <CopyButton text={code} />
      </div>
      <div
        className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-code-text [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
