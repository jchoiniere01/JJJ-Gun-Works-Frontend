import { Box, Typography } from '@mui/material'

export const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box
      component="svg"
      aria-label="JJJ Gun Works logo"
      viewBox="0 0 64 64"
      sx={{ width: 42, height: 42, color: 'primary.dark' }}
    >
      <path d="M10 43.5h44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M17 31.5h30c4.5 0 7 2.5 7 6v3H10v-3c0-3.5 2.5-6 7-6Z" fill="currentColor" opacity="0.12" />
      <path d="M17 31.5h30c4.5 0 7 2.5 7 6v3H10v-3c0-3.5 2.5-6 7-6Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M23 31V19h6v12M35 31V19h6v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 19h22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 43.5v6h14v-6" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M49 37.5h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Box>
    <Box>
      <Typography
        variant="h4"
        component="div"
        sx={{ fontFamily: 'var(--display)', letterSpacing: '-0.015em', wordSpacing: '0.08em', lineHeight: 1 }}
      >
        JJJ Gun Works
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        AR Configurator
      </Typography>
    </Box>
  </Box>
)
