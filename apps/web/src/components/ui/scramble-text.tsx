'use client'

import { useEffect, useState, useRef, memo } from 'react'

interface ScrambleTextProps {
  text: string
  duration?: number
  delay?: number
  scrambleOnChange?: boolean
  characters?: string
  className?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'
  skipInitialAnimation?: boolean
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export const ScrambleText = memo(function ScrambleText({
  text,
  duration = 0.8,
  delay = 0,
  scrambleOnChange = true,
  characters = DEFAULT_CHARS,
  className,
  as: Component = 'span',
  skipInitialAnimation = false,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const previousText = useRef(text)
  const animationRef = useRef<number | null>(null)
  const hasAnimated = useRef(skipInitialAnimation)

  useEffect(() => {
    const textChanged = previousText.current !== text
    const shouldAnimate = !hasAnimated.current || (scrambleOnChange && textChanged)

    if (!shouldAnimate) {
      setDisplayText(text)
      return
    }

    previousText.current = text
    hasAnimated.current = true

    const startTime = performance.now() + delay * 1000
    const endTime = startTime + duration * 1000

    const animate = (currentTime: number) => {
      if (currentTime < startTime) {
        const scrambled = text
          .split('')
          .map((char) =>
            char === ' ' ? ' ' : characters[Math.floor(Math.random() * characters.length)]
          )
          .join('')
        setDisplayText(scrambled)
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (currentTime >= endTime) {
        setDisplayText(text)
        return
      }

      const progress = (currentTime - startTime) / (duration * 1000)

      const result = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '
          const charThreshold = index / text.length
          if (progress > charThreshold + 0.1) {
            return char
          } else if (progress > charThreshold - 0.1) {
            return Math.random() > 0.3
              ? characters[Math.floor(Math.random() * characters.length)]
              : char
          } else {
            return characters[Math.floor(Math.random() * characters.length)]
          }
        })
        .join('')

      setDisplayText(result)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [text, duration, delay, scrambleOnChange, characters])

  return <Component className={className}>{displayText}</Component>
})

export default ScrambleText
