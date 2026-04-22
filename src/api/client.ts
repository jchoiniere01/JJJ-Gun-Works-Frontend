import axios, { AxiosError, type AxiosInstance } from 'axios'
import {
  mockCategories,
  mockInventory,
  mockSuppliers,
} from '../data/mockData'
import type {
  ApiStatus,
  InventoryItem,
  OrderRequest,
  OrderResponse,
  PartCategory,
  ReservationRequest,
  ReservationResponse,
  Supplier,
} from '../types/domain'
import { availableQuantity } from '../utils/money'

const explicitBase = import.meta.env.VITE_API_BASE_URL as string | undefined
const baseURL = explicitBase?.trim() || ''

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 6500,
  headers: {
    'Content-Type': 'application/json',
  },
})

const endpointCandidates = {
  inventory: ['/api/inventory-items', '/api/inventory', '/inventory-items', '/inventory'],
  categories: ['/api/part-categories', '/part-categories', '/api/categories', '/categories'],
  suppliers: ['/api/suppliers', '/suppliers'],
  reservations: ['/api/reservations', '/reservations'],
  orders: ['/api/orders', '/orders'],
}

const normalizeList = <T>(payload: unknown, key?: string): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (key && Array.isArray(record[key])) return record[key] as T[]
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.results)) return record.results as T[]
    if (Array.isArray(record.data)) return record.data as T[]
  }
  return []
}

const getFirst = async <T>(paths: string[], key?: string): Promise<T[]> => {
  let lastError: unknown
  for (const path of paths) {
    try {
      const response = await apiClient.get(path)
      const list = normalizeList<T>(response.data, key)
      if (list.length || response.status < 300) return list
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

const postFirst = async <TResponse, TBody>(paths: string[], body: TBody): Promise<TResponse> => {
  let lastError: unknown
  for (const path of paths) {
    try {
      const response = await apiClient.post<TResponse>(path, body)
      return response.data
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

const patchFirst = async <TResponse, TBody>(paths: string[], id: number | string, body: TBody): Promise<TResponse> => {
  let lastError: unknown
  for (const path of paths) {
    try {
      const response = await apiClient.patch<TResponse>(`${path}/${id}`, body)
      return response.data
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

const deleteFirst = async (paths: string[], id: number | string): Promise<void> => {
  let lastError: unknown
  for (const path of paths) {
    try {
      await apiClient.delete(`${path}/${id}`)
      return
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

const demoDelay = async () => new Promise((resolve) => window.setTimeout(resolve, 180))

let demoInventory = [...mockInventory]
let demoCategories = [...mockCategories]
let demoSuppliers = [...mockSuppliers]
let demoReservations: ReservationResponse[] = []
let demoOrders: OrderResponse[] = []

let usingDemo = !explicitBase

const shouldUseDemo = (error: unknown) => {
  if (!explicitBase) return true
  const axiosError = error as AxiosError
  return !axiosError.response
}

const withDemoFallback = async <T>(liveCall: () => Promise<T>, demoCall: () => Promise<T>): Promise<T> => {
  try {
    if (!usingDemo) return await liveCall()
    return await demoCall()
  } catch (error) {
    if (shouldUseDemo(error)) {
      usingDemo = true
      return demoCall()
    }
    throw error
  }
}

const hydrateInventory = (items: InventoryItem[]) =>
  items.map((raw) => ({
    ...raw,
    category: raw.category ?? demoCategories.find((category) => category.id === raw.category_id),
    supplier: raw.supplier ?? demoSuppliers.find((supplier) => supplier.id === raw.supplier_id),
    compatible_tags: raw.compatible_tags ?? [],
  }))

export const getApiStatus = (): ApiStatus => ({
  mode: usingDemo ? 'demo' : 'live',
  message: usingDemo
    ? 'Demo data is active. Set VITE_API_BASE_URL or run FastAPI on localhost:8000 for live inventory.'
    : 'Connected to the FastAPI backend.',
})

export const inventoryApi = {
  list: () =>
    withDemoFallback(
      async () => hydrateInventory(await getFirst<InventoryItem>(endpointCandidates.inventory, 'inventory_items')),
      async () => {
        await demoDelay()
        return hydrateInventory(demoInventory)
      },
    ),
  create: (body: Partial<InventoryItem>) =>
    withDemoFallback(
      async () => postFirst<InventoryItem, Partial<InventoryItem>>(endpointCandidates.inventory, body),
      async () => {
        await demoDelay()
        const created = {
          id: Date.now(),
          sku: body.sku || `NEW-${Date.now()}`,
          name: body.name || 'New inventory item',
          category_id: Number(body.category_id || 1),
          supplier_id: Number(body.supplier_id || 1),
          price: Number(body.price || 0),
          quantity_on_hand: Number(body.quantity_on_hand || 0),
          quantity_reserved: Number(body.quantity_reserved || 0),
          description: body.description || '',
          reorder_point: Number(body.reorder_point || 0),
          unit_cost: Number(body.unit_cost || 0),
          compatible_tags: body.compatible_tags || [],
        } satisfies InventoryItem
        demoInventory = [created, ...demoInventory]
        return hydrateInventory([created])[0]
      },
    ),
  update: (id: number | string, body: Partial<InventoryItem>) =>
    withDemoFallback(
      async () => patchFirst<InventoryItem, Partial<InventoryItem>>(endpointCandidates.inventory, id, body),
      async () => {
        await demoDelay()
        demoInventory = demoInventory.map((item) => (String(item.id) === String(id) ? { ...item, ...body } : item))
        return hydrateInventory(demoInventory).find((item) => String(item.id) === String(id))!
      },
    ),
  remove: (id: number | string) =>
    withDemoFallback(
      async () => deleteFirst(endpointCandidates.inventory, id),
      async () => {
        await demoDelay()
        demoInventory = demoInventory.filter((item) => String(item.id) !== String(id))
      },
    ),
}

export const categoryApi = {
  list: () =>
    withDemoFallback(
      async () => getFirst<PartCategory>(endpointCandidates.categories, 'part_categories'),
      async () => {
        await demoDelay()
        return [...demoCategories]
      },
    ),
  create: (body: Partial<PartCategory>) =>
    withDemoFallback(
      async () => postFirst<PartCategory, Partial<PartCategory>>(endpointCandidates.categories, body),
      async () => {
        await demoDelay()
        const created: PartCategory = {
          id: Date.now(),
          name: body.name || 'New Category',
          slug: body.slug || (body.name || 'new-category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: body.description || '',
          sort_order: body.sort_order ?? demoCategories.length + 1,
          required: body.required ?? false,
        }
        demoCategories = [...demoCategories, created]
        return created
      },
    ),
  update: (id: number | string, body: Partial<PartCategory>) =>
    withDemoFallback(
      async () => patchFirst<PartCategory, Partial<PartCategory>>(endpointCandidates.categories, id, body),
      async () => {
        await demoDelay()
        demoCategories = demoCategories.map((category) => (String(category.id) === String(id) ? { ...category, ...body } : category))
        return demoCategories.find((category) => String(category.id) === String(id))!
      },
    ),
  remove: (id: number | string) =>
    withDemoFallback(
      async () => deleteFirst(endpointCandidates.categories, id),
      async () => {
        await demoDelay()
        demoCategories = demoCategories.filter((category) => String(category.id) !== String(id))
      },
    ),
}

export const supplierApi = {
  list: () =>
    withDemoFallback(
      async () => getFirst<Supplier>(endpointCandidates.suppliers, 'suppliers'),
      async () => {
        await demoDelay()
        return [...demoSuppliers]
      },
    ),
  create: (body: Partial<Supplier>) =>
    withDemoFallback(
      async () => postFirst<Supplier, Partial<Supplier>>(endpointCandidates.suppliers, body),
      async () => {
        await demoDelay()
        const created: Supplier = {
          id: Date.now(),
          name: body.name || 'New Supplier',
          contact_name: body.contact_name || '',
          email: body.email || '',
          phone: body.phone || '',
          lead_time_days: Number(body.lead_time_days || 0),
          active: body.active ?? true,
        }
        demoSuppliers = [...demoSuppliers, created]
        return created
      },
    ),
  update: (id: number | string, body: Partial<Supplier>) =>
    withDemoFallback(
      async () => patchFirst<Supplier, Partial<Supplier>>(endpointCandidates.suppliers, id, body),
      async () => {
        await demoDelay()
        demoSuppliers = demoSuppliers.map((supplier) => (String(supplier.id) === String(id) ? { ...supplier, ...body } : supplier))
        return demoSuppliers.find((supplier) => String(supplier.id) === String(id))!
      },
    ),
  remove: (id: number | string) =>
    withDemoFallback(
      async () => deleteFirst(endpointCandidates.suppliers, id),
      async () => {
        await demoDelay()
        demoSuppliers = demoSuppliers.filter((supplier) => String(supplier.id) !== String(id))
      },
    ),
}

export const reservationApi = {
  create: (body: ReservationRequest): Promise<ReservationResponse> =>
    withDemoFallback(
      async () => postFirst<ReservationResponse, ReservationRequest>(endpointCandidates.reservations, body),
      async () => {
        await demoDelay()
        const rejected = body.lines.find((line) => {
          const item = demoInventory.find((inventoryItem) => inventoryItem.id === line.inventory_item_id)
          return !item || availableQuantity(item.quantity_on_hand, item.quantity_reserved) < line.quantity
        })

        if (rejected) {
          return {
            id: `demo-rejected-${Date.now()}`,
            status: 'rejected',
            message: 'Reservation rejected because at least one item does not have enough available quantity.',
          }
        }

        demoInventory = demoInventory.map((item) => {
          const line = body.lines.find((candidate) => candidate.inventory_item_id === item.id)
          return line ? { ...item, quantity_reserved: item.quantity_reserved + line.quantity } : item
        })

        const reservation: ReservationResponse = {
          id: `RSV-${Date.now()}`,
          status: 'reserved',
          expires_at: new Date(Date.now() + (body.expires_in_minutes || 45) * 60 * 1000).toISOString(),
          message: 'Inventory reserved with oversell protection.',
          lines: body.lines,
        }
        demoReservations = [reservation, ...demoReservations]
        return reservation
      },
    ),
  list: () =>
    withDemoFallback(
      async () => getFirst<ReservationResponse>(endpointCandidates.reservations, 'reservations'),
      async () => {
        await demoDelay()
        return demoReservations
      },
    ),
}

export const orderApi = {
  create: (body: OrderRequest) =>
    withDemoFallback(
      async () => postFirst<OrderResponse, OrderRequest>(endpointCandidates.orders, body),
      async () => {
        await demoDelay()
        const order: OrderResponse = {
          id: `ORD-${Date.now()}`,
          order_number: `JJJ-${Math.floor(100000 + Math.random() * 899999)}`,
          status: 'submitted',
          total: body.total,
          created_at: new Date().toISOString(),
          message: 'Order submitted from demo mode. Connect FastAPI to persist it.',
        }
        demoOrders = [order, ...demoOrders]
        return order
      },
    ),
  list: () =>
    withDemoFallback(
      async () => getFirst<OrderResponse>(endpointCandidates.orders, 'orders'),
      async () => {
        await demoDelay()
        return demoOrders
      },
    ),
}
