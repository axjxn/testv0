"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface StockChartProps {
  title: string
  description?: string
}

export default function StockChart({ title, description = "Last 7 days" }: StockChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Sample data
    const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Different data based on chart type
    const data =
      title === "Stock Movement"
        ? {
            labels,
            datasets: [
              {
                label: "Opening Stock",
                data: [120, 110, 125, 130, 115, 105, 125],
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
              },
              {
                label: "Closing Stock",
                data: [110, 125, 130, 115, 105, 125, 80],
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgb(16, 185, 129)",
                borderWidth: 1,
              },
            ],
          }
        : {
            labels,
            datasets: [
              {
                label: "Purchases (kg)",
                data: [50, 65, 55, 40, 70, 60, 75],
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
              },
              {
                label: "Sales (kg)",
                data: [60, 50, 50, 55, 80, 40, 120],
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgb(239, 68, 68)",
                borderWidth: 1,
              },
            ],
          }

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: title === "Stock Movement" ? "line" : "bar",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [title])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
