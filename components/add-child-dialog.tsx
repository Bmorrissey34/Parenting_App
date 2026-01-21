"use client"

import { useState } from "react"
import { useChildren } from "@/lib/children-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function AddChildDialog() {
  const { addChild } = useChildren()
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

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
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-9 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Another Child</DialogTitle>
          <DialogDescription>
            Enter your child's information
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

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button className="flex-1" type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Child"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
