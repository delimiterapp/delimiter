'use client'

import { useEffect, useRef } from 'react'

interface TracerLine {
  x: number
  y: number
  direction: 'up' | 'down' | 'left' | 'right'
  speed: number
  length: number
  opacity: number
  life: number
  maxLife: number
}

const GRID_SIZE = 60
const MAX_TRACERS = 6
const SPAWN_INTERVAL = 800

export function AnimatedGrid({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let lastSpawn = 0
    const tracers: TracerLine[] = []

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas!.width = rect.width * dpr
      canvas!.height = rect.height * dpr
      ctx!.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    function spawnTracer(w: number, h: number) {
      const directions: TracerLine['direction'][] = ['up', 'down', 'left', 'right']
      const dir = directions[Math.floor(Math.random() * directions.length)]

      // Snap to grid lines
      const gridCols = Math.floor(w / GRID_SIZE)
      const gridRows = Math.floor(h / GRID_SIZE)

      let x: number, y: number
      if (dir === 'left' || dir === 'right') {
        x = dir === 'right' ? -60 : w + 60
        y = (Math.floor(Math.random() * gridRows) + 1) * GRID_SIZE
      } else {
        x = (Math.floor(Math.random() * gridCols) + 1) * GRID_SIZE
        y = dir === 'down' ? -60 : h + 60
      }

      tracers.push({
        x,
        y,
        direction: dir,
        speed: 1.5 + Math.random() * 2,
        length: 40 + Math.random() * 50,
        opacity: 0.4 + Math.random() * 0.4,
        life: 0,
        maxLife: 300 + Math.random() * 200,
      })
    }

    function draw(time: number) {
      const rect = canvas!.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      ctx!.clearRect(0, 0, w, h)

      // Draw grid lines
      ctx!.strokeStyle = 'rgba(229, 231, 235, 0.5)'
      ctx!.lineWidth = 0.5
      ctx!.beginPath()
      for (let x = GRID_SIZE; x < w; x += GRID_SIZE) {
        ctx!.moveTo(x, 0)
        ctx!.lineTo(x, h)
      }
      for (let y = GRID_SIZE; y < h; y += GRID_SIZE) {
        ctx!.moveTo(0, y)
        ctx!.lineTo(w, y)
      }
      ctx!.stroke()

      // Draw subtle dots at grid intersections
      for (let x = GRID_SIZE; x < w; x += GRID_SIZE) {
        for (let y = GRID_SIZE; y < h; y += GRID_SIZE) {
          ctx!.fillStyle = 'rgba(229, 231, 235, 0.4)'
          ctx!.beginPath()
          ctx!.arc(x, y, 1, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      // Spawn new tracers
      if (time - lastSpawn > SPAWN_INTERVAL && tracers.length < MAX_TRACERS) {
        spawnTracer(w, h)
        lastSpawn = time
      }

      // Update and draw tracers
      for (let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i]
        t.life++

        // Move
        switch (t.direction) {
          case 'right': t.x += t.speed; break
          case 'left': t.x -= t.speed; break
          case 'down': t.y += t.speed; break
          case 'up': t.y -= t.speed; break
        }

        // Fade in/out
        const lifeRatio = t.life / t.maxLife
        let alpha = t.opacity
        if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1
        else if (lifeRatio > 0.8) alpha *= (1 - lifeRatio) / 0.2

        // Draw tracer with gradient
        const gradient = (t.direction === 'left' || t.direction === 'right')
          ? ctx!.createLinearGradient(
              t.direction === 'right' ? t.x - t.length : t.x + t.length,
              t.y,
              t.x,
              t.y
            )
          : ctx!.createLinearGradient(
              t.x,
              t.direction === 'down' ? t.y - t.length : t.y + t.length,
              t.x,
              t.y
            )

        gradient.addColorStop(0, `rgba(196, 181, 253, 0)`)
        gradient.addColorStop(0.5, `rgba(196, 181, 253, ${alpha * 0.6})`)
        gradient.addColorStop(1, `rgba(196, 181, 253, ${alpha})`)

        ctx!.strokeStyle = gradient
        ctx!.lineWidth = 1.5
        ctx!.beginPath()

        if (t.direction === 'left' || t.direction === 'right') {
          const startX = t.direction === 'right' ? t.x - t.length : t.x + t.length
          ctx!.moveTo(startX, t.y)
          ctx!.lineTo(t.x, t.y)
        } else {
          const startY = t.direction === 'down' ? t.y - t.length : t.y + t.length
          ctx!.moveTo(t.x, startY)
          ctx!.lineTo(t.x, t.y)
        }
        ctx!.stroke()

        // Draw bright dot at head
        ctx!.fillStyle = `rgba(196, 181, 253, ${alpha})`
        ctx!.beginPath()
        ctx!.arc(t.x, t.y, 2, 0, Math.PI * 2)
        ctx!.fill()

        // Remove dead tracers
        if (t.life > t.maxLife ||
            t.x > w + 100 || t.x < -100 ||
            t.y > h + 100 || t.y < -100) {
          tracers.splice(i, 1)
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
      style={{ opacity: 0.7 }}
    />
  )
}
