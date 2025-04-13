"use server"

import { revalidatePath } from "next/cache"
import { redis, KEYS, generateId } from "@/lib/redis"
import type { FishType } from "@/types/stock"

// Get all fish types
export async function getFishTypes(): Promise<FishType[]> {
  try {
    const fishTypes = await redis.hgetall(KEYS.FISH_TYPES)
    return Object.values(fishTypes || {})
  } catch (error) {
    console.error("Error fetching fish types:", error)
    return []
  }
}

// Add a new fish type
export async function addFishType(name: string): Promise<FishType | null> {
  try {
    const id = generateId()
    const fishType: FishType = { id, name }
    await redis.hset(KEYS.FISH_TYPES, { [id]: fishType })
    revalidatePath("/dashboard")
    return fishType
  } catch (error) {
    console.error("Error adding fish type:", error)
    return null
  }
}

// Initialize default fish types if none exist
export async function initializeFishTypes() {
  const existingTypes = await getFishTypes()

  if (existingTypes.length === 0) {
    const defaultTypes = [
      "Mathi Small",
      "Mathi Large",
      "Sardine Small",
      "Sardine Large",
      "Tuna Fillet",
      "King Fish",
      "Prawns",
    ]

    for (const name of defaultTypes) {
      await addFishType(name)
    }
  }
}
