import { Redis } from "@upstash/redis"

// Create a Redis client using environment variables
// The Upstash Redis client expects a URL starting with https://
// But the REDIS_URL environment variable might be in a different format
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// Key prefixes for different data types
export const KEYS = {
  STOCK_ENTRIES: "stock:entries",
  STOCK_LEFT: "stock:left",
  FISH_TYPES: "fish:types",
  SUPPLIERS: "suppliers",
}

// Helper function to generate a unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
