"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Play, Pause, RotateCcw, X } from "lucide-react"

interface PresenceModeProps {
  defaultDuration?: number // in seconds
}

export function PresenceMode({ defaultDuration = 900 }: PresenceModeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(defaultDuration)
  const [totalTime] = useState(defaultDuration)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const reset = useCallback(() => {
    setTimeLeft(defaultDuration)
    setIsRunning(false)
  }, [defaultDuration])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ring-presence/10 rounded-full blur-3xl animate-breathe" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-breathe" style={{ animationDelay: "2s" }} />
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 text-muted-foreground"
          onClick={() => {
            setIsExpanded(false)
            reset()
          }}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Timer content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <Heart className="w-8 h-8 text-ring-presence mx-auto animate-pulse-gentle" />
            <h2 className="text-xl font-light text-foreground">Presence Mode</h2>
            <p className="text-sm text-muted-foreground">Be fully present with your little one</p>
          </div>

          {/* Circular progress */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="oklch(0.20 0.008 260)"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="oklch(0.75 0.12 55)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="text-center">
              <span className="text-5xl font-light text-foreground">{formatTime(timeLeft)}</span>
              <p className="text-sm text-muted-foreground mt-2">remaining</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={reset}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-ring-presence text-background hover:bg-ring-presence/90"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <div className="w-12" /> {/* Spacer for symmetry */}
          </div>

          {timeLeft === 0 && (
            <div className="text-center space-y-2 animate-in fade-in">
              <p className="text-lg font-medium text-ring-presence">Session Complete</p>
              <p className="text-sm text-muted-foreground">Great job being present!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card 
      className="p-4 bg-gradient-to-br from-ring-presence/20 to-ring-presence/5 border-ring-presence/30 cursor-pointer hover:from-ring-presence/25 hover:to-ring-presence/10 transition-colors"
      onClick={() => setIsExpanded(true)}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-ring-presence/20">
          <Heart className="w-6 h-6 text-ring-presence" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Presence Mode</h3>
          <p className="text-xs text-muted-foreground">15 min focused time</p>
        </div>
        <Play className="w-5 h-5 text-ring-presence" />
      </div>
    </Card>
  )
}
