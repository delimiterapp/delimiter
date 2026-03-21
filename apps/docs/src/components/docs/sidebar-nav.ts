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
      { title: "Core Concepts", href: "/getting-started/core-concepts" },
      { title: "Quick Start", href: "/getting-started/quick-start" },
      { title: "Installation", href: "/getting-started/installation" },
    ],
  },
  {
    title: "SDK",
    icon: "code",
    items: [
      { title: "Configuration", href: "/sdk/configuration" },
      { title: "Wrapping Clients", href: "/sdk/wrapping-clients" },
      { title: "Multi-App Tagging", href: "/sdk/multi-app-tagging" },
      { title: "TypeScript", href: "/sdk/typescript" },
    ],
  },
  {
    title: "PROVIDERS",
    icon: "server",
    items: [
      { title: "OpenAI", href: "/providers/openai" },
      { title: "Anthropic", href: "/providers/anthropic" },
    ],
  },
  {
    title: "DASHBOARD",
    icon: "layout",
    items: [
      { title: "Overview", href: "/dashboard/overview" },
      { title: "Alerts", href: "/dashboard/alerts" },
    ],
  },
  {
    title: "API REFERENCE",
    icon: "globe",
    items: [
      { title: "Report Endpoint", href: "/api-reference/report-endpoint" },
    ],
  },
  {
    title: "SELF-HOSTING",
    icon: "terminal",
    items: [
      { title: "Setup", href: "/self-hosting/setup" },
    ],
  },
]
