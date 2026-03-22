'use client'

import { useState, useRef, useLayoutEffect, type ReactNode, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { ScrambleText } from './scramble-text'

interface ScrambleButtonBaseProps {
  scrambleDuration?: number
  children: string
  icon?: ReactNode
  className?: string
}

type ScrambleAnchorProps = ScrambleButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { as: 'a' }

type ScrambleButtonElProps = ScrambleButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { as?: 'button' }

type ScrambleButtonProps = ScrambleAnchorProps | ScrambleButtonElProps

export function ScrambleButton({
  scrambleDuration = 0.4,
  children,
  className,
  icon,
  as,
  ...rest
}: ScrambleButtonProps) {
  const [hoverKey, setHoverKey] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [textWidth, setTextWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (measureRef.current) {
      setTextWidth(measureRef.current.offsetWidth)
    }
  }, [children])

  const handleMouseEnter = () => {
    setHoverKey((prev) => prev + 1)
  }

  const inner = (
    <>
      {icon}
      <span
        ref={measureRef}
        className="absolute invisible whitespace-nowrap"
        style={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        className="inline-block whitespace-nowrap overflow-hidden"
        style={{ width: textWidth ? `${textWidth}px` : 'auto' }}
      >
        <ScrambleText
          key={hoverKey}
          text={children}
          duration={scrambleDuration}
          scrambleOnChange={true}
          skipInitialAnimation={hoverKey === 0}
        />
      </span>
    </>
  )

  if (as === 'a') {
    const { as: _, ...anchorProps } = rest as ScrambleAnchorProps
    return (
      <a {...anchorProps} className={className} onMouseEnter={handleMouseEnter}>
        {inner}
      </a>
    )
  }

  const { as: _, ...buttonProps } = rest as ScrambleButtonElProps
  return (
    <button {...buttonProps} className={className} onMouseEnter={handleMouseEnter}>
      {inner}
    </button>
  )
}

export default ScrambleButton
