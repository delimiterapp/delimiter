const items = [
  'Never touches your API keys — you create your client, we just wrap it',
  'Never modifies requests or responses — your calls work identically',
  'Never adds latency — reporting is async, fire-and-forget',
  'Never fails loudly — if we\'re down, your app doesn\'t notice',
]

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-red/60"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function TrustSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          What it never does
        </h2>
        <div className="mt-12 space-y-5">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-4">
              <XIcon />
              <p className="text-lg">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
