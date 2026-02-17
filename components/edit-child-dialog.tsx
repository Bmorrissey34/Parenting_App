"use client"

import { useState, useEffect } from "react"
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
import { Child } from "@/lib/children-context"

interface EditChildDialogProps {
  child: Child
  children: React.ReactNode
}

export function EditChildDialog({ child, children: trigger }: EditChildDialogProps) {
  const { editChild } = useChildren()
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [sex, setSex] = useState<"male" | "female" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (child) {
      setChildName(child.name)
      setBirthDate(child.birthDate || "")
      setSex(child.sex || "")
    }
  }, [child])

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childName.trim()) {
      setError("Please enter your child's name")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await editChild(child.id, {
        name: childName,
        birthDate: birthDate || undefined,
        sex: sex ? (sex as "male" | "female") : undefined,
      })
      setIsOpen(false)
    } catch (err) {
      setError((err as Error).message || "Failed to edit child")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Child</DialogTitle>
          <DialogDescription>
            Update your child's information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditChild} className="space-y-4">
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
