import { useState } from 'react'
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
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import { serviceRequestApi } from '../api/client'
import { StatusBanner } from '../components/StatusBanner'
import type { ServiceRequestResponse } from '../types/domain'

export const FflTransferPage = () => {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    seller_name: '',
    tracking_number: '',
    firearm_description: '',
    notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<ServiceRequestResponse | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await serviceRequestApi.create({
        request_type: 'ffl_transfer',
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        seller_name: form.seller_name,
        tracking_number: form.tracking_number,
        firearm_description: form.firearm_description,
        notes: form.notes,
      })
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit transfer notice.')
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
              <Chip label="Inbound transfer notice" color="secondary" sx={{ mb: 1.5 }} />
              <Typography variant="h1">Select JJJ Gun Works as your receiving FFL</Typography>
              <Typography color="text.secondary">
                Send transfer details before the firearm ships so JJJ Gun Works knows what is coming and can notify you when it arrives.
              </Typography>
            </Box>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <InfoRow icon={<AssignmentTurnedInOutlinedIcon />} title="Use JJJ as receiving FFL" text="Provide this shop as the transfer destination to the seller or sending FFL." />
                  <InfoRow icon={<LocalShippingOutlinedIcon />} title="Submit shipment notice" text="Tell JJJ what is being shipped, where it is coming from, and any tracking number you have." />
                  <InfoRow icon={<NotificationsActiveOutlinedIcon />} title="Get arrival notification" text="JJJ Gun Works can contact you after arrival so you can schedule the transfer appointment." />
                </Stack>
              </CardContent>
            </Card>
            <Alert severity="info" variant="outlined">
              Add your exact FFL license details, preferred transfer policies, and shop address in the backend or site copy when you are ready to publish publicly.
            </Alert>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={submit}>
                <Stack spacing={2}>
                  <Typography variant="h3">Transfer notice form</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth label="Your name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} data-testid="input-transfer-name" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth type="email" label="Your email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} data-testid="input-transfer-email" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} data-testid="input-transfer-phone" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Seller / sending FFL" value={form.seller_name} onChange={(e) => setForm({ ...form, seller_name: e.target.value })} data-testid="input-transfer-seller" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Tracking number" value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} data-testid="input-transfer-tracking" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth label="Firearm description" value={form.firearm_description} onChange={(e) => setForm({ ...form, firearm_description: e.target.value })} data-testid="input-transfer-firearm" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth multiline minRows={4} label="Additional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-transfer-notes" />
                    </Grid>
                  </Grid>
                  {error && <Alert severity="error" data-testid="status-transfer-error">{error}</Alert>}
                  {response && <Alert severity="success" data-testid="status-transfer-success">{response.message} Request {response.request_number || response.id}.</Alert>}
                  <Button type="submit" variant="contained" disabled={busy} data-testid="button-submit-transfer">
                    Notify JJJ of inbound transfer
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

const InfoRow = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box sx={{ color: 'primary.main', mt: 0.25 }}>{icon}</Box>
    <Box>
      <Typography fontWeight={700}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  </Stack>
)
