"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore"
import type { TimelineEntry } from "@/components/daily-timeline"
import type { DiaryEntry } from "@/components/diary-journal"
import type { GrowthDataPoint } from "@/components/growth-chart"
import { db } from "./firebase"
import { useAuth } from "./auth-context"
import { useChildren } from "./children-context"
import { getAgeInMonths, getGoalsForAge } from "./caregiving-goals"

type LogType = "feeding" | "sleep" | "play" | "growth" | "diary"

interface LogRecord {
  id: string
  userId: string
  childId: string
  type: LogType
  createdAt: Date
  data: Record<string, unknown>
}

interface LogsContextType {
  timelineEntries: TimelineEntry[]
  diaryEntries: DiaryEntry[]
  growthData: GrowthDataPoint[]
  sleepProgress: number
  feedingProgress: number
  presenceProgress: number
  sleepGoal: number
  feedingGoal: number
  presenceGoal: number
  sleepCount: number
  feedingCount: number
  presenceCount: number
  loading: boolean
  addLog: (type: LogType, data: Record<string, unknown>) => Promise<void>
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

const formatDate = (date: Date) => date.toLocaleDateString()

const getTodayStart = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return start
}

const toDate = (value: unknown) => {
  if (value instanceof Date) return value
  const maybeTimestamp = value as { toDate?: () => Date } | null
  return maybeTimestamp?.toDate?.() ?? new Date()
}

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { activeChild } = useChildren()
  const [logs, setLogs] = useState<LogRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !activeChild) {
      setLogs([])
      setLoading(false)
      return
    }

    const logsRef = collection(db, "logs")
    const logsQuery = query(
      logsRef,
      where("userId", "==", user.uid),
      where("childId", "==", activeChild.id),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<LogRecord, "id" | "createdAt">
          return {
            id: docSnap.id,
            ...data,
            createdAt: toDate((docSnap.data() as { createdAt?: unknown }).createdAt),
          }
        })
        setLogs(fetched)
        setLoading(false)
      },
      () => setLoading(false)
    )

    return unsubscribe
  }, [user, activeChild])

  const addLog = async (type: LogType, data: Record<string, unknown>) => {
    if (!user || !activeChild) return

    await addDoc(collection(db, "logs"), {
      userId: user.uid,
      childId: activeChild.id,
      type,
      data,
      createdAt: Timestamp.now(),
    })
  }

  const timelineEntries = useMemo<TimelineEntry[]>(() => {
    return logs.map((log) => {
      const time = formatTime(log.createdAt)
      const entry: TimelineEntry = {
        id: log.id,
        type: log.type,
        title: "",
        time,
      }

      switch (log.type) {
        case "feeding":
          entry.title = "Feeding"
          entry.details = `${log.data.amount ?? 0} ml`
          break
        case "sleep":
          entry.title = "Sleep"
          entry.details = `${log.data.startTime ?? ""} - ${log.data.endTime ?? ""}`.trim()
          break
        case "play":
          entry.title = "Play"
          entry.details = log.data.presenceMode ? "Presence mode" : "Play session"
          break
        case "growth":
          entry.title = "Growth"
          entry.details = `${log.data.weight ?? 0} kg · ${log.data.height ?? 0} cm`
          break
        case "diary":
          entry.title = "Diary"
          entry.details = (log.data.note as string) || ""
          entry.tags = (log.data.tags as string[]) || []
          break
      }

      return entry
    })
  }, [logs])

  const diaryEntries = useMemo<DiaryEntry[]>(() => {
    return logs
      .filter((log) => log.type === "diary")
      .map((log) => {
        const note = (log.data.note as string) || ""
        return {
          id: log.id,
          date: formatDate(log.createdAt),
          title: note ? note.slice(0, 32) : "New memory",
          preview: note,
          tags: (log.data.tags as string[]) || [],
        }
      })
  }, [logs])

  const growthData = useMemo<GrowthDataPoint[]>(() => {
    return logs
      .filter((log) => log.type === "growth")
      .map((log) => ({
        date: formatDate(log.createdAt),
        weight: Number(log.data.weight ?? 0),
        height: Number(log.data.height ?? 0),
      }))
      .reverse()
  }, [logs])

  const { sleepProgress, feedingProgress, presenceProgress, sleepGoal, feedingGoal, presenceGoal, sleepCount, feedingCount, presenceCount } = useMemo(() => {
    const todayStart = getTodayStart()
    const todayLogs = logs.filter((log) => log.createdAt >= todayStart)
    const sleepCount = todayLogs.filter((log) => log.type === "sleep").length
    const feedingCount = todayLogs.filter((log) => log.type === "feeding").length
    const presenceCount = todayLogs.filter((log) => log.type === "play").length

    // Get dynamic goals based on child's age
    const ageInMonths = activeChild?.birthDate ? getAgeInMonths(activeChild.birthDate) : 0
    const { sleepGoal: sleepG, feedingGoal: feedingG, playGoal: playG } = getGoalsForAge(ageInMonths)

    return {
      sleepProgress: Math.min(100, (sleepCount / sleepG) * 100),
      feedingProgress: Math.min(100, (feedingCount / feedingG) * 100),
      presenceProgress: Math.min(100, (presenceCount / playG) * 100),
      sleepGoal: sleepG,
      feedingGoal: feedingG,
      presenceGoal: playG,
      sleepCount,
      feedingCount,
      presenceCount,
    }
  }, [logs, activeChild?.birthDate])

  return (
    <LogsContext.Provider
      value={{
        timelineEntries,
        diaryEntries,
        growthData,
        sleepProgress,
        feedingProgress,
        presenceProgress,
        sleepGoal,
        feedingGoal,
        presenceGoal,
        sleepCount,
        feedingCount,
        presenceCount,
        loading,
        addLog,
      }}
    >
      {children}
    </LogsContext.Provider>
  )
}

export function useLogs() {
  const context = useContext(LogsContext)
  if (!context) {
    throw new Error("useLogs must be used within LogsProvider")
  }
  return context
}
