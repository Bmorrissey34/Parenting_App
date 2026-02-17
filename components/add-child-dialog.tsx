"use client"

import { useState } from "react"
import { useChildren } from "@/lib/children-context"
import { useToast } from "@/hooks/use-toast"
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
import { Plus, AlertCircle } from "lucide-react"

export function AddChildDialog() {
  const { addChild } = useChildren()
  const { toast } = useToast()
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [sex, setSex] = useState<"male" | "female" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!childName.trim()) {
      setError("Please enter your child's name")
      toast({
        title: "Validation Error",
        description: "Please enter your child's name",
        variant: "destructive",
      })
      return
    }

    // Validate birth date format if provided
    if (birthDate && isNaN(new Date(birthDate).getTime())) {
      setError("Please enter a valid birth date")
      toast({
        title: "Validation Error",
        description: "Please enter a valid birth date",
        variant: "destructive",
      })
      return
    }

    // Ensure birth date is not in the future
    if (birthDate && new Date(birthDate) > new Date()) {
      setError("Birth date cannot be in the future")
      toast({
        title: "Validation Error",
        description: "Birth date cannot be in the future",
        variant: "destructive",
      })
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await addChild(
        childName,
        birthDate || undefined,
        sex ? (sex as "male" | "female") : undefined
      )
      setIsOpen(false)
      setChildName("")
      setBirthDate("")
      setSex("")
      toast({
        title: "Success",
        description: "Child profile created successfully",
      })
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to add child"
      setError(errorMessage)
      console.error("Error adding child:", err)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">Sex (optional)</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="male"
                  checked={sex === "male"}
                  onChange={(e) => setSex(e.target.value as "male")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="female"
                  checked={sex === "female"}
                  onChange={(e) => setSex(e.target.value as "female")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Female</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

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
