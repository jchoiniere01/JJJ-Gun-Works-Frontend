import { Alert, AlertTitle } from '@mui/material'
import { getApiStatus } from '../api/client'

export const StatusBanner = () => {
  const status = getApiStatus()
  return (
    <Alert
      severity={status.mode === 'live' ? 'success' : 'info'}
      variant="outlined"
      sx={{ mb: 3, backgroundColor: 'rgba(255,250,240,0.68)' }}
      data-testid="status-api-mode"
    >
      <AlertTitle>{status.mode === 'live' ? 'Live backend connected' : 'Demo backend active'}</AlertTitle>
      {status.message}
    </Alert>
  )
}
