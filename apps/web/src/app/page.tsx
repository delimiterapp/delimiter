import { Nav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TrustSection } from '@/components/landing/trust-section'
import { Providers } from '@/components/landing/providers'
import { Pricing } from '@/components/landing/pricing'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <TrustSection />
        <Providers />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
