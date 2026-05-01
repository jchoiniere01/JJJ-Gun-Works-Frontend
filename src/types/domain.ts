export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'reserved'
export type WeaponPlatform = 'AR-9' | 'AR-10' | 'AR-15'
export type BuildPackage = 'weapon' | 'custom'

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

export type FulfillmentMethod = 'ship_to_ffl' | 'local_pickup'

export type ServiceRequestType = 'receiver_purchase' | 'ffl_transfer' | 'cleaning_service'

export interface ServiceRequestLine {
  inventory_item_id?: number
  name: string
  quantity: number
  unit_price?: number
}

export interface ServiceRequestRequest {
  request_type: ServiceRequestType
  customer_name: string
  customer_email: string
  customer_phone?: string
  fulfillment_method?: FulfillmentMethod
  preferred_pickup_at?: string
  ffl_name?: string
  ffl_license?: string
  ffl_email?: string
  ffl_phone?: string
  seller_name?: string
  tracking_number?: string
  firearm_description?: string
  notes?: string
  lines?: ServiceRequestLine[]
  estimated_total?: number
}

export interface ServiceRequestResponse {
  id: number | string
  request_number?: string
  status: 'received' | 'pending' | 'scheduled' | 'completed' | 'cancelled'
  message?: string
  created_at?: string
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

export type UserRole = 'customer' | 'admin' | 'owner'

export interface UserProfile {
  id: number | string
  email: string
  name: string
  phone?: string
  role: UserRole
  saved_at?: string
}

export interface AuthRequest {
  email: string
  password: string
  name?: string
  phone?: string
}

export interface AuthResponse {
  user: UserProfile
  access_token?: string
  token_type?: string
  message?: string
}
