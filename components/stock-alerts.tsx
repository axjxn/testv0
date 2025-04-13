import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"
import type { StockEntry, FishType } from "@/types/stock"
import { differenceInDays } from "date-fns"

interface StockAlertsProps {
  stockEntries: StockEntry[]
  fishTypes: FishType[]
}

export default function StockAlerts({ stockEntries, fishTypes }: StockAlertsProps) {
  // Group entries by fish type
  const entriesByType = stockEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.fishTypeId]) {
        acc[entry.fishTypeId] = []
      }
      acc[entry.fishTypeId].push(entry)
      return acc
    },
    {} as Record<string, StockEntry[]>,
  )

  // Calculate age for each fish type
  const alerts = fishTypes.map((fishType) => {
    const entries = entriesByType[fishType.id] || []

    if (entries.length === 0) {
      return {
        item: fishType.name,
        age: 0,
        status: "success" as const,
      }
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp)
    const latestEntry = sortedEntries[0]

    // Calculate age in days
    const age = differenceInDays(new Date(), new Date(latestEntry.date))

    let status: "success" | "warning" | "danger" = "success"
    if (age >= 3) {
      status = "danger"
    } else if (age >= 2) {
      status = "warning"
    }

    return {
      item: fishType.name,
      age,
      status,
    }
  })

  // Sort alerts by age (oldest first)
  const sortedAlerts = [...alerts].sort((a, b) => b.age - a.age).slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Stock Alerts</CardTitle>
        <CardDescription>Stock aging and warnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {sortedAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${
                    alert.status === "danger"
                      ? "text-rose-500"
                      : alert.status === "warning"
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                />
                <span className="text-sm font-medium">{alert.item}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {alert.age} day{alert.age !== 1 ? "s" : ""}
                </span>
                <Badge
                  variant={
                    alert.status === "danger" ? "destructive" : alert.status === "warning" ? "outline" : "default"
                  }
                  className="ml-2"
                >
                  {alert.status === "danger" ? "Urgent" : alert.status === "warning" ? "Moderate" : "Fresh"}
                </Badge>
              </div>
            </div>
          ))}

          {sortedAlerts.length === 0 && <div className="text-center text-muted-foreground py-4">No stock alerts</div>}
        </div>
      </CardContent>
    </Card>
  )
}
