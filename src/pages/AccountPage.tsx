import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import { StatusBanner } from '../components/StatusBanner'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
}

export const AccountPage = () => {
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { user, isAuthenticated, isAdmin, authMessage, login, register, updateProfile, logout } = useAuth()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (tab === 0) {
        await login({ email: form.email, password: form.password, name: form.name, phone: form.phone })
      } else {
        await register(form)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError('')
    try {
      await updateProfile({
        email: user.email,
        name: form.name || user.name,
        phone: form.phone || user.phone,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.')
    } finally {
      setBusy(false)
    }
  }

  const loadProfileToForm = () => {
    if (!user) return
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
    })
  }

  return (
    <Stack spacing={3}>
      <StatusBanner />
      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Typography variant="h1">Account access</Typography>
            <Typography color="text.secondary">
              Customers can save checkout information, while owner/admin sessions unlock inventory management controls.
            </Typography>
            <Alert severity="warning" variant="outlined">
              Frontend role checks improve the customer experience, but the FastAPI backend must still reject unauthorized inventory create, update, and delete requests.
            </Alert>
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h3">Demo credentials</Typography>
                  <Typography variant="body2" color="text.secondary">
                    In demo mode, use this owner email to preview admin controls. Your production backend should issue the real role.
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(77, 93, 48, 0.08)',
                      border: '1px dashed',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography fontWeight={700}>owner@jjjgunworks.com</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Any password works only in demo fallback mode.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="fullWidth">
              <Tab icon={<VpnKeyOutlinedIcon />} iconPosition="start" label="Sign in" data-testid="tab-sign-in" />
              <Tab icon={<PersonAddAltOutlinedIcon />} iconPosition="start" label="Create account" data-testid="tab-register" />
            </Tabs>
            <CardContent>
              {isAuthenticated && user ? (
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h3" data-testid="text-account-name">
                        {user.name}
                      </Typography>
                      <Typography color="text.secondary" data-testid="text-account-email">
                        {user.email}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        icon={<AdminPanelSettingsOutlinedIcon />}
                        color={isAdmin ? 'success' : 'default'}
                        label={isAdmin ? `${user.role} access` : 'customer access'}
                        data-testid="status-account-role"
                      />
                    </Stack>
                  </Stack>
                  {authMessage && <Alert severity="success" data-testid="status-auth-message">{authMessage}</Alert>}
                  <Divider />
                  <Box component="form" onSubmit={saveProfile}>
                    <Stack spacing={2}>
                      <Typography variant="h4">Saved customer information</Typography>
                      <TextField
                        label="Name"
                        value={form.name || user.name}
                        onFocus={loadProfileToForm}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        data-testid="input-profile-name"
                      />
                      <TextField
                        label="Email"
                        value={user.email}
                        disabled
                        data-testid="input-profile-email"
                      />
                      <TextField
                        label="Phone"
                        value={form.phone || user.phone || ''}
                        onFocus={loadProfileToForm}
                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                        data-testid="input-profile-phone"
                      />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button type="submit" variant="contained" disabled={busy} data-testid="button-save-profile">
                          Save profile
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<LogoutOutlinedIcon />}
                          onClick={logout}
                          data-testid="button-logout"
                        >
                          Sign out
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              ) : (
                <Box component="form" onSubmit={submit}>
                  <Stack spacing={2}>
                    <Typography variant="h3">{tab === 0 ? 'Sign in' : 'Create customer account'}</Typography>
                    {tab === 1 && (
                      <TextField
                        required
                        label="Full name"
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        data-testid="input-auth-name"
                      />
                    )}
                    <TextField
                      required
                      type="email"
                      label="Email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      data-testid="input-auth-email"
                    />
                    {tab === 1 && (
                      <TextField
                        label="Phone"
                        value={form.phone}
                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                        data-testid="input-auth-phone"
                      />
                    )}
                    <TextField
                      required
                      type="password"
                      label="Password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      data-testid="input-auth-password"
                    />
                    {error && <Alert severity="error" data-testid="status-auth-error">{error}</Alert>}
                    <Button type="submit" variant="contained" disabled={busy} data-testid="button-auth-submit">
                      {tab === 0 ? 'Sign in' : 'Create account'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
