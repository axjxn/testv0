export interface FishType {
  id: string
  name: string
}

export interface StockEntry {
  id: string
  fishTypeId: string
  fishTypeName: string
  weight: number
  rate: number
  date: string
  time: string
  timestamp: number
  supplier?: string
  notes?: string
  batchId: string
}

export interface StockLeft {
  id: string
  date: string
  time: string
  timestamp: number
  stockLeft: Record<string, number>
  notes?: string
}

export interface Supplier {
  id: string
  name: string
}
