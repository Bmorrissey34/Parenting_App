"use client"

import { useState, useEffect } from "react"
import { useChildren } from "@/lib/children-context"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Baby } from "lucide-react"

export function FirstChildSetup() {
  const { user, loading: authLoading } = useAuth()
  const { children, loading: childrenLoading, addChild } = useChildren()
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Open dialog on first login when no children exist
  useEffect(() => {
    if (!authLoading && !childrenLoading && user && children.length === 0) {
      setIsOpen(true)
    }
  }, [authLoading, childrenLoading, user, children.length])

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childName.trim()) {
      setError("Please enter your child's name")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await addChild(childName, birthDate || undefined)
      setIsOpen(false)
      setChildName("")
      setBirthDate("")
    } catch (err) {
      setError((err as Error).message || "Failed to add child")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Baby className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Welcome to Nurture!</DialogTitle>
          <DialogDescription className="text-center">
            Let's add your first child to get started
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddChild} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="childName" className="text-sm font-medium">
              Child's Name *
            </Label>
            <Input
              id="childName"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g., Emma"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium">
              Birth Date (optional)
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-10"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full h-10" type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Child"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
