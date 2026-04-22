import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4d5d30',
      dark: '#2f391f',
      light: '#7f8d5d',
      contrastText: '#fffaf0',
    },
    secondary: {
      main: '#745830',
      dark: '#44331d',
      light: '#a9864e',
      contrastText: '#fffaf0',
    },
    success: {
      main: '#3f6f32',
    },
    warning: {
      main: '#9a641c',
    },
    error: {
      main: '#a83c32',
    },
    background: {
      default: '#f4f0e7',
      paper: '#fffaf0',
    },
    text: {
      primary: '#202719',
      secondary: '#606553',
    },
    divider: 'rgba(67, 61, 45, 0.16)',
  },
  typography: {
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif",
    h1: {
      fontFamily: "'Cabinet Grotesk', 'Satoshi', system-ui, sans-serif",
      fontSize: 'clamp(2rem, 3.2vw, 3.25rem)',
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.04,
    },
    h2: {
      fontFamily: "'Cabinet Grotesk', 'Satoshi', system-ui, sans-serif",
      fontSize: 'clamp(1.55rem, 2.1vw, 2.2rem)',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h3: {
      fontFamily: "'Cabinet Grotesk', 'Satoshi', system-ui, sans-serif",
      fontSize: '1.45rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(67, 61, 45, 0.12)',
          boxShadow: '0 18px 45px rgba(51, 43, 29, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
})
