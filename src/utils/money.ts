export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const formatMoney = (value: number | undefined | null) => currency.format(value ?? 0)

export const availableQuantity = (quantityOnHand: number, quantityReserved: number) =>
  Math.max(0, quantityOnHand - quantityReserved)

export const stockLabel = (quantityOnHand: number, quantityReserved: number) => {
  const available = availableQuantity(quantityOnHand, quantityReserved)
  if (available <= 0) return 'Out of stock'
  if (available <= 2) return `${available} left`
  return `${available} available`
}
