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
      <main className="relative">
        {/* Ruler lines — full height from header to footer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Left ruler pair */}
          <div className="absolute top-0 bottom-0 left-8 hidden w-px border-l border-dashed border-border lg:block" />
          <div className="absolute top-0 bottom-0 left-20 hidden w-px border-l border-dashed border-border/50 lg:block" />
          {/* Right ruler pair */}
          <div className="absolute top-0 bottom-0 right-8 hidden w-px border-r border-dashed border-border lg:block" />
          <div className="absolute top-0 bottom-0 right-20 hidden w-px border-r border-dashed border-border/50 lg:block" />
          {/* Horizontal tick marks — distributed along full height */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`lt-${i}`} className="absolute left-8 hidden h-px w-5 bg-border lg:block" style={{ top: `${5 + i * 5}%` }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`rt-${i}`} className="absolute right-8 hidden h-px w-5 bg-border lg:block" style={{ top: `${5 + i * 5}%` }} />
          ))}
        </div>

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
