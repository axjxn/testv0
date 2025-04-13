import type { Metadata } from "next"
import DashboardShell from "@/components/dashboard-shell"
import ReportFilters from "@/components/report-filters"
import StockReportTable from "@/components/stock-report-table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { getStockEntries } from "@/app/actions/stock-entries"
import { getStockLeftEntries } from "@/app/actions/stock-left"

export const metadata: Metadata = {
  title: "Reports | Fish Stock Management System",
  description: "View and export stock reports",
}

export default async function ReportsPage() {
  // Get all stock entries
  const stockEntries = await getStockEntries()

  // Get all stock left entries
  const stockLeftEntries = await getStockLeftEntries()

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Stock Reports</h1>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        <ReportFilters />
        <StockReportTable stockEntries={stockEntries} stockLeftEntries={stockLeftEntries} />
      </div>
    </DashboardShell>
  )
}
