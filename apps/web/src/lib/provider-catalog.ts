export type ProviderCapability =
  | 'spend'
  | 'usage'
  | 'configured_limits'
  | 'balance'
  | 'models'

export type ProviderCategory = 'ai' | 'financial' | 'voice' | 'search' | 'infra'

export const PROVIDER_CATEGORIES: { id: ProviderCategory; label: string }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'voice', label: 'Voice' },
  { id: 'financial', label: 'Financial' },
  { id: 'search', label: 'Search' },
  { id: 'infra', label: 'Infra' },
]

export function categoryLabel(category: ProviderCategory): string {
  return PROVIDER_CATEGORIES.find((c) => c.id === category)?.label ?? category
}

export type ProviderCatalogItem = {
  id: string
  name: string
  shortName: string
  categories: ProviderCategory[]
  keyType: string
  keyHint: string
  capabilities: ProviderCapability[]
  accent: string
  bg: string
  description: string
  setupSteps: string[]
  securityNote: string
  tokenCredits?: boolean
  statusNote?: string
  iamPolicy?: string
}

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OA',
    categories: ['ai'],
    tokenCredits: true,
    keyType: 'Admin API key',
    keyHint: 'Create an Admin API key in OpenAI organization settings.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#111827',
    bg: '#f4f4f5',
    description: 'Sync organization costs, usage by project/key/model, and configured project rate limits.',
    setupSteps: [
      'Open OpenAI organization settings and create an Admin API key.',
      'Use a key dedicated to Delimiter so it can be rotated independently.',
      'Paste the key here. Delimiter encrypts it and uses it only for monitoring APIs.',
    ],
    securityNote: 'OpenAI Admin keys are powerful. Delimiter never uses them for model requests, key creation, or account changes.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    shortName: 'An',
    categories: ['ai'],
    tokenCredits: true,
    keyType: 'Admin API key',
    keyHint: 'Create an Admin API key in Claude Console organization settings.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#d97706',
    bg: '#fff7ed',
    description: 'Sync usage, costs, workspace/model breakdowns, and configured org/workspace rate limits.',
    setupSteps: [
      'Open Claude Console and go to organization settings.',
      'Create an Admin API key for Usage, Cost, and Rate Limits APIs.',
      'Paste the key here. Delimiter encrypts it and polls Anthropic reporting endpoints.',
    ],
    securityNote: 'Anthropic Admin keys are required for reporting APIs. Use a dedicated key and delete it anytime.',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    shortName: 'G',
    categories: ['ai'],
    tokenCredits: true,
    keyType: 'Google AI / Vertex credential',
    keyHint: 'Use a Gemini API key or a Google Cloud credential with billing/usage visibility.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#2563eb',
    bg: '#eff6ff',
    description: 'Track Gemini/Vertex spend, usage, model breakdowns, and published quota limits.',
    setupSteps: [
      'Use a dedicated Google AI Studio key or a Google Cloud credential scoped to billing/usage reporting.',
      'For Vertex AI, prefer a service account with read-only Billing/Monitoring permissions.',
      'Paste the credential here. Full Gemini polling is staged behind this connection.',
    ],
    securityNote: 'Google support is included in the connection model now; deep billing sync requires a read-only Google Cloud billing integration.',
    statusNote: 'Initial connection stores the credential securely. Full Gemini billing sync is next.',
  },
  {
    id: 'bedrock',
    name: 'AWS Bedrock',
    shortName: 'AWS',
    categories: ['ai'],
    tokenCredits: true,
    keyType: 'Read-only IAM credential JSON',
    keyHint: 'Dedicated read-only credential scoped to Bedrock spend, models, and quotas. Never use root keys.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#ff9900',
    bg: '#fff7ed',
    description: 'Track Bedrock-only spend via Cost Explorer, model invocation metrics from CloudWatch, Bedrock quota limits, available models, and account budget.',
    setupSteps: [
      'In AWS IAM, create a new policy — copy the JSON below and name it DelimiterBedrockReadOnly.',
      'Create a new IAM user (e.g. delimiter-monitor) with no console access. Attach the policy you just created.',
      'Open the user\'s Security credentials tab, create an access key, and paste the credential JSON here.',
    ],
    securityNote: 'Never paste AWS root keys. Delimiter queries only Bedrock spend and metadata — not other AWS services. Use a dedicated IAM user you can revoke anytime.',
    statusNote: 'Initial connection stores the credential securely. Full Bedrock sync follows the IAM policy setup.',
    iamPolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'BedrockSpendViaCostExplorer',
          Effect: 'Allow',
          Action: [
            'ce:GetCostAndUsage',
            'ce:GetCostForecast',
            'ce:GetDimensionValues',
          ],
          Resource: '*',
        },
        {
          Sid: 'BedrockCloudWatchMetrics',
          Effect: 'Allow',
          Action: [
            'cloudwatch:GetMetricData',
            'cloudwatch:GetMetricStatistics',
            'cloudwatch:ListMetrics',
          ],
          Resource: '*',
        },
        {
          Sid: 'BedrockQuotas',
          Effect: 'Allow',
          Action: [
            'servicequotas:GetServiceQuota',
            'servicequotas:ListServiceQuotas',
          ],
          Resource: '*',
        },
        {
          Sid: 'BedrockModelMetadata',
          Effect: 'Allow',
          Action: [
            'bedrock:ListFoundationModels',
            'bedrock:GetFoundationModel',
            'bedrock:ListProvisionedModelThroughputs',
            'bedrock:GetProvisionedModelThroughput',
            'bedrock:ListInferenceProfiles',
            'bedrock:GetInferenceProfile',
          ],
          Resource: '*',
        },
      ],
    }, null, 2),
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    shortName: 'OR',
    categories: ['ai'],
    tokenCredits: true,
    keyType: 'API key',
    keyHint: 'Create an OpenRouter API key from account settings.',
    capabilities: ['spend', 'usage', 'balance', 'models'],
    accent: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Sync credit balance, total usage, and multi-model spend from OpenRouter.',
    setupSteps: [
      'Open OpenRouter settings and create a dedicated API key.',
      'Paste the key here to sync credits and usage.',
      'Rotate or delete the key anytime from OpenRouter and Delimiter.',
    ],
    securityNote: 'Delimiter uses this key only for OpenRouter credits and usage endpoints.',
  },
  {
    id: 'xai',
    name: 'xAI',
    shortName: 'xAI',
    categories: ['ai'],
    tokenCredits: true,
    keyType: 'API key',
    keyHint: 'Create an API key from xAI Console. Management keys unlock billing sync.',
    capabilities: ['balance', 'configured_limits'],
    accent: '#111827',
    bg: '#f9fafb',
    description: 'Connect xAI with an API key or management key. Set a credit balance to track remaining credits.',
    setupSteps: [
      'Open xAI Console and create an API key.',
      'For billing sync, use a management key instead.',
      'Paste the key here. Delimiter encrypts it and validates the connection.',
    ],
    securityNote: 'Delimiter never uses xAI keys for model requests.',
  },
  {
    id: 'increase',
    name: 'Increase',
    shortName: 'Inc',
    categories: ['financial'],
    keyType: 'API key',
    keyHint: 'Create a read-only API key from your Increase dashboard.',
    capabilities: ['spend', 'balance'],
    accent: '#0f172a',
    bg: '#f8fafc',
    description: 'Monitor account balances, transaction volume, and fees across your Increase banking accounts.',
    setupSteps: [
      'Open your Increase dashboard and navigate to API keys.',
      'Create a read-only key scoped to account and transaction data.',
      'Paste the key here. Delimiter uses it only to read balances and transaction history.',
    ],
    securityNote: 'Use a read-only key. Delimiter never initiates transactions or modifies account settings.',
  },
  {
    id: 'serper',
    name: 'Serper',
    shortName: 'Se',
    categories: ['search'],
    keyType: 'API key',
    keyHint: 'Copy your API key from the Serper dashboard.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#059669',
    bg: '#ecfdf5',
    description: 'Monitor search API credit balance, usage volume, and remaining quota from Serper.',
    setupSteps: [
      'Open your Serper dashboard and copy your API key.',
      'Paste it here. Delimiter checks your credit balance and usage.',
      'Rotate or delete the key anytime from Serper.',
    ],
    securityNote: 'Delimiter uses this key only to check credit balance and usage stats.',
  },
  {
    id: 'parallel',
    name: 'Parallel',
    shortName: 'PM',
    categories: ['search'],
    keyType: 'API key',
    keyHint: 'Copy your API key from the Parallel dashboard.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#1e40af',
    bg: '#eff6ff',
    description: 'Monitor search API credit balance, query volume, and usage from Parallel.',
    setupSteps: [
      'Open your Parallel dashboard and copy your API key.',
      'Paste it here. Delimiter reads your credit balance and query usage.',
      'Rotate the key anytime from Parallel.',
    ],
    securityNote: 'Delimiter uses this key only to check credit balance and usage stats.',
  },
  {
    id: 'neon',
    name: 'Neon',
    shortName: 'Ne',
    categories: ['infra'],
    keyType: 'API key',
    keyHint: 'Create an API key from your Neon account settings.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#00e699',
    bg: '#ecfff7',
    description: 'Monitor database compute hours, storage, and billing from your Neon Postgres projects.',
    setupSteps: [
      'Open Neon console and go to Account Settings > API Keys.',
      'Create a new API key for Delimiter.',
      'Paste it here. Delimiter reads project usage and billing data.',
    ],
    securityNote: 'Delimiter reads billing and usage metrics only. It never modifies databases or project settings.',
  },
  {
    id: 'vapi',
    name: 'VAPI',
    shortName: 'VA',
    categories: ['voice'],
    keyType: 'API key',
    keyHint: 'Copy your API key from the VAPI dashboard.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#5b21b6',
    bg: '#f5f3ff',
    description: 'Monitor voice agent minutes, call volume, and credit balance from VAPI.',
    setupSteps: [
      'Open your VAPI dashboard and copy your API key.',
      'Paste it here. Delimiter reads call usage and billing data.',
      'Rotate the key anytime from VAPI.',
    ],
    securityNote: 'Delimiter uses this key only to read usage and billing. It never initiates calls.',
  },
  {
    id: 'retell',
    name: 'Retell',
    shortName: 'Re',
    categories: ['voice'],
    keyType: 'API key',
    keyHint: 'Copy your API key from the Retell dashboard.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#0f172a',
    bg: '#f8fafc',
    description: 'Monitor voice agent minutes, call volume, and credit balance from Retell.',
    setupSteps: [
      'Open your Retell dashboard and copy your API key.',
      'Paste it here. Delimiter reads call usage and billing data.',
      'Rotate the key anytime from Retell.',
    ],
    securityNote: 'Delimiter uses this key only to read usage and billing. It never initiates calls.',
  },
  {
    id: 'livekit',
    name: 'LiveKit',
    shortName: 'LK',
    categories: ['voice'],
    keyType: 'API key and secret',
    keyHint: 'Use your LiveKit Cloud API key and secret.',
    capabilities: ['spend', 'usage'],
    accent: '#0ea5e9',
    bg: '#f0f9ff',
    description: 'Monitor room minutes, participant usage, and egress costs from LiveKit Cloud.',
    setupSteps: [
      'Open your LiveKit Cloud dashboard and navigate to Settings > Keys.',
      'Copy your API key and secret.',
      'Paste them here (comma-separated: key,secret). Delimiter reads usage metrics only.',
    ],
    securityNote: 'Delimiter reads usage and billing data only. It never creates rooms or manages participants.',
  },
  {
    id: 'pipecat',
    name: 'Pipecat',
    shortName: 'PC',
    categories: ['voice'],
    keyType: 'API key',
    keyHint: 'Copy your API key from the Pipecat Cloud dashboard.',
    capabilities: ['spend', 'usage'],
    accent: '#d946ef',
    bg: '#fdf4ff',
    description: 'Monitor voice pipeline minutes, session volume, and compute costs from Pipecat Cloud.',
    setupSteps: [
      'Open your Pipecat Cloud dashboard and copy your API key.',
      'Paste it here. Delimiter reads session usage and billing data.',
      'Rotate the key anytime from Pipecat.',
    ],
    securityNote: 'Delimiter uses this key only to read usage and billing. It never manages pipelines.',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    shortName: 'St',
    categories: ['financial'],
    keyType: 'Restricted API key',
    keyHint: 'Create a restricted key with read-only access to balance and charges.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#635bff',
    bg: '#f5f3ff',
    description: 'Monitor processing volume, fees, payouts, and account balance from Stripe.',
    setupSteps: [
      'Open Stripe Dashboard > Developers > API Keys.',
      'Create a restricted key with read-only access to Balance, Charges, and Invoices.',
      'Paste the key here. Delimiter reads billing data only.',
    ],
    securityNote: 'Use a restricted read-only key. Delimiter never creates charges, refunds, or modifies your Stripe account.',
  },
  {
    id: 'google_maps',
    name: 'Google Maps',
    shortName: 'GM',
    categories: ['infra'],
    keyType: 'API key',
    keyHint: 'Use a Google Cloud API key with Maps billing visibility.',
    capabilities: ['spend', 'usage'],
    accent: '#4285f4',
    bg: '#eff6ff',
    description: 'Track Maps API request volume, geocoding costs, and usage quotas from Google Maps Platform.',
    setupSteps: [
      'Open Google Cloud Console and navigate to APIs & Services > Credentials.',
      'Use an existing Maps API key or create a dedicated one for monitoring.',
      'Paste the key here. Delimiter reads usage metrics from the Cloud Billing API.',
    ],
    securityNote: 'Delimiter reads usage and billing data only. It never makes Maps API requests on your behalf.',
    statusNote: 'Initial connection stores the credential securely. Full Maps billing sync requires Cloud Billing API access.',
  },
  {
    id: 'smooth',
    name: 'Smooth',
    shortName: 'Sm',
    categories: ['infra'],
    keyType: 'API key',
    keyHint: 'Copy your API key from the Smooth dashboard.',
    capabilities: ['spend', 'usage'],
    accent: '#0ea5e9',
    bg: '#f0f9ff',
    description: 'Track browser verification sessions, usage volume, and costs from Smooth.',
    setupSteps: [
      'Open your Smooth dashboard and copy your API key.',
      'Paste it here. Delimiter reads session counts and billing data.',
      'Rotate the key anytime from Smooth.',
    ],
    securityNote: 'Delimiter reads usage data only. It never initiates browser sessions.',
    statusNote: 'Initial connection stores the credential securely. Usage sync is next.',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    shortName: 'Sb',
    categories: ['infra'],
    keyType: 'Organization access token',
    keyHint: 'Create an access token from your Supabase organization settings.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#3ecf8e',
    bg: '#ecfdf5',
    description: 'Monitor project compute hours, storage, bandwidth, and remaining credits across your Supabase organization.',
    setupSteps: [
      'Open Supabase Dashboard > Organization Settings > Access Tokens.',
      'Create a new token for Delimiter with read-only scope.',
      'Paste the token here. Delimiter reads usage metrics and billing data.',
    ],
    securityNote: 'Delimiter reads billing and usage metrics only. It never modifies databases, projects, or organization settings.',
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    shortName: 'DO',
    categories: ['infra', 'ai'],
    tokenCredits: true,
    keyType: 'Personal access token',
    keyHint: 'Create a read-only personal access token from your DigitalOcean account.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#0080ff',
    bg: '#eff8ff',
    description: 'Monitor droplet spend, bandwidth usage, and remaining credits across your DigitalOcean account.',
    setupSteps: [
      'Open DigitalOcean Control Panel > API > Tokens.',
      'Generate a new personal access token with read-only scope.',
      'Paste the token here. Delimiter reads billing and usage data only.',
    ],
    securityNote: 'Use a read-only token. Delimiter never creates, modifies, or destroys any DigitalOcean resources.',
  },
  {
    id: 'render',
    name: 'Render',
    shortName: 'Rn',
    categories: ['infra'],
    keyType: 'API key',
    keyHint: 'Create an API key from your Render account settings.',
    capabilities: ['spend', 'usage'],
    accent: '#46e3b7',
    bg: '#ecfdf5',
    description: 'Track service spend, instance hours, and bandwidth usage across your Render account.',
    setupSteps: [
      'Open Render Dashboard > Account Settings > API Keys.',
      'Create a new API key for Delimiter.',
      'Paste the key here. Delimiter reads billing and service usage data.',
    ],
    securityNote: 'Delimiter reads billing and usage data only. It never deploys, modifies, or deletes services.',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortName: 'EL',
    categories: ['voice'],
    keyType: 'API key',
    keyHint: 'Copy your API key from your ElevenLabs profile settings.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#000000',
    bg: '#f4f4f5',
    description: 'Monitor character usage, voice synthesis minutes, and remaining credits from ElevenLabs.',
    setupSteps: [
      'Open your ElevenLabs Profile Settings and copy your API key.',
      'Paste it here. Delimiter reads usage quota and billing data.',
      'Rotate the key anytime from ElevenLabs.',
    ],
    securityNote: 'Delimiter uses this key only to read usage and billing. It never generates speech or modifies voices.',
  },
]

export function getProvider(providerId: string): ProviderCatalogItem | undefined {
  return PROVIDER_CATALOG.find((provider) => provider.id === providerId)
}

export function capabilityLabel(capability: ProviderCapability): string {
  switch (capability) {
    case 'configured_limits':
      return 'Rate limits'
    case 'spend':
      return 'Spend'
    case 'usage':
      return 'Usage'
    case 'balance':
      return 'Balance'
    case 'models':
      return 'Models'
  }
}
