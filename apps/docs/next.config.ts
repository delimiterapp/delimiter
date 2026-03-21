import createMDX from '@next/mdx'

const withMDX = createMDX({})

const nextConfig = {
  pageExtensions: ['tsx', 'mdx'],
}

export default withMDX(nextConfig)
