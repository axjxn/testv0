import type { Metadata } from "next"
import DashboardShell from "@/components/dashboard-shell"
import StockOverview from "@/components/stock-overview"
import StockAlerts from "@/components/stock-alerts"
import RecentActivity from "@/components/recent-activity"
import StockChart from "@/components/stock-chart"
import { getFishTypes, initializeFishTypes } from "@/app/actions/fish-types"
import { getStockEntries } from "@/app/actions/stock-entries"
import { getLatestStockLeft } from "@/app/actions/stock-left"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "Dashboard | Fish Stock Management System",
  description: "Monitor and manage your fish stock inventory",
}

export default async function DashboardPage() {
  // Initialize default fish types if none exist
  await initializeFishTypes()

  // Get all fish types
  const fishTypes = await getFishTypes()

  // Get all stock entries
  const stockEntries = await getStockEntries()

  // Get latest stock left
  const latestStockLeft = await getLatestStockLeft()

  // Calculate today's data
  const today = format(new Date(), "yyyy-MM-dd")
  const todayEntries = stockEntries.filter((entry) => entry.date === today)

  // Calculate total purchases for today
  const todayPurchases = todayEntries.reduce((sum, entry) => sum + entry.weight, 0)

  // Calculate opening stock (previous day's closing stock)
  const openingStock = latestStockLeft
    ? Object.values(latestStockLeft.stockLeft).reduce((sum, value) => sum + value, 0)
    : 0

  // Calculate estimated sales
  const estimatedSales =
    openingStock +
    todayPurchases -
    (latestStockLeft ? Object.values(latestStockLeft.stockLeft).reduce((sum, value) => sum + value, 0) : 0)

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StockOverview
            openingStock={openingStock}
            newPurchases={todayPurchases}
            estimatedSales={estimatedSales > 0 ? estimatedSales : 0}
            currentStock={
              latestStockLeft ? Object.values(latestStockLeft.stockLeft).reduce((sum, value) => sum + value, 0) : 0
            }
          />
          <StockAlerts stockEntries={stockEntries} fishTypes={fishTypes} />
          <RecentActivity stockEntries={stockEntries} stockLeftEntries={[latestStockLeft].filter(Boolean)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <StockChart title="Stock Movement" />
          <StockChart title="Purchase vs. Sales" />
        </div>
      </div>
    </DashboardShell>
  )
}
