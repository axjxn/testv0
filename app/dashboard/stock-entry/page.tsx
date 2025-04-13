import type { Metadata } from "next"
import DashboardShell from "@/components/dashboard-shell"
import StockEntryForm from "@/components/stock-entry-form"
import { getFishTypes, initializeFishTypes } from "@/app/actions/fish-types"

export const metadata: Metadata = {
  title: "Stock Entry | Fish Stock Management System",
  description: "Record new fish stock purchases",
}

export default async function StockEntryPage() {
  // Initialize default fish types if none exist
  await initializeFishTypes()

  // Get all fish types
  const fishTypes = await getFishTypes()

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Stock Entry</h1>
        <p className="text-muted-foreground">Record new fish stock purchases as they happen throughout the day.</p>
        <StockEntryForm fishTypes={fishTypes} />
      </div>
    </DashboardShell>
  )
}
