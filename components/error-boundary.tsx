"use client"

import React, { Component, ReactNode } from "react"
import { AlertCircle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 mt-0.5">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold text-foreground">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="bg-secondary/50 border border-border rounded p-2 max-h-32 overflow-auto">
                <code className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                  {this.state.error?.stack}
                </code>
              </div>
            )}

            <Button
              onClick={this.resetError}
              className="w-full"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
