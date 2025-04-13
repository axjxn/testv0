import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Package } from "lucide-react"

interface StockOverviewProps {
  openingStock: number
  newPurchases: number
  estimatedSales: number
  currentStock: number
}

export default function StockOverview({
  openingStock,
  newPurchases,
  estimatedSales,
  currentStock,
}: StockOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Stock Overview</CardTitle>
        <CardDescription>Today's stock summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Opening Stock</span>
            </div>
            <span className="text-sm font-medium">{openingStock.toFixed(2)} kg</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">New Purchases</span>
            </div>
            <span className="text-sm font-medium">{newPurchases.toFixed(2)} kg</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-medium">Estimated Sales</span>
            </div>
            <span className="text-sm font-medium">{estimatedSales.toFixed(2)} kg</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Current Stock</span>
            </div>
            <span className="text-sm font-medium">{currentStock.toFixed(2)} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
