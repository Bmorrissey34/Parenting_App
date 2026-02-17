"use client"

import { useState } from "react"
import { ParentingRings } from "@/components/parenting-rings"
import { DailyTimeline } from "@/components/daily-timeline"
import { GrowthChart } from "@/components/growth-chart"
import { DiaryJournal } from "@/components/diary-journal"
import { AgesStages } from "@/components/ages-stages"
import { PresenceMode } from "@/components/presence-mode"
import { LogDrawer } from "@/components/log-drawer"
import { BottomNav } from "@/components/bottom-nav"
import { FirstChildSetup } from "@/components/first-child-setup"
import { EditChildDialog } from "@/components/edit-child-dialog"
import { Baby, Bell, LogOut, Check, ChevronDown, Pencil, Trash2, Settings, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useChildren } from "@/lib/children-context"
import { useLogs } from "@/lib/logs-context"
import { useToast } from "@/hooks/use-toast"

// Login form component
function LoginForm() {
  const { login, signup, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!email.trim()) {
      setError("Please enter your email")
      toast({
        title: "Validation Error",
        description: "Please enter your email",
        variant: "destructive",
      })
      return
    }

    if (!password.trim()) {
      setError("Please enter your password")
      toast({
        title: "Validation Error",
        description: "Please enter your password",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setError("")
    setIsLoading(true)

    try {
      if (isSignup) {
        await signup(email, password)
        toast({
          title: "Success",
          description: "Account created successfully!",
        })
      } else {
        await login(email, password)
        toast({
          title: "Success",
          description: "Logged in successfully!",
        })
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "Authentication failed"
      setError(errorMessage)
      console.error("Auth error:", err)
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)
    try {
      await loginWithGoogle()
      toast({
        title: "Success",
        description: "Signed in with Google!",
      })
    } catch (err) {
      const errorMessage = (err as Error).message || "Google sign-in failed"
      setError(errorMessage)
      console.error("Google auth error:", err)
      toast({
        title: "Google Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
            <Baby className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Nurture</h1>
          <p className="text-sm text-muted-foreground">
            {isSignup ? "Create an account" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button className="w-full h-10 rounded-lg" type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="secondary" 
          className="w-full h-10 rounded-lg"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>

        <button
          onClick={() => {
            setIsSignup(!isSignup)
            setError("")
          }}
          className="w-full text-sm text-center text-muted-foreground hover:text-foreground"
        >
          {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { children, activeChild, setActiveChild, loading: childrenLoading, deleteChild } = useChildren()
  const { timelineEntries, diaryEntries, growthData, loading: logsLoading, sleepProgress, feedingProgress, presenceProgress, sleepGoal, feedingGoal, presenceGoal, sleepCount, feedingCount, presenceCount, deleteLog } = useLogs()
  const [activeTab, setActiveTab] = useState("home")
  const handleDeleteChild = async (childId: string) => {
    const confirmed = window.confirm("Delete this child profile?")
    if (!confirmed) return
    await deleteChild(childId)
  }

  const handleDeleteLog = async (logId?: string) => {
    if (!logId) return
    const confirmed = window.confirm("Delete this measurement?")
    if (!confirmed) return
    await deleteLog(logId)
  }

  if (authLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Parenting Rings */}
            <section className="pt-2">
              <ParentingRings
                sleepProgress={sleepProgress}
                feedingProgress={feedingProgress}
                presenceProgress={presenceProgress}
                sleepGoal={sleepGoal}
                feedingGoal={feedingGoal}
                presenceGoal={presenceGoal}
                sleepCount={sleepCount}
                feedingCount={feedingCount}
                presenceCount={presenceCount}
              />
            </section>

            {/* Presence Mode Card */}
            <section>
              <PresenceMode />
            </section>

            {/* Daily Timeline */}
            <section>
              <DailyTimeline entries={timelineEntries} />
            </section>
          </div>
        )

      case "growth":
        return (
          <div className="space-y-6">
            <GrowthChart
              data={growthData}
              currentWeight={growthData[growthData.length - 1]?.weight || 0}
              currentHeight={growthData[growthData.length - 1]?.height || 0}
              currentWeightPercentile={growthData[growthData.length - 1]?.weightPercentile}
              currentHeightPercentile={growthData[growthData.length - 1]?.heightPercentile}
            />
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">Recent Measurements</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground">Last Weight</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {growthData[growthData.length - 1]?.weight || "-"}{" "}
                    <span className="text-sm font-normal text-muted-foreground">kg</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground">Last Height</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {growthData[growthData.length - 1]?.height || "-"}{" "}
                    <span className="text-sm font-normal text-muted-foreground">cm</span>
                  </p>
                </div>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">Measurement Log</h3>
              <div className="space-y-2">
                {growthData.slice(-5).reverse().map((entry) => {
                  const logId = entry.id
                  return (
                  <div key={entry.id ?? entry.date} className="flex items-center justify-between p-3 rounded-2xl bg-card/50 border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.weight ?? "-"} kg · {entry.height ?? "-"} cm
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {logId && (
                        <LogDrawer
                          trigger={
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          }
                          initialLog={{
                            id: logId,
                            type: "growth",
                            data: entry.rawData ?? { weight: entry.weight ?? 0, height: entry.height ?? 0 },
                          }}
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => handleDeleteLog(logId)}
                        disabled={!logId}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </section>
          </div>
        )

      case "diary":
        return (
          <div className="space-y-6">
            <DiaryJournal entries={diaryEntries} />
          </div>
        )

      case "discover":
        return (
          <div className="space-y-6">
            <AgesStages />
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">Tips for Today</h3>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <h4 className="text-sm font-semibold text-foreground mb-2">Tummy Time Tip</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try placing a colorful toy just out of reach during tummy time. This encourages your baby to lift their head and eventually reach for the toy, strengthening their neck and arm muscles.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-ring-feeding/20 to-ring-feeding/5 border border-ring-feeding/30">
                <h4 className="text-sm font-semibold text-foreground mb-2">Sleep Schedule</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  At 4-6 months, most babies need 14-16 hours of sleep per day, including 2-3 naps. Watch for sleep cues like yawning and eye rubbing.
                </p>
              </div>
            </section>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center group">
            {children.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h1 className="text-sm font-semibold text-foreground">{activeChild?.name || "My Child"}</h1>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {children.map((child) => (
                  <div key={child.id} className="group flex items-center">
                    <DropdownMenuItem
                      onClick={() => setActiveChild(child)}
                      className="cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span>{child.name}</span>
                      {activeChild?.id === child.id && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="mr-1 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <EditChildDialog child={child}>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                          >
                            Edit Profile
                          </DropdownMenuItem>
                        </EditChildDialog>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          variant="destructive"
                          onClick={() => handleDeleteChild(child.id)}
                        >
                          Delete Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Baby className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">{activeChild?.name || "My Child"}</h1>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              onClick={logout}
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 max-w-md mx-auto">
        {logsLoading ? (
          <p className="text-center text-muted-foreground">Loading your data...</p>
        ) : (
          renderContent()
        )}
      </div>

      {/* Log Button */}
      <LogDrawer />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* First Child Setup Modal */}
      <FirstChildSetup />
    </main>
  )
}
