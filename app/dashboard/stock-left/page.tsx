import type { Metadata } from "next"
import DashboardShell from "@/components/dashboard-shell"
import StockLeftForm from "@/components/stock-left-form"
import { getFishTypes, initializeFishTypes } from "@/app/actions/fish-types"
import { getStockEntries } from "@/app/actions/stock-entries"
import { getLatestStockLeft } from "@/app/actions/stock-left"

export const metadata: Metadata = {
  title: "Stock Left | Fish Stock Management System",
  description: "Record remaining fish stock at the end of the day",
}

export default async function StockLeftPage() {
  // Initialize default fish types if none exist
  await initializeFishTypes()

  // Get all fish types
  const fishTypes = await getFishTypes()

  // Get all stock entries
  const stockEntries = await getStockEntries()

  // Get latest stock left
  const latestStockLeft = await getLatestStockLeft()

  // Calculate current stock for each fish type
  const currentStock = fishTypes.map((fishType) => {
    // Sum of all purchases for this fish type
    const totalPurchased = stockEntries
      .filter((entry) => entry.fishTypeId === fishType.id)
      .reduce((sum, entry) => sum + entry.weight, 0)

    // Get the latest stock left for this fish type
    const stockLeft = latestStockLeft?.stockLeft[fishType.id] || 0

    return {
      fishType,
      currentStock: stockLeft,
    }
  })

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Stock Left Entry</h1>
        <p className="text-muted-foreground">Record the remaining stock at the end of the day to calculate sales.</p>
        <StockLeftForm stockItems={currentStock} />
      </div>
    </DashboardShell>
  )
}
