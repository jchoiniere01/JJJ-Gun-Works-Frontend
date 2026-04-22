import { useEffect, useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { orderApi, reservationApi } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { StatusBanner } from '../components/StatusBanner'
import type { OrderResponse, ReservationResponse } from '../types/domain'
import { formatMoney } from '../utils/money'

export const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([orderApi.list(), reservationApi.list()])
      .then(([orderData, reservationData]) => {
        setOrders(orderData)
        setReservations(reservationData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load order data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Stack spacing={3}>
        <StatusBanner />
        <LoadingState rows={3} />
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <StatusBanner />
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <BoxTitle title="Orders" subtitle="Submitted order records from the FastAPI orders endpoint." />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`${orders.length} orders`} />
          <Chip label={`${reservations.length} reservations`} />
        </Stack>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Recent orders
          </Typography>
          {orders.length === 0 ? (
            <Alert severity="info" data-testid="status-no-orders">
              No orders have been submitted in this session yet.
            </Alert>
          ) : (
            <TableContainer>
              <Table data-testid="table-orders">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number || order.id}</TableCell>
                      <TableCell>
                        <Chip size="small" label={order.status} color="success" />
                      </TableCell>
                      <TableCell>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</TableCell>
                      <TableCell align="right">{formatMoney(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Reservation log
          </Typography>
          {reservations.length === 0 ? (
            <Alert severity="info" data-testid="status-no-reservations">
              No reservations have been created in this session yet.
            </Alert>
          ) : (
            <TableContainer>
              <Table data-testid="table-reservations">
                <TableHead>
                  <TableRow>
                    <TableCell>Reservation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Lines</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.id}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={reservation.status}
                          color={reservation.status === 'reserved' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{reservation.expires_at ? new Date(reservation.expires_at).toLocaleString() : '—'}</TableCell>
                      <TableCell>{reservation.lines?.length ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}

const BoxTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Stack>
    <Typography variant="h1">{title}</Typography>
    <Typography color="text.secondary">{subtitle}</Typography>
  </Stack>
)
