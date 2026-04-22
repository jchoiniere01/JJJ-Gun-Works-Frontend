import { Box, Chip, Stack, Typography } from '@mui/material'
import type { BuildSelection } from '../types/domain'

export const ConfiguratorVisual = ({ selection }: { selection: BuildSelection }) => {
  const labels = [
    selection['upper-receiver']?.finish || 'Upper',
    selection.barrel?.barrel_length || 'Barrel',
    selection.handguard?.finish || 'Rail',
    selection['stock-brace']?.finish || 'Stock',
  ]

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,250,240,0.82), rgba(231,223,207,0.9))',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
      data-testid="visual-build-preview"
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {labels.map((label) => (
          <Chip key={label} size="small" label={label} />
        ))}
      </Stack>
      <Box
        component="svg"
        viewBox="0 0 760 220"
        role="img"
        aria-label="Stylized AR platform build preview"
        sx={{ width: '100%', height: 'auto', color: 'primary.dark' }}
      >
        <defs>
          <linearGradient id="metal" x1="0" x2="1">
            <stop offset="0%" stopColor="#59633f" />
            <stop offset="48%" stopColor="#29311d" />
            <stop offset="100%" stopColor="#7b6847" />
          </linearGradient>
        </defs>
        <path d="M112 120h448l35 18H132c-13 0-22-5-20-18Z" fill="url(#metal)" opacity="0.22" />
        <path d="M112 96h278c25 0 42 9 52 27h-330Z" fill="currentColor" opacity="0.9" />
        <path d="M382 102h104v44H362l-19-23 19-21Z" fill="#1f2419" opacity="0.9" />
        <path d="M478 111h124v24H478Z" fill="#745830" opacity="0.8" />
        <path d="M602 118h112v10H602Z" fill="#1f2419" />
        <path d="M142 84h74v22h-74zM228 84h78v22h-78z" fill="#f4f0e7" opacity="0.22" />
        <path d="M143 143h96l-25 46h-54z" fill="currentColor" opacity="0.72" />
        <path d="M91 111l-60 24 12 25 78-17z" fill="currentColor" opacity="0.82" />
        <path d="M99 94h42v52H99z" fill="#1f2419" opacity="0.9" />
        <path d="M228 136c6 28 22 43 49 45l18-38" fill="none" stroke="#1f2419" strokeWidth="13" strokeLinecap="round" />
        <path d="M340 102l28-42h72l15 42" fill="none" stroke="#1f2419" strokeWidth="15" strokeLinejoin="round" />
        <path d="M520 111v24M548 111v24M576 111v24" stroke="#f4f0e7" strokeWidth="5" opacity="0.4" />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Preview is representative. Actual build details come from selected inventory items and backend order records.
      </Typography>
    </Box>
  )
}
