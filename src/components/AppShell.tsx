import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Logo } from './Logo'

const navItems = [
  { label: 'Builder', path: '/', icon: <BuildIcon /> },
  { label: 'Inventory', path: '/inventory', icon: <Inventory2OutlinedIcon /> },
  { label: 'Orders', path: '/orders', icon: <ReceiptLongOutlinedIcon /> },
]

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const isCompact = useMediaQuery('(max-width:760px)')
  const { itemCount } = useCart()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          background: 'rgba(244, 240, 231, 0.82)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 78, gap: 2, justifyContent: 'space-between' }}>
            <Button component={Link} to="/" color="inherit" sx={{ p: 0, minWidth: 'auto' }} data-testid="link-home">
              <Logo />
            </Button>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
              {navItems.map((item) =>
                isCompact ? (
                  <Tooltip key={item.path} title={item.label}>
                    <IconButton
                      component={Link}
                      to={item.path}
                      color={location.pathname === item.path ? 'primary' : 'default'}
                      data-testid={`link-${item.label.toLowerCase()}`}
                    >
                      {item.icon}
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    color={location.pathname === item.path ? 'primary' : 'inherit'}
                    startIcon={item.icon}
                    variant={location.pathname === item.path ? 'contained' : 'text'}
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                ),
              )}
              <Tooltip title="Cart and reservation">
                <IconButton component={Link} to="/cart" color="primary" data-testid="button-cart">
                  <Badge badgeContent={itemCount} color="secondary">
                    <ShoppingCartOutlinedIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Build dashboard">
                <IconButton color="default" data-testid="button-dashboard-indicator">
                  <DashboardCustomizeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }} id="main-content">
        {children}
      </Container>
    </Box>
  )
}
