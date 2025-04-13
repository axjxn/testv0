"use server"

import { revalidatePath } from "next/cache"
import { redis, KEYS, generateId } from "@/lib/redis"
import type { StockEntry } from "@/types/stock"
import { getFishTypes } from "./fish-types"

// Add a new stock entry
export async function addStockEntry(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const fishTypeId = formData.get("fishType") as string
    const weight = Number.parseFloat(formData.get("weight") as string)
    const rate = Number.parseFloat(formData.get("rate") as string)
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const supplier = formData.get("supplier") as string
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!fishTypeId || isNaN(weight) || isNaN(rate) || !date || !time) {
      return { success: false, message: "Missing required fields" }
    }

    // Get fish type name
    const fishTypes = await getFishTypes()
    const fishType = fishTypes.find((type) => type.id === fishTypeId)

    if (!fishType) {
      return { success: false, message: "Invalid fish type" }
    }

    const id = generateId()
    const timestamp = new Date(`${date}T${time}`).getTime()
    const batchId = `${fishTypeId}-${Date.now()}`

    const entry: StockEntry = {
      id,
      fishTypeId,
      fishTypeName: fishType.name,
      weight,
      rate,
      date,
      time,
      timestamp,
      supplier: supplier || undefined,
      notes: notes || undefined,
      batchId,
    }

    // Add to Redis list
    await redis.lpush(`${KEYS.STOCK_ENTRIES}`, entry)

    revalidatePath("/dashboard")
    return { success: true, message: `Added ${weight}kg of ${fishType.name} at ₹${rate}/kg` }
  } catch (error) {
    console.error("Error adding stock entry:", error)
    return { success: false, message: "Failed to add stock entry" }
  }
}

// Get all stock entries
export async function getStockEntries(): Promise<StockEntry[]> {
  try {
    const entries = await redis.lrange(`${KEYS.STOCK_ENTRIES}`, 0, -1)
    return entries
  } catch (error) {
    console.error("Error fetching stock entries:", error)
    return []
  }
}

// Get stock entries for a specific date
export async function getStockEntriesByDate(date: string): Promise<StockEntry[]> {
  try {
    const allEntries = await getStockEntries()
    return allEntries.filter((entry) => entry.date === date)
  } catch (error) {
    console.error("Error fetching stock entries by date:", error)
    return []
  }
}

// Get stock entries for a date range
export async function getStockEntriesByDateRange(startDate: string, endDate: string): Promise<StockEntry[]> {
  try {
    const allEntries = await getStockEntries()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    return allEntries.filter((entry) => {
      const entryTime = new Date(entry.date).getTime()
      return entryTime >= start && entryTime <= end
    })
  } catch (error) {
    console.error("Error fetching stock entries by date range:", error)
    return []
  }
}
