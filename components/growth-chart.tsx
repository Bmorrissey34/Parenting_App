"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Scale, Ruler } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts"

export interface GrowthDataPoint {
  date: string
  weight?: number
  height?: number
  percentile?: number
}

interface GrowthChartProps {
  data: GrowthDataPoint[]
  currentWeight?: number
  currentHeight?: number
}

export function GrowthChart({ data, currentWeight, currentHeight }: GrowthChartProps) {
  const [activeMetric, setActiveMetric] = useState<"weight" | "height">("weight")

  const chartConfig = {
    weight: {
      label: "Weight",
      unit: "kg",
      color: "oklch(0.72 0.12 145)",
      icon: Scale
    },
    height: {
      label: "Height",
      unit: "cm",
      color: "oklch(0.70 0.15 220)",
      icon: Ruler
    }
  }

  const config = chartConfig[activeMetric]
  const Icon = config.icon

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Growth Tracker
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={activeMetric === "weight" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setActiveMetric("weight")}
            >
              <Scale className="w-3 h-3 mr-1" />
              Weight
            </Button>
            <Button
              variant={activeMetric === "height" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setActiveMetric("height")}
            >
              <Ruler className="w-3 h-3 mr-1" />
              Height
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Current Stats */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
            <p className="text-xl font-semibold text-foreground mt-1">
              {activeMetric === "weight" ? currentWeight : currentHeight}
              <span className="text-sm font-normal text-muted-foreground ml-1">{config.unit}</span>
            </p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-3" />
              <span className="text-xs text-muted-foreground">Percentile</span>
            </div>
            <p className="text-xl font-semibold text-foreground mt-1">
              75<span className="text-sm font-normal text-muted-foreground ml-1">th</span>
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="oklch(0.25 0.01 260)" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: "oklch(0.60 0.02 260)" }}
                axisLine={{ stroke: "oklch(0.25 0.01 260)" }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "oklch(0.60 0.02 260)" }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.008 260)",
                  border: "1px solid oklch(0.25 0.01 260)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                }}
                labelStyle={{ color: "oklch(0.95 0.01 260)", fontWeight: 500 }}
                itemStyle={{ color: config.color }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke="transparent"
                fill="url(#colorGradient)"
              />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: config.color }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
