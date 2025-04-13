"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowUpDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { StockEntry, StockLeft } from "@/types/stock"
import { differenceInDays } from "date-fns"

interface StockReportTableProps {
  stockEntries: StockEntry[]
  stockLeftEntries: StockLeft[]
}

interface ReportRow {
  id: string
  date: string
  fishType: string
  openingStock: number
  purchases: number
  sales: number
  closingStock: number
  purchaseRate: number
  totalCost: number
  age: number
}

export default function StockReportTable({ stockEntries, stockLeftEntries }: StockReportTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Generate report data
  const reportData: ReportRow[] = stockEntries.map((entry) => {
    // Find stock left entry for this date
    const stockLeft = stockLeftEntries.find((sl) => sl.date === entry.date)

    // Calculate opening stock (previous day's closing stock)
    const previousDayStockLeft = stockLeftEntries
      .filter((sl) => new Date(sl.date) < new Date(entry.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const openingStock = previousDayStockLeft ? previousDayStockLeft.stockLeft[entry.fishTypeId] || 0 : 0

    // Calculate purchases for this fish type on this date
    const purchases = stockEntries
      .filter((e) => e.date === entry.date && e.fishTypeId === entry.fishTypeId)
      .reduce((sum, e) => sum + e.weight, 0)

    // Calculate closing stock
    const closingStock = stockLeft ? stockLeft.stockLeft[entry.fishTypeId] || 0 : 0

    // Calculate sales
    const sales = openingStock + purchases - closingStock

    // Calculate age
    const age = differenceInDays(new Date(), new Date(entry.date))

    return {
      id: entry.id,
      date: entry.date,
      fishType: entry.fishTypeName,
      openingStock,
      purchases,
      sales: sales > 0 ? sales : 0,
      closingStock,
      purchaseRate: entry.rate,
      totalCost: entry.rate * entry.weight,
      age,
    }
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedData = [...reportData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                Date
                {sortColumn === "date" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("fishType")}>
                Fish Type
                {sortColumn === "fishType" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="text-right">Opening Stock (kg)</TableHead>
              <TableHead className="text-right">Purchases (kg)</TableHead>
              <TableHead className="text-right">Sales (kg)</TableHead>
              <TableHead className="text-right">Closing Stock (kg)</TableHead>
              <TableHead className="text-right">Rate (₹/kg)</TableHead>
              <TableHead className="text-right">Total Cost (₹)</TableHead>
              <TableHead>Stock Age</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.fishType}</TableCell>
                <TableCell className="text-right">{row.openingStock.toFixed(2)}</TableCell>
                <TableCell className="text-right">{row.purchases.toFixed(2)}</TableCell>
                <TableCell className="text-right">{row.sales.toFixed(2)}</TableCell>
                <TableCell className="text-right">{row.closingStock.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{row.purchaseRate.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{row.totalCost.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.age >= 3 ? "destructive" : row.age >= 2 ? "outline" : row.age >= 1 ? "secondary" : "default"
                    }
                  >
                    {row.age === 0 ? "Fresh" : row.age === 1 ? "1 day" : `${row.age} days`}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
