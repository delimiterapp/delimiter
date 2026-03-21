export interface NavItem {
  title: string
  href: string
}

export interface NavSection {
  title: string
  icon: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "GETTING STARTED",
    icon: "book",
    items: [
      { title: "Core Concepts", href: "/docs/getting-started/core-concepts" },
      { title: "Quick Start", href: "/docs/getting-started/quick-start" },
      { title: "Installation", href: "/docs/getting-started/installation" },
    ],
  },
  {
    title: "SDK",
    icon: "code",
    items: [
      { title: "Configuration", href: "/docs/sdk/configuration" },
      { title: "Wrapping Clients", href: "/docs/sdk/wrapping-clients" },
      { title: "Multi-App Tagging", href: "/docs/sdk/multi-app-tagging" },
      { title: "TypeScript", href: "/docs/sdk/typescript" },
    ],
  },
  {
    title: "PROVIDERS",
    icon: "server",
    items: [
      { title: "OpenAI", href: "/docs/providers/openai" },
      { title: "Anthropic", href: "/docs/providers/anthropic" },
    ],
  },
  {
    title: "DASHBOARD",
    icon: "layout",
    items: [
      { title: "Overview", href: "/docs/dashboard/overview" },
      { title: "Alerts", href: "/docs/dashboard/alerts" },
    ],
  },
  {
    title: "API REFERENCE",
    icon: "globe",
    items: [
      { title: "Report Endpoint", href: "/docs/api-reference/report-endpoint" },
    ],
  },
  {
    title: "SELF-HOSTING",
    icon: "terminal",
    items: [
      { title: "Setup", href: "/docs/self-hosting/setup" },
    ],
  },
]
