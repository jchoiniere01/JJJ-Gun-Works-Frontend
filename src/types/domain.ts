export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'reserved'

export interface PartCategory {
  id: number
  name: string
  slug: string
  description?: string
  sort_order?: number
  required?: boolean
}

export interface Supplier {
  id: number
  name: string
  contact_name?: string
  email?: string
  phone?: string
  lead_time_days?: number
  active?: boolean
}

export interface InventoryItem {
  id: number
  sku: string
  name: string
  description?: string
  category_id: number
  category?: PartCategory
  supplier_id?: number
  supplier?: Supplier
  unit_cost?: number
  price: number
  quantity_on_hand: number
  quantity_reserved: number
  reorder_point?: number
  image_url?: string
  caliber?: string
  platform?: string
  finish?: string
  barrel_length?: string
  compatible_tags?: string[]
  status?: StockStatus
}

export interface ReservationLine {
  inventory_item_id: number
  quantity: number
  unit_price: number
}

export interface ReservationRequest {
  customer_name: string
  customer_email: string
  expires_in_minutes?: number
  lines: ReservationLine[]
  notes?: string
}

export interface ReservationResponse {
  id: number | string
  status: 'reserved' | 'partial' | 'rejected' | 'expired' | 'fulfilled'
  expires_at?: string
  message?: string
  lines?: ReservationLine[]
}

export interface OrderRequest {
  customer_name: string
  customer_email: string
  reservation_id?: number | string
  lines: ReservationLine[]
  subtotal: number
  tax?: number
  total: number
  notes?: string
}

export interface OrderResponse {
  id: number | string
  order_number?: string
  status: 'draft' | 'submitted' | 'paid' | 'cancelled' | 'fulfilled'
  total: number
  message?: string
  created_at?: string
}

export interface CartLine {
  item: InventoryItem
  quantity: number
}

export interface BuildSelection {
  [categorySlug: string]: InventoryItem | undefined
}

export interface ApiStatus {
  mode: 'live' | 'demo'
  message: string
}
