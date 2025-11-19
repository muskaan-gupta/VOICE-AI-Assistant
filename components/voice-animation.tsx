"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useVoiceStore } from "@/lib/store"

export function VoiceAnimation() {
  const { voiceState } = useVoiceStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = 60

      // Draw multiple concentric circles with wave effect
      for (let i = 0; i < 5; i++) {
        const radius = baseRadius + i * 20
        const opacity = voiceState.isListening ? 0.8 - i * 0.15 : 0.3 - i * 0.05
        const waveOffset = voiceState.isListening ? Math.sin(time + i) * 10 : 0

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius + waveOffset, 0, 2 * Math.PI)
        ctx.strokeStyle = voiceState.isListening ? `rgba(59, 130, 246, ${opacity})` : `rgba(156, 163, 175, ${opacity})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Central pulsing circle
      const pulseRadius = baseRadius + (voiceState.isListening ? Math.sin(time * 2) * 15 : 0)
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI)
      ctx.fillStyle = voiceState.isListening ? "rgba(59, 130, 246, 0.3)" : "rgba(156, 163, 175, 0.2)"
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [voiceState.isListening])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={300} height={300} className="w-full h-full max-w-[300px] max-h-[300px]" />

      {/* Central microphone icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: voiceState.isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: voiceState.isListening ? Number.POSITIVE_INFINITY : 0,
        }}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            voiceState.isListening
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}
