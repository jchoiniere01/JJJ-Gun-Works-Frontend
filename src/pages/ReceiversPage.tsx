import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { inventoryApi, serviceRequestApi } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { StatusBanner } from '../components/StatusBanner'
import type { FulfillmentMethod, InventoryItem, ServiceRequestResponse } from '../types/domain'
import { availableQuantity, formatMoney, stockLabel } from '../utils/money'

export const ReceiversPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('ship_to_ffl')
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    ffl_name: '',
    ffl_license: '',
    ffl_email: '',
    ffl_phone: '',
    preferred_pickup_at: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<ServiceRequestResponse | null>(null)

  useEffect(() => {
    inventoryApi
      .list()
      .then((items) => setInventory(items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load receivers.'))
      .finally(() => setLoading(false))
  }, [])

  const receivers = useMemo(
    () =>
      inventory.filter((item) => {
        const name = `${item.name} ${item.sku}`.toLowerCase()
        return item.category?.slug === 'lower-receiver' || name.includes('lower') || name.includes('receiver')
      }),
    [inventory],
  )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected) {
      setError('Select a receiver before submitting the request.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await serviceRequestApi.create({
        request_type: 'receiver_purchase',
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        fulfillment_method: fulfillment,
        preferred_pickup_at: fulfillment === 'local_pickup' ? form.preferred_pickup_at : undefined,
        ffl_name: fulfillment === 'ship_to_ffl' ? form.ffl_name : undefined,
        ffl_license: fulfillment === 'ship_to_ffl' ? form.ffl_license : undefined,
        ffl_email: fulfillment === 'ship_to_ffl' ? form.ffl_email : undefined,
        ffl_phone: fulfillment === 'ship_to_ffl' ? form.ffl_phone : undefined,
        notes: form.notes,
        lines: [{ inventory_item_id: selected.id, name: selected.name, quantity: 1, unit_price: selected.price }],
        estimated_total: selected.price,
      })
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit receiver request.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <StatusBanner />
        <LoadingState rows={4} />
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <StatusBanner />
      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <Box>
              <Chip label="Serialized receiver sales" color="secondary" sx={{ mb: 1.5 }} />
              <Typography variant="h1">Available receivers</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                Purchase a receiver directly from JJJ Gun Works, then choose shipment to your preferred FFL or schedule a local pickup appointment.
              </Typography>
            </Box>
            {receivers.length === 0 ? (
              <Alert severity="info">No receiver inventory is available right now.</Alert>
            ) : (
              <Grid container spacing={2.5}>
                {receivers.map((receiver) => {
                  const available = availableQuantity(receiver.quantity_on_hand, receiver.quantity_reserved)
                  const isSelected = selected?.id === receiver.id
                  return (
                    <Grid key={receiver.id} size={{ xs: 12, md: 6 }}>
                      <Card
                        data-testid={`card-receiver-${receiver.id}`}
                        sx={{ height: '100%', borderColor: isSelected ? 'primary.main' : 'divider' }}
                      >
                        <CardContent>
                          <Stack spacing={1.5}>
                            {receiver.image_url ? (
                              <Box
                                component="img"
                                src={receiver.image_url}
                                alt={receiver.name}
                                sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2 }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: 180,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(77,93,48,0.1)',
                                  display: 'grid',
                                  placeItems: 'center',
                                }}
                              >
                                <Typography variant="h3" color="primary.dark">Receiver</Typography>
                              </Box>
                            )}
                            <Box>
                              <Typography variant="overline" color="text.secondary">{receiver.sku}</Typography>
                              <Typography variant="h3">{receiver.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{receiver.description}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {receiver.finish && <Chip label={receiver.finish} />}
                              <Chip color={available > 0 ? 'success' : 'error'} label={stockLabel(receiver.quantity_on_hand, receiver.quantity_reserved)} />
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="h3" color="primary.dark">{formatMoney(receiver.price)}</Typography>
                              <Button
                                variant={isSelected ? 'contained' : 'outlined'}
                                disabled={available <= 0}
                                onClick={() => setSelected(receiver)}
                                data-testid={`button-select-receiver-${receiver.id}`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ position: { lg: 'sticky' }, top: { lg: 104 } }}>
            <CardContent>
              <Box component="form" onSubmit={submit}>
                <Stack spacing={2}>
                  <Typography variant="h3">Purchase request</Typography>
                  <Alert severity="info" variant="outlined">
                    This request starts the purchase process. JJJ Gun Works will confirm legal transfer details, availability, and appointment timing.
                  </Alert>
                  <TextField required label="Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} data-testid="input-receiver-name" />
                  <TextField required type="email" label="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} data-testid="input-receiver-email" />
                  <TextField label="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} data-testid="input-receiver-phone" />
                  <RadioGroup value={fulfillment} onChange={(e) => setFulfillment(e.target.value as FulfillmentMethod)}>
                    <FormControlLabel value="ship_to_ffl" control={<Radio />} label={<Stack direction="row" spacing={1} alignItems="center"><LocalShippingOutlinedIcon fontSize="small" /> <span>Ship to my chosen FFL</span></Stack>} />
                    <FormControlLabel value="local_pickup" control={<Radio />} label={<Stack direction="row" spacing={1} alignItems="center"><StorefrontOutlinedIcon fontSize="small" /> <span>Schedule pickup from JJJ Gun Works</span></Stack>} />
                  </RadioGroup>
                  {fulfillment === 'ship_to_ffl' ? (
                    <Stack spacing={1.5}>
                      <TextField required label="Receiving FFL name" value={form.ffl_name} onChange={(e) => setForm({ ...form, ffl_name: e.target.value })} data-testid="input-receiver-ffl-name" />
                      <TextField label="FFL license number" value={form.ffl_license} onChange={(e) => setForm({ ...form, ffl_license: e.target.value })} data-testid="input-receiver-ffl-license" />
                      <TextField required type="email" label="FFL email" value={form.ffl_email} onChange={(e) => setForm({ ...form, ffl_email: e.target.value })} data-testid="input-receiver-ffl-email" />
                      <TextField label="FFL phone" value={form.ffl_phone} onChange={(e) => setForm({ ...form, ffl_phone: e.target.value })} data-testid="input-receiver-ffl-phone" />
                    </Stack>
                  ) : (
                    <TextField
                      required
                      type="datetime-local"
                      label="Preferred pickup time"
                      InputLabelProps={{ shrink: true }}
                      value={form.preferred_pickup_at}
                      onChange={(e) => setForm({ ...form, preferred_pickup_at: e.target.value })}
                      data-testid="input-receiver-pickup-time"
                    />
                  )}
                  <TextField label="Notes" multiline minRows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-receiver-notes" />
                  {selected && <Alert severity="success">Selected: {selected.name} · {formatMoney(selected.price)}</Alert>}
                  {error && <Alert severity="error" data-testid="status-receiver-error">{error}</Alert>}
                  {response && <Alert severity="success" data-testid="status-receiver-success">{response.message} Request {response.request_number || response.id}.</Alert>}
                  <Button type="submit" variant="contained" disabled={busy || !selected} data-testid="button-submit-receiver-request">
                    Submit receiver request
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
