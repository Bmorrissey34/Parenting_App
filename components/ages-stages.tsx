"use client"

import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StageCard {
  id: string
  age: string
  title: string
  tips: string[]
  color: string
}

const stages: StageCard[] = [
  {
    id: "newborn",
    age: "0-3 Months",
    title: "Newborn",
    tips: ["Skin-to-skin contact", "Respond to cries", "Tummy time daily"],
    color: "from-ring-sleep/30 to-ring-sleep/10"
  },
  {
    id: "4months",
    age: "4-6 Months",
    title: "Explorer",
    tips: ["Introduce solids", "Rolling practice", "Object permanence games"],
    color: "from-ring-feeding/30 to-ring-feeding/10"
  },
  {
    id: "6months",
    age: "6-9 Months",
    title: "Sitter",
    tips: ["Sitting support", "Finger foods", "Simple words repetition"],
    color: "from-ring-presence/30 to-ring-presence/10"
  },
  {
    id: "9months",
    age: "9-12 Months",
    title: "Crawler",
    tips: ["Baby-proof spaces", "Standing practice", "Interactive play"],
    color: "from-chart-4/30 to-chart-4/10"
  },
  {
    id: "12months",
    age: "12-18 Months",
    title: "Walker",
    tips: ["First steps support", "Language games", "Independent play"],
    color: "from-chart-5/30 to-chart-5/10"
  },
]

export function AgesStages() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Ages & Stages
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {stages.map((stage) => (
          <Card 
            key={stage.id}
            className={`flex-shrink-0 w-44 p-4 border-0 bg-gradient-to-br ${stage.color} backdrop-blur-sm snap-start cursor-pointer hover:scale-[1.02] transition-transform`}
          >
            <div className="space-y-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {stage.age}
              </span>
              <h4 className="text-base font-semibold text-foreground">{stage.title}</h4>
              <ul className="space-y-1">
                {stage.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
