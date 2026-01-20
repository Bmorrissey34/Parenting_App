'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { TimelineEntry } from '@/components/daily-timeline'
import { DiaryEntry } from '@/components/diary-journal'
import { GrowthDataPoint } from '@/components/growth-chart'
import { useAuth } from './auth-context'

export type LogType = 'feeding' | 'sleep' | 'play' | 'growth' | 'diary'

interface LogEntry {
  id: string
  userId: string
  type: LogType
  timestamp: string
  data: Record<string, unknown>
}

interface LogsContextType {
  logs: LogEntry[]
  loading: boolean
  addLog: (type: LogType, data: Record<string, unknown>) => Promise<void>
  deleteLog: (logId: string) => Promise<void>
  timelineEntries: TimelineEntry[]
  diaryEntries: DiaryEntry[]
  growthData: GrowthDataPoint[]
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time listener for logs
  useEffect(() => {
    if (!user) {
      setLogs([])
      setLoading(false)
      return
    }

    const logsRef = collection(db, 'logs')
    const q = query(logsRef, where('userId', '==', user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          type: doc.data().type as LogType,
          timestamp: doc.data().timestamp?.toDate?.().toISOString() || new Date().toISOString(),
          data: doc.data().data,
        }))
        setLogs(fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching logs:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  const addLog = useCallback(
    async (type: LogType, data: Record<string, unknown>) => {
      if (!user) return

      try {
        const logsRef = collection(db, 'logs')
        await addDoc(logsRef, {
          userId: user.uid,
          type,
          data,
          timestamp: Timestamp.now(),
        })
      } catch (err) {
        console.error('Failed to add log:', err)
      }
    },
    [user]
  )

  const deleteLog = useCallback(
    async (logId: string) => {
      if (!user) return

      try {
        await deleteDoc(doc(db, 'logs', logId))
      } catch (err) {
        console.error('Failed to delete log:', err)
      }
    },
    [user]
  )

  // Convert logs to timeline entries
  const timelineEntries: TimelineEntry[] = logs
    .filter((log) => ['sleep', 'feeding', 'play', 'diary'].includes(log.type))
    .map((log) => {
      const timestamp = new Date(log.timestamp)
      const time = timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })

      switch (log.type) {
        case 'sleep':
          return {
            id: log.id,
            type: 'sleep',
            title: 'Sleep',
            time,
            details: `${log.data.duration || 'N/A'} minutes`,
          }
        case 'feeding':
          return {
            id: log.id,
            type: 'feeding',
            title: 'Feeding',
            time,
            details: `${log.data.amount || 0}ml`,
          }
        case 'play':
          return {
            id: log.id,
            type: 'play',
            title: 'Play Time',
            time,
            details: log.data.presenceMode ? 'Presence Mode' : 'Regular play',
          }
        case 'diary':
          return {
            id: log.id,
            type: 'diary',
            title: (log.data.note as string) || 'Diary Entry',
            time,
            tags: (log.data.tags as string[]) || [],
          }
        default:
          return null!
      }
    })
    .filter(Boolean)

  // Convert logs to diary entries
  const diaryEntries: DiaryEntry[] = logs
    .filter((log) => log.type === 'diary')
    .map((log) => ({
      id: log.id,
      date: new Date(log.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      title: (log.data.note as string)?.split('\n')[0] || 'Untitled',
      preview: (log.data.note as string) || '',
      tags: (log.data.tags as string[]) || [],
    }))

  // Convert logs to growth data
  const growthData: GrowthDataPoint[] = logs
    .filter((log) => log.type === 'growth')
    .map((log) => ({
      date: new Date(log.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      weight: log.data.weight as number,
      height: log.data.height as number,
    }))

  return (
    <LogsContext.Provider
      value={{
        logs,
        loading,
        addLog,
        deleteLog,
        timelineEntries,
        diaryEntries,
        growthData,
      }}
    >
      {children}
    </LogsContext.Provider>
  )
}

export function useLogs() {
  const context = useContext(LogsContext)
  if (!context) {
    throw new Error('useLogs must be used within LogsProvider')
  }
  return context
}
