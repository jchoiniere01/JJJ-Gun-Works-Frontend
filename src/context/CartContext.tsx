import { createContext, useContext, useMemo, useReducer } from 'react'
import type { CartLine, InventoryItem } from '../types/domain'
import { availableQuantity } from '../utils/money'

interface CartState {
  lines: CartLine[]
}

type CartAction =
  | { type: 'add'; item: InventoryItem; quantity?: number }
  | { type: 'remove'; itemId: number }
  | { type: 'setQuantity'; itemId: number; quantity: number }
  | { type: 'clear' }

interface CartContextValue extends CartState {
  addItem: (item: InventoryItem, quantity?: number) => void
  removeItem: (itemId: number) => void
  setQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
  subtotal: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const reducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'add': {
      const existing = state.lines.find((line) => line.item.id === action.item.id)
      const currentQuantity = existing?.quantity ?? 0
      const available = availableQuantity(action.item.quantity_on_hand, action.item.quantity_reserved)
      const nextQuantity = Math.min(available, currentQuantity + (action.quantity ?? 1))
      if (nextQuantity <= 0) return state
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.item.id === action.item.id ? { ...line, quantity: nextQuantity } : line,
          ),
        }
      }
      return {
        lines: [...state.lines, { item: action.item, quantity: nextQuantity }],
      }
    }
    case 'remove':
      return { lines: state.lines.filter((line) => line.item.id !== action.itemId) }
    case 'setQuantity':
      return {
        lines: state.lines
          .map((line) => {
            if (line.item.id !== action.itemId) return line
            const available = availableQuantity(line.item.quantity_on_hand, line.item.quantity_reserved)
            return { ...line, quantity: Math.min(Math.max(1, action.quantity), available) }
          })
          .filter((line) => line.quantity > 0),
      }
    case 'clear':
      return { lines: [] }
    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { lines: [] })

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)
    const itemCount = state.lines.reduce((sum, line) => sum + line.quantity, 0)
    return {
      ...state,
      subtotal,
      itemCount,
      addItem: (item, quantity) => dispatch({ type: 'add', item, quantity }),
      removeItem: (itemId) => dispatch({ type: 'remove', itemId }),
      setQuantity: (itemId, quantity) => dispatch({ type: 'setQuantity', itemId, quantity }),
      clearCart: () => dispatch({ type: 'clear' }),
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
