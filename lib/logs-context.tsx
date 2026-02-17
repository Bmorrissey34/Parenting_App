"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import type { TimelineEntry } from "@/components/daily-timeline"
import type { DiaryEntry } from "@/components/diary-journal"
import type { GrowthDataPoint } from "@/components/growth-chart"
import { db } from "./firebase"
import { useAuth } from "./auth-context"
import { useChildren } from "./children-context"
import { getAgeInMonths, getGoalsForAge } from "./caregiving-goals"
import { calculateHeightPercentile, calculateWeightPercentile } from "./growth-percentiles"

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
  error: string | null
  addLog: (type: LogType, data: Record<string, unknown>) => Promise<void>
  updateLog: (logId: string, data: Record<string, unknown>) => Promise<void>
  deleteLog: (logId: string) => Promise<void>
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !activeChild) {
      setLogs([])
      setError(null)
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
        try {
          const fetched = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<LogRecord, "id" | "createdAt">
            return {
              id: docSnap.id,
              ...data,
              createdAt: toDate((docSnap.data() as { createdAt?: unknown }).createdAt),
            }
          })
          setLogs(fetched)
          setError(null)
          setLoading(false)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load logs"
          console.error("Error processing logs snapshot:", err)
          setError(errorMessage)
          setLoading(false)
        }
      },
      (err) => {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch logs"
        console.error("Error fetching logs:", err)
        setError(errorMessage)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user, activeChild])

  const addLog = async (type: LogType, data: Record<string, unknown>) => {
    if (!user || !activeChild) {
      throw new Error("User or child not authenticated")
    }

    try {
      setError(null)
      await addDoc(collection(db, "logs"), {
        userId: user.uid,
        childId: activeChild.id,
        type,
        data,
        createdAt: Timestamp.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add log"
      console.error("Error adding log:", err)
      setError(errorMessage)
      throw err
    }
  }

  const updateLog = async (logId: string, data: Record<string, unknown>) => {
    if (!user || !activeChild) {
      throw new Error("User or child not authenticated")
    }

    try {
      setError(null)
      await updateDoc(doc(db, "logs", logId), {
        data,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update log"
      console.error("Error updating log:", err)
      setError(errorMessage)
      throw err
    }
  }

  const deleteLog = async (logId: string) => {
    if (!user || !activeChild) {
      throw new Error("User or child not authenticated")
    }

    try {
      setError(null)
      await deleteDoc(doc(db, "logs", logId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete log"
      console.error("Error deleting log:", err)
      setError(errorMessage)
      throw err
    }
  }

  const timelineEntries = useMemo<TimelineEntry[]>(() => {
    return logs.map((log) => {
      const time = formatTime(log.createdAt)
      const entry: TimelineEntry = {
        id: log.id,
        type: log.type,
        title: "",
        time,
        rawData: log.data,
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
          note,
          tags: (log.data.tags as string[]) || [],
          rawData: log.data,
        }
      })
  }, [logs])

  const growthData = useMemo<GrowthDataPoint[]>(() => {
    return logs
      .filter((log) => log.type === "growth")
      .map((log) => {
        const weight = Number(log.data.weight ?? 0)
        const height = Number(log.data.height ?? 0)
        
        let weightPercentile: number | undefined
        let heightPercentile: number | undefined
        if (activeChild?.birthDate) {
          const ageAtMeasurement = getAgeInMonths(activeChild.birthDate)
          const sex = (activeChild?.sex as "male" | "female") || "male"

          if (weight > 0) {
            weightPercentile = Math.round(calculateWeightPercentile(weight, ageAtMeasurement, sex))
          }
          if (height > 0) {
            heightPercentile = Math.round(calculateHeightPercentile(height, ageAtMeasurement, sex))
          }
        }
        
        return {
          id: log.id,
          date: formatDate(log.createdAt),
          weight,
          height,
          weightPercentile,
          heightPercentile,
          rawData: log.data,
        }
      })
      .reverse()
  }, [logs, activeChild?.birthDate, activeChild?.sex])

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
        error,
        addLog,
        updateLog,
        deleteLog,
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
