import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import type { StockEntry, StockLeft } from "@/types/stock"

interface RecentActivityProps {
  stockEntries: StockEntry[]
  stockLeftEntries: StockLeft[]
}

export default function RecentActivity({ stockEntries, stockLeftEntries }: RecentActivityProps) {
  // Combine stock entries and stock left entries
  const allActivities = [
    ...stockEntries.map((entry) => ({
      type: "entry" as const,
      data: entry,
      timestamp: entry.timestamp,
    })),
    ...stockLeftEntries.map((entry) => ({
      type: "left" as const,
      data: entry,
      timestamp: entry.timestamp,
    })),
  ]

  // Sort by timestamp (newest first)
  const sortedActivities = allActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Latest stock transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {sortedActivities.map((activity, index) => (
            <div key={index} className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{activity.type === "entry" ? "Stock Entry" : "Stock Left"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {activity.type === "entry" ? (
                  <span>
                    {activity.data.fishTypeName} • {activity.data.weight.toFixed(2)} kg
                  </span>
                ) : (
                  <span>
                    End of Day •{" "}
                    {Object.values(activity.data.stockLeft)
                      .reduce((sum, value) => sum + value, 0)
                      .toFixed(2)}{" "}
                    kg
                  </span>
                )}
                {activity.type === "entry" && <span>₹{activity.data.rate}/kg</span>}
              </div>
            </div>
          ))}

          {sortedActivities.length === 0 && (
            <div className="text-center text-muted-foreground py-4">No recent activity</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
