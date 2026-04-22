import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { Link } from 'react-router-dom'
import { orderApi, reservationApi } from '../api/client'
import { StatusBanner } from '../components/StatusBanner'
import { useCart } from '../context/CartContext'
import type { OrderResponse, ReservationResponse } from '../types/domain'
import { availableQuantity, formatMoney, stockLabel } from '../utils/money'

const taxRate = 0.0825

export const CartPage = () => {
  const { lines, subtotal, removeItem, setQuantity, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [reservation, setReservation] = useState<ReservationResponse | null>(null)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState('')

  const tax = useMemo(() => Number((subtotal * taxRate).toFixed(2)), [subtotal])
  const total = subtotal + tax
  const cartLines = lines.map((line) => ({
    inventory_item_id: line.item.id,
    quantity: line.quantity,
    unit_price: line.item.price,
  }))

  const canSubmit = lines.length > 0 && customerName.trim().length > 1 && /\S+@\S+\.\S+/.test(customerEmail)

  const reserve = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setOrder(null)
    try {
      const response = await reservationApi.create({
        customer_name: customerName,
        customer_email: customerEmail,
        expires_in_minutes: 45,
        lines: cartLines,
        notes,
      })
      setReservation(response)
      if (response.status === 'rejected') {
        setError(response.message || 'Reservation was rejected.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation request failed.')
    } finally {
      setBusy(false)
    }
  }

  const submitOrder = async () => {
    if (!reservation || reservation.status === 'rejected') return
    setBusy(true)
    setError('')
    try {
      const response = await orderApi.create({
        customer_name: customerName,
        customer_email: customerEmail,
        reservation_id: reservation.id,
        lines: cartLines,
        subtotal,
        tax,
        total,
        notes,
      })
      setOrder(response)
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order submission failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={3}>
      <StatusBanner />
      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h1">Cart and reservation</Typography>
              <Typography color="text.secondary">
                Reserve available inventory first, then submit the order against the reservation token.
              </Typography>
            </Box>
            <Stepper activeStep={order ? 2 : reservation?.status === 'reserved' ? 1 : 0} alternativeLabel>
              <Step>
                <StepLabel>Review cart</StepLabel>
              </Step>
              <Step>
                <StepLabel>Reserve inventory</StepLabel>
              </Step>
              <Step>
                <StepLabel>Submit order</StepLabel>
              </Step>
            </Stepper>
            {lines.length === 0 && !order ? (
              <Alert
                severity="info"
                action={
                  <Button component={Link} to="/" color="inherit" data-testid="button-back-builder">
                    Open builder
                  </Button>
                }
                data-testid="status-empty-cart"
              >
                The cart is empty. Add individual parts or a full build from the configurator.
              </Alert>
            ) : (
              lines.map((line) => {
                const available = availableQuantity(line.item.quantity_on_hand, line.item.quantity_reserved)
                return (
                  <Card key={line.item.id} data-testid={`row-cart-${line.item.id}`}>
                    <CardContent>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4">{line.item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {line.item.sku} · {stockLabel(line.item.quantity_on_hand, line.item.quantity_reserved)}
                          </Typography>
                        </Box>
                        <TextField
                          label="Qty"
                          type="number"
                          size="small"
                          value={line.quantity}
                          inputProps={{ min: 1, max: available }}
                          onChange={(event) => setQuantity(line.item.id, Number(event.target.value))}
                          sx={{ width: 96 }}
                          data-testid={`input-cart-qty-${line.item.id}`}
                        />
                        <Typography variant="h4" sx={{ minWidth: 120, textAlign: { sm: 'right' } }}>
                          {formatMoney(line.item.price * line.quantity)}
                        </Typography>
                        <IconButton onClick={() => removeItem(line.item.id)} color="error" data-testid={`button-remove-cart-${line.item.id}`}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                )
              })
            )}
            {order && (
              <Alert severity="success" data-testid="status-order-created">
                Order {order.order_number || order.id} submitted for {formatMoney(order.total)}. {order.message}
              </Alert>
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ position: { lg: 'sticky' }, top: { lg: 104 } }}>
            <CardContent>
              <Box component="form" onSubmit={reserve}>
                <Stack spacing={2}>
                  <Typography variant="h3">Checkout desk</Typography>
                  <TextField
                    required
                    label="Customer name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    data-testid="input-customer-name"
                  />
                  <TextField
                    required
                    type="email"
                    label="Customer email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    data-testid="input-customer-email"
                  />
                  <TextField
                    label="Build notes"
                    multiline
                    minRows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    data-testid="input-order-notes"
                  />
                  <Divider />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography>{formatMoney(subtotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Estimated TX tax</Typography>
                      <Typography>{formatMoney(tax)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="h4">Total</Typography>
                      <Typography variant="h3" color="primary.dark" data-testid="text-cart-total">
                        {formatMoney(total)}
                      </Typography>
                    </Stack>
                  </Stack>
                  {reservation && (
                    <Alert severity={reservation.status === 'reserved' ? 'success' : 'warning'} data-testid="status-reservation">
                      {reservation.message || `Reservation ${reservation.status}`}
                      {reservation.expires_at ? ` Expires ${new Date(reservation.expires_at).toLocaleString()}.` : ''}
                    </Alert>
                  )}
                  {error && (
                    <Alert severity="error" data-testid="status-cart-error">
                      {error}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<LockOutlinedIcon />}
                    disabled={!canSubmit || busy || lines.length === 0}
                    data-testid="button-reserve-inventory"
                  >
                    Reserve inventory
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptLongOutlinedIcon />}
                    disabled={!reservation || reservation.status !== 'reserved' || busy || Boolean(order)}
                    onClick={submitOrder}
                    data-testid="button-submit-order"
                  >
                    Submit order
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
