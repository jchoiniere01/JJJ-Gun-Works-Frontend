import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import type { BuildSelection, PartCategory } from '../types/domain'
import { formatMoney } from '../utils/money'

interface BuildSummaryProps {
  categories: PartCategory[]
  selection: BuildSelection
  onAddBuild: () => void
}

export const BuildSummary = ({ categories, selection, onAddBuild }: BuildSummaryProps) => {
  const requiredCategories = categories.filter((category) => category.required !== false)
  const selectedRequired = requiredCategories.filter((category) => Boolean(selection[category.slug])).length
  const progress = requiredCategories.length ? Math.round((selectedRequired / requiredCategories.length) * 100) : 0
  const selectedItems = categories.map((category) => ({ category, item: selection[category.slug] })).filter(({ item }) => item)
  const subtotal = selectedItems.reduce((sum, { item }) => sum + (item?.price ?? 0), 0)
  const missing = requiredCategories.filter((category) => !selection[category.slug])

  return (
    <Card
      data-testid="panel-build-summary"
      sx={{
        position: { md: 'sticky' },
        top: { md: 104 },
      }}
    >
      <CardContent>
        <Stack spacing={2.25}>
          <Box>
            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
              <Typography variant="h3">Build sheet</Typography>
              <Chip color={progress === 100 ? 'success' : 'warning'} label={`${progress}% ready`} data-testid="text-build-progress" />
            </Stack>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.5, height: 8, borderRadius: 20 }} />
          </Box>
          <Stack spacing={1}>
            {categories.map((category) => {
              const selected = selection[category.slug]
              return (
                <Stack
                  key={category.slug}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1.5}
                  data-testid={`row-build-${category.slug}`}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selected?.name ?? (category.required === false ? 'Optional' : 'Required')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} whiteSpace="nowrap">
                    {selected ? formatMoney(selected.price) : '—'}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography color="text.secondary">Parts subtotal</Typography>
            <Typography variant="h3" color="primary.dark" data-testid="text-build-total">
              {formatMoney(subtotal)}
            </Typography>
          </Stack>
          {missing.length > 0 ? (
            <Alert severity="warning" variant="outlined" data-testid="status-missing-required">
              Select {missing.map((category) => category.name).join(', ')} before reserving the complete build.
            </Alert>
          ) : (
            <Alert icon={<ShieldOutlinedIcon />} severity="success" variant="outlined" data-testid="status-build-ready">
              Required parts selected. Reservation will re-check live available quantity before submission.
            </Alert>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<AddShoppingCartIcon />}
            disabled={missing.length > 0}
            onClick={onAddBuild}
            data-testid="button-add-build"
          >
            Add build to cart
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
