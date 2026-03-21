import createMDX from '@next/mdx'

const withMDX = createMDX({})

const nextConfig = {
  output: 'export' as const,
  basePath: '/docs',
  pageExtensions: ['tsx', 'mdx'],
}

export default withMDX(nextConfig)
