'use client'

import { useEffect, useRef } from 'react'

const GRID_SIZE = 60

interface GridLine {
  type: 'h' | 'v'
  pos: number       // grid coordinate (which line number from edge)
  appear: number    // timestamp when it snaps in
  maxPos: number    // total lines of this type
}

export function AnimatedGrid({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let w = 0
    let h = 0

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    // Center fade — things fade out near center content
    function centerFade(px: number, py: number): number {
      const cx = w / 2
      const cy = h / 2
      const dx = (px - cx) / (w * 0.35)
      const dy = (py - cy) / (h * 0.35)
      const dist = Math.sqrt(dx * dx + dy * dy)
      return Math.min(1, Math.max(0, (dist - 0.5) / 0.5))
    }

    // Build the sequence: lines ordered from edges inward
    function buildSequence(): GridLine[] {
      const cols = Math.floor(w / GRID_SIZE)
      const rows = Math.floor(h / GRID_SIZE)
      const lines: GridLine[] = []

      // Vertical lines: pair from left & right edges inward
      const vLines: number[] = []
      let left = 1, right = cols
      while (left <= right) {
        vLines.push(left)
        if (right !== left) vLines.push(right)
        left++
        right--
      }

      // Horizontal lines: pair from top & bottom edges inward
      const hLines: number[] = []
      let top = 1, bottom = rows
      while (top <= bottom) {
        hLines.push(top)
        if (bottom !== top) hLines.push(bottom)
        top++
        bottom--
      }

      // Interleave: alternate between a vertical and horizontal line
      const maxLen = Math.max(vLines.length, hLines.length)
      let idx = 0
      for (let i = 0; i < maxLen; i++) {
        if (i < vLines.length) {
          lines.push({ type: 'v', pos: vLines[i], appear: idx * 60, maxPos: cols })
          idx++
        }
        if (i < hLines.length) {
          lines.push({ type: 'h', pos: hLines[i], appear: idx * 60, maxPos: rows })
          idx++
        }
      }

      return lines
    }

    let sequence = buildSequence()
    // Total cycle: build time + hold time + snap-out time
    const buildDuration = () => sequence.length * 60
    const holdDuration = 2000
    const snapOutDuration = () => sequence.length * 40
    const totalCycle = () => buildDuration() + holdDuration + snapOutDuration() + 800

    let cycleStart = performance.now()

    function draw(time: number) {
      ctx!.clearRect(0, 0, w, h)

      const elapsed = time - cycleStart
      const total = totalCycle()

      // Reset cycle
      if (elapsed > total) {
        cycleStart = time
        sequence = buildSequence()
        animationId = requestAnimationFrame(draw)
        return
      }

      const buildEnd = buildDuration()
      const holdEnd = buildEnd + holdDuration
      const snapOutEnd = holdEnd + snapOutDuration()

      // Draw persistent dots at all intersections (very subtle)
      const cols = Math.floor(w / GRID_SIZE)
      const rows = Math.floor(h / GRID_SIZE)
      for (let c = 1; c <= cols; c++) {
        for (let r = 1; r <= rows; r++) {
          const px = c * GRID_SIZE
          const py = r * GRID_SIZE
          const fade = centerFade(px, py)
          if (fade < 0.02) continue
          ctx!.fillStyle = `rgba(229, 231, 235, ${0.25 * fade})`
          ctx!.beginPath()
          ctx!.arc(px, py, 1, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      // For each line in the sequence, determine if it's visible
      for (let i = 0; i < sequence.length; i++) {
        const line = sequence[i]
        let alpha = 0

        if (elapsed < buildEnd) {
          // Build phase: snap in when elapsed >= appear time
          if (elapsed >= line.appear) {
            // Snap in — instant to full, slight overshoot feel via quick ease
            const sincAppear = elapsed - line.appear
            alpha = sincAppear < 80 ? Math.min(1, sincAppear / 30) : 1
          }
        } else if (elapsed < holdEnd) {
          // Hold phase: all visible
          alpha = 1
        } else if (elapsed < snapOutEnd) {
          // Snap out phase: lines disappear in reverse order
          const snapOutElapsed = elapsed - holdEnd
          const reverseIdx = sequence.length - 1 - i
          const disappearTime = reverseIdx * 40
          if (snapOutElapsed >= disappearTime) {
            const sinceDisappear = snapOutElapsed - disappearTime
            alpha = Math.max(0, 1 - sinceDisappear / 25)
          } else {
            alpha = 1
          }
        }

        if (alpha < 0.01) continue

        const px = line.pos * GRID_SIZE

        if (line.type === 'v') {
          // Draw vertical line in segments for center fade
          for (let y = 0; y < h; y += 6) {
            const fade = centerFade(px, y + 3)
            if (fade < 0.02) continue
            const a = alpha * fade * 0.45
            ctx!.strokeStyle = `rgba(156, 163, 175, ${a})`
            ctx!.lineWidth = 0.5
            ctx!.beginPath()
            ctx!.moveTo(px, y)
            ctx!.lineTo(px, Math.min(y + 6, h))
            ctx!.stroke()
          }

          // Flash the intersection dots when line snaps in
          if (elapsed < buildEnd && elapsed >= line.appear) {
            const since = elapsed - line.appear
            if (since < 300) {
              const flash = since < 100 ? since / 100 : Math.max(0, 1 - (since - 100) / 200)
              for (let r = 1; r <= rows; r++) {
                const py = r * GRID_SIZE
                const fade = centerFade(px, py)
                if (fade < 0.02) continue
                ctx!.fillStyle = `rgba(139, 92, 246, ${flash * 0.7 * fade})`
                ctx!.beginPath()
                ctx!.arc(px, py, 2.5, 0, Math.PI * 2)
                ctx!.fill()
              }
            }
          }
        } else {
          // Draw horizontal line in segments for center fade
          const py = line.pos * GRID_SIZE
          for (let x = 0; x < w; x += 6) {
            const fade = centerFade(x + 3, py)
            if (fade < 0.02) continue
            const a = alpha * fade * 0.45
            ctx!.strokeStyle = `rgba(156, 163, 175, ${a})`
            ctx!.lineWidth = 0.5
            ctx!.beginPath()
            ctx!.moveTo(x, py)
            ctx!.lineTo(Math.min(x + 6, w), py)
            ctx!.stroke()
          }

          // Flash the intersection dots when line snaps in
          if (elapsed < buildEnd && elapsed >= line.appear) {
            const since = elapsed - line.appear
            if (since < 300) {
              const flash = since < 100 ? since / 100 : Math.max(0, 1 - (since - 100) / 200)
              for (let c = 1; c <= cols; c++) {
                const cpx = c * GRID_SIZE
                const fade = centerFade(cpx, px)
                if (fade < 0.02) continue
                ctx!.fillStyle = `rgba(139, 92, 246, ${flash * 0.7 * fade})`
                ctx!.beginPath()
                ctx!.arc(cpx, line.pos * GRID_SIZE, 2.5, 0, Math.PI * 2)
                ctx!.fill()
              }
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
