"use server"

import { revalidatePath } from "next/cache"
import { redis, KEYS, generateId } from "@/lib/redis"
import type { StockLeft } from "@/types/stock"

// Add a new stock left entry
export async function addStockLeft(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const notes = formData.get("notes") as string

    // Extract stock left values
    const stockLeft: Record<string, number> = {}

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("stockLeft.")) {
        const fishTypeId = key.replace("stockLeft.", "")
        stockLeft[fishTypeId] = Number.parseFloat(value as string) || 0
      }
    }

    const id = generateId()
    const timestamp = new Date(`${date}T${time}`).getTime()

    const entry: StockLeft = {
      id,
      date,
      time,
      timestamp,
      stockLeft,
      notes: notes || undefined,
    }

    // Add to Redis list
    await redis.lpush(`${KEYS.STOCK_LEFT}`, entry)

    // Calculate total stock left
    const totalStockLeft = Object.values(stockLeft).reduce((sum, value) => sum + value, 0)

    revalidatePath("/dashboard")
    return { success: true, message: `Recorded ${totalStockLeft}kg of remaining stock` }
  } catch (error) {
    console.error("Error adding stock left entry:", error)
    return { success: false, message: "Failed to record end of day stock" }
  }
}

// Get all stock left entries
export async function getStockLeftEntries(): Promise<StockLeft[]> {
  try {
    const entries = await redis.lrange(`${KEYS.STOCK_LEFT}`, 0, -1)
    return entries
  } catch (error) {
    console.error("Error fetching stock left entries:", error)
    return []
  }
}

// Get the most recent stock left entry
export async function getLatestStockLeft(): Promise<StockLeft | null> {
  try {
    const entries = await getStockLeftEntries()
    if (entries.length === 0) return null

    // Sort by timestamp in descending order and get the first one
    return entries.sort((a, b) => b.timestamp - a.timestamp)[0]
  } catch (error) {
    console.error("Error fetching latest stock left:", error)
    return null
  }
}

// Get stock left for a specific date
export async function getStockLeftByDate(date: string): Promise<StockLeft | null> {
  try {
    const entries = await getStockLeftEntries()
    return entries.find((entry) => entry.date === date) || null
  } catch (error) {
    console.error("Error fetching stock left by date:", error)
    return null
  }
}
