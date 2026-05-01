import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import type { InventoryItem } from '../types/domain'
import { availableQuantity, formatMoney, stockLabel } from '../utils/money'

interface PartCardProps {
  item: InventoryItem
  selected?: boolean
  onSelect: (item: InventoryItem) => void
  onAdd: (item: InventoryItem) => void
}

export const PartCard = ({ item, selected = false, onSelect, onAdd }: PartCardProps) => {
  const available = availableQuantity(item.quantity_on_hand, item.quantity_reserved)
  const disabled = available <= 0

  return (
    <Card
      data-testid={`card-part-${item.id}`}
      sx={{
        height: '100%',
        borderColor: selected ? 'primary.main' : 'divider',
        outline: selected ? '2px solid' : '0 solid',
        outlineColor: selected ? 'primary.light' : 'transparent',
        transition: 'transform 160ms ease, border-color 160ms ease',
        '&:hover': { transform: disabled ? 'none' : 'translateY(-2px)' },
        opacity: disabled ? 0.64 : 1,
      }}
    >
      <CardActionArea
        disabled={disabled}
        onClick={() => onSelect(item)}
        data-testid={`button-select-part-${item.id}`}
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" color="text.secondary" data-testid={`text-sku-${item.id}`}>
                {item.sku}
              </Typography>
              <Typography variant="h4" sx={{ lineHeight: 1.18 }} data-testid={`text-part-name-${item.id}`}>
                {item.name}
              </Typography>
            </Box>
            {selected && <CheckCircleIcon color="primary" data-testid={`status-selected-${item.id}`} />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
            {item.description}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {item.platform && <Chip size="small" color="primary" variant="outlined" label={item.platform} />}
            {item.caliber && <Chip size="small" label={item.caliber} />}
            {item.barrel_length && <Chip size="small" label={item.barrel_length} />}
            {item.finish && <Chip size="small" label={item.finish} />}
            {item.compatible_tags?.some((tag) => ['suppressor', 'nfa'].includes(tag.toLowerCase())) && (
              <Chip size="small" color="warning" label="NFA approval" />
            )}
          </Stack>
          <Divider sx={{ mt: 'auto' }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Box>
              <Typography variant="h4" color="primary.dark" data-testid={`text-price-${item.id}`}>
                {formatMoney(item.price)}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" color={available <= 2 ? 'warning.main' : 'text.secondary'}>
                <Inventory2OutlinedIcon fontSize="small" />
                <Typography variant="caption" data-testid={`text-availability-${item.id}`}>
                  {stockLabel(item.quantity_on_hand, item.quantity_reserved)}
                </Typography>
              </Stack>
            </Box>
            <Button
              variant="outlined"
              size="small"
              disabled={disabled}
              startIcon={<AddShoppingCartIcon />}
              onClick={(event) => {
                event.stopPropagation()
                onAdd(item)
              }}
              data-testid={`button-add-part-${item.id}`}
            >
              Add
            </Button>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
