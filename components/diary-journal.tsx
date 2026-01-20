"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Calendar, ChevronRight } from "lucide-react"

export interface DiaryEntry {
  id: string
  date: string
  title: string
  preview: string
  tags: string[]
}

interface DiaryJournalProps {
  entries: DiaryEntry[]
}

const tagColors: Record<string, string> = {
  Health: "bg-chart-1/20 text-chart-1",
  Milestone: "bg-ring-presence/20 text-ring-presence",
  Appointment: "bg-ring-feeding/20 text-ring-feeding",
  Behavior: "bg-chart-4/20 text-chart-4",
  Memory: "bg-chart-5/20 text-chart-5",
}

export function DiaryJournal({ entries }: DiaryJournalProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Journal
        </h3>
        <button type="button" className="text-xs text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <Card 
            key={entry.id} 
            className="p-4 bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <h4 className="text-sm font-medium text-foreground mb-1">{entry.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{entry.preview}</p>
                {entry.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {entry.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${tagColors[tag] || "bg-secondary text-secondary-foreground"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
