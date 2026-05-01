import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { serviceRequestApi } from '../api/client'
import { StatusBanner } from '../components/StatusBanner'
import type { ServiceRequestResponse } from '../types/domain'
import { formatMoney } from '../utils/money'

const pistolPrice = 10
const riflePrice = 20

export const CleaningPage = () => {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pistols: 0,
    rifles: 0,
    preferred_pickup_at: '',
    notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<ServiceRequestResponse | null>(null)
  const total = useMemo(() => form.pistols * pistolPrice + form.rifles * riflePrice, [form.pistols, form.rifles])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.pistols + form.rifles <= 0) {
      setError('Enter at least one pistol or rifle for cleaning.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const lines = [
        form.pistols > 0 ? { name: 'Pistol cleaning', quantity: form.pistols, unit_price: pistolPrice } : null,
        form.rifles > 0 ? { name: 'Rifle cleaning', quantity: form.rifles, unit_price: riflePrice } : null,
      ].filter(Boolean) as { name: string; quantity: number; unit_price: number }[]
      const result = await serviceRequestApi.create({
        request_type: 'cleaning_service',
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        preferred_pickup_at: form.preferred_pickup_at,
        notes: form.notes,
        lines,
        estimated_total: total,
      })
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit cleaning request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={3}>
      <StatusBanner />
      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Chip label="Gun cleaning service" color="secondary" sx={{ mb: 1.5 }} />
              <Typography variant="h1">Schedule firearm cleaning</Typography>
              <Typography color="text.secondary">
                Simple pricing for basic cleaning service: $10 per pistol and $20 per rifle.
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PriceCard title="Pistol cleaning" price={pistolPrice} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PriceCard title="Rifle cleaning" price={riflePrice} />
              </Grid>
            </Grid>
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Feature icon={<CleaningServicesOutlinedIcon />} text="Basic cleaning and function-ready presentation." />
                  <Feature icon={<HandymanOutlinedIcon />} text="Add notes for special concerns, heavy fouling, or inspection requests." />
                  <Feature icon={<ScheduleOutlinedIcon />} text="Request a preferred appointment time for drop-off or pickup coordination." />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={submit}>
                <Stack spacing={2}>
                  <Typography variant="h3">Cleaning request</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth label="Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} data-testid="input-cleaning-name" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth type="email" label="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} data-testid="input-cleaning-email" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} data-testid="input-cleaning-phone" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth type="datetime-local" label="Preferred appointment" InputLabelProps={{ shrink: true }} value={form.preferred_pickup_at} onChange={(e) => setForm({ ...form, preferred_pickup_at: e.target.value })} data-testid="input-cleaning-time" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth type="number" label="Pistols" value={form.pistols} inputProps={{ min: 0 }} onChange={(e) => setForm({ ...form, pistols: Number(e.target.value) })} data-testid="input-cleaning-pistols" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth type="number" label="Rifles" value={form.rifles} inputProps={{ min: 0 }} onChange={(e) => setForm({ ...form, rifles: Number(e.target.value) })} data-testid="input-cleaning-rifles" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth multiline minRows={4} label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-cleaning-notes" />
                    </Grid>
                  </Grid>
                  <Alert severity="info" data-testid="text-cleaning-total">
                    Estimated cleaning total: {formatMoney(total)}
                  </Alert>
                  {error && <Alert severity="error" data-testid="status-cleaning-error">{error}</Alert>}
                  {response && <Alert severity="success" data-testid="status-cleaning-success">{response.message} Request {response.request_number || response.id}.</Alert>}
                  <Button type="submit" variant="contained" disabled={busy} data-testid="button-submit-cleaning">
                    Submit cleaning request
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

const PriceCard = ({ title, price }: { title: string; price: number }) => (
  <Card>
    <CardContent>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h2" color="primary.dark">{formatMoney(price)}</Typography>
    </CardContent>
  </Card>
)

const Feature = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box sx={{ color: 'primary.main' }}>{icon}</Box>
    <Typography color="text.secondary">{text}</Typography>
  </Stack>
)
