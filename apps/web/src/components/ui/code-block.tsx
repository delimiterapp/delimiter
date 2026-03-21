import { codeToHtml } from 'shiki'
import { CopyButton } from './copy-button'

export async function CodeBlock({
  code,
  language = 'typescript',
}: {
  code: string
  language?: string
}) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div className="group relative rounded-lg border border-white/10 bg-code-bg">
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
