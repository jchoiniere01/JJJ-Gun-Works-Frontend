import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import { categoryApi, inventoryApi, supplierApi } from '../api/client'
import { BuildSummary } from '../components/BuildSummary'
import { ConfiguratorVisual } from '../components/ConfiguratorVisual'
import { LoadingState } from '../components/LoadingState'
import { PartCard } from '../components/PartCard'
import { StatusBanner } from '../components/StatusBanner'
import { useCart } from '../context/CartContext'
import type { BuildSelection, InventoryItem, PartCategory, Supplier } from '../types/domain'

const sortCategories = (categories: PartCategory[]) =>
  [...categories].sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id))

export const BuilderPage = () => {
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [activeSlug, setActiveSlug] = useState('lower-receiver')
  const [selection, setSelection] = useState<BuildSelection>({})
  const [search, setSearch] = useState('')
  const [finish, setFinish] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    let mounted = true
    Promise.all([categoryApi.list(), inventoryApi.list(), supplierApi.list()])
      .then(([categoryData, inventoryData, supplierData]) => {
        if (!mounted) return
        const sorted = sortCategories(categoryData)
        setCategories(sorted)
        setInventory(inventoryData)
        setSuppliers(supplierData)
        setActiveSlug(sorted[0]?.slug ?? 'lower-receiver')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load configurator data.')
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const activeCategory = categories.find((category) => category.slug === activeSlug)

  const finishes = useMemo(() => {
    const values = inventory.map((item) => item.finish).filter(Boolean) as string[]
    return ['all', ...Array.from(new Set(values))]
  }, [inventory])

  const filteredParts = useMemo(() => {
    if (!activeCategory) return []
    const term = search.trim().toLowerCase()
    return inventory
      .filter((item) => item.category_id === activeCategory.id)
      .filter((item) => finish === 'all' || item.finish === finish)
      .filter((item) => {
        if (!term) return true
        return [item.name, item.sku, item.description, item.caliber, item.platform]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term))
      })
  }, [activeCategory, finish, inventory, search])

  const selectItem = (item: InventoryItem) => {
    const category = categories.find((candidate) => candidate.id === item.category_id)
    if (!category) return
    setSelection((current) => ({ ...current, [category.slug]: item }))
  }

  const addBuild = () => {
    Object.values(selection).forEach((item) => {
      if (item) addItem(item, 1)
    })
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <StatusBanner />
        <LoadingState rows={5} />
      </Stack>
    )
  }

  if (error) {
    return (
      <Alert severity="error" data-testid="status-builder-error">
        {error}
      </Alert>
    )
  }

  return (
    <Stack spacing={3.5}>
      <StatusBanner />
      <Grid container spacing={3.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              minHeight: 360,
              background:
                'linear-gradient(135deg, rgba(255,250,240,0.92), rgba(232,225,211,0.78)), linear-gradient(90deg, rgba(77,93,48,0.12), transparent)',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    <Chip label="Custom AR platform builds" color="secondary" sx={{ alignSelf: 'flex-start' }} />
                    <Typography variant="h1" data-testid="text-page-title">
                      Configure, price, reserve, and order from one build bench.
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '1.05rem', maxWidth: 620 }}>
                      Select parts by build stage, watch the subtotal update in real time, then reserve inventory through oversell-protected backend reservations before submitting the order.
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`${inventory.length} inventory items`} />
                      <Chip label={`${categories.length} part categories`} />
                      <Chip label={`${suppliers.length} suppliers`} />
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ConfiguratorVisual selection={selection} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <BuildSummary categories={categories} selection={selection} onAddBuild={addBuild} />
        </Grid>
      </Grid>

      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 104 } }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h3">Build stages</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Pick a category, then choose the part that matches the customer build.
                </Typography>
                {categories.map((category) => (
                  <Button
                    key={category.slug}
                    variant={activeSlug === category.slug ? 'contained' : 'text'}
                    color={activeSlug === category.slug ? 'primary' : 'inherit'}
                    onClick={() => setActiveSlug(category.slug)}
                    data-testid={`button-category-${category.slug}`}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <span>{category.name}</span>
                    {selection[category.slug] && <Chip size="small" label="Set" color="success" />}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack spacing={2.5}>
            <Card>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <TuneIcon color="primary" />
                      <Typography variant="h2">{activeCategory?.name}</Typography>
                      {activeCategory?.required !== false && <Chip color="warning" label="Required" />}
                    </Stack>
                    <Typography color="text.secondary">{activeCategory?.description}</Typography>
                  </Box>
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    label="Search parts"
                    size="small"
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    data-testid="input-search-parts"
                  />
                  <TextField
                    select
                    value={finish}
                    onChange={(event) => setFinish(event.target.value)}
                    label="Finish"
                    size="small"
                    sx={{ minWidth: 150 }}
                    data-testid="select-finish"
                  >
                    {finishes.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value === 'all' ? 'All finishes' : value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </CardContent>
            </Card>
            {filteredParts.length === 0 ? (
              <Alert severity="info" data-testid="status-no-parts">
                No parts match the current filters. Clear the search or select another finish.
              </Alert>
            ) : (
              <Grid container spacing={2.5}>
                {filteredParts.map((part) => (
                  <Grid key={part.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                    <PartCard
                      item={part}
                      selected={selection[activeSlug]?.id === part.id}
                      onSelect={selectItem}
                      onAdd={addItem}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
