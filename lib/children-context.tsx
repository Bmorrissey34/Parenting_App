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
  getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'

export interface Child {
  id: string
  userId: string
  name: string
  birthDate?: string
  createdAt: string
}

interface ChildrenContextType {
  children: Child[]
  loading: boolean
  activeChild: Child | null
  setActiveChild: (child: Child) => void
  addChild: (name: string, birthDate?: string) => Promise<void>
  deleteChild: (childId: string) => Promise<void>
}

const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined)

export function ChildrenProvider({ children: childrenComponents }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [activeChild, setActiveChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  // Real-time listener for children
  useEffect(() => {
    if (!user) {
      setChildren([])
      setActiveChild(null)
      setLoading(false)
      return
    }

    const childrenRef = collection(db, 'children')
    const q = query(childrenRef, where('userId', '==', user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedChildren = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          name: doc.data().name,
          birthDate: doc.data().birthDate,
          createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        }))
        setChildren(fetchedChildren)
        
        // Set active child to first one if not already set
        if (fetchedChildren.length > 0 && !activeChild) {
          setActiveChild(fetchedChildren[0])
        } else if (activeChild && !fetchedChildren.find(c => c.id === activeChild.id)) {
          // If active child was deleted, switch to first available
          setActiveChild(fetchedChildren[0] || null)
        }
        
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching children:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user, activeChild])

  const addChild = useCallback(
    async (name: string, birthDate?: string) => {
      if (!user) return

      try {
        const childrenRef = collection(db, 'children')
        const newChild = await addDoc(childrenRef, {
          userId: user.uid,
          name,
          birthDate: birthDate || null,
          createdAt: Timestamp.now(),
        })
        
        // Set as active child if it's the first one
        if (children.length === 0) {
          setActiveChild({
            id: newChild.id,
            userId: user.uid,
            name,
            birthDate,
            createdAt: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Failed to add child:', err)
      }
    },
    [user, children.length]
  )

  const deleteChild = useCallback(
    async (childId: string) => {
      if (!user) return

      try {
        await deleteDoc(doc(db, 'children', childId))
        if (activeChild?.id === childId) {
          setActiveChild(children.find(c => c.id !== childId) || null)
        }
      } catch (err) {
        console.error('Failed to delete child:', err)
      }
    },
    [user, activeChild, children]
  )

  return (
    <ChildrenContext.Provider value={{ children, loading, activeChild, setActiveChild, addChild, deleteChild }}>
      {childrenComponents}
    </ChildrenContext.Provider>
  )
}

export function useChildren() {
  const context = useContext(ChildrenContext)
  if (!context) {
    throw new Error('useChildren must be used within ChildrenProvider')
  }
  return context
}
