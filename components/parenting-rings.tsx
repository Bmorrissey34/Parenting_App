"use client"

import { Moon, Droplets, Heart } from "lucide-react"

interface RingProps {
  progress: number
  size: number
  strokeWidth: number
  color: string
  bgOpacity?: number
}

function Ring({ progress, size, strokeWidth, color, bgOpacity = 0.2 }: RingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={bgOpacity}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

interface ParentingRingsProps {
  sleepProgress: number
  feedingProgress: number
  presenceProgress: number
}

export function ParentingRings({ sleepProgress, feedingProgress, presenceProgress }: ParentingRingsProps) {
  const rings = [
    { 
      progress: sleepProgress, 
      label: "Sleep", 
      value: `${Math.round(sleepProgress)}%`,
      color: "oklch(0.72 0.12 145)", // Sage green
      icon: Moon,
      size: 180,
      strokeWidth: 14
    },
    { 
      progress: feedingProgress, 
      label: "Feeding", 
      value: `${Math.round(feedingProgress)}%`,
      color: "oklch(0.70 0.15 220)", // Soft blue
      icon: Droplets,
      size: 140,
      strokeWidth: 12
    },
    { 
      progress: presenceProgress, 
      label: "Presence", 
      value: `${Math.round(presenceProgress)}%`,
      color: "oklch(0.75 0.12 55)", // Warm amber
      icon: Heart,
      size: 100,
      strokeWidth: 10
    },
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center h-48 w-48">
        {/* Outer ring - Sleep */}
        <div className="absolute">
          <Ring {...rings[0]} />
        </div>
        {/* Middle ring - Feeding */}
        <div className="absolute">
          <Ring {...rings[1]} />
        </div>
        {/* Inner ring - Presence */}
        <div className="absolute">
          <Ring {...rings[2]} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: ring.color }}
            />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{ring.label}</span>
              <span className="text-sm font-medium text-foreground">{ring.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
