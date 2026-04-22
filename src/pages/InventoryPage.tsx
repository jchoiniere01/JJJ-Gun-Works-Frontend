import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { categoryApi, inventoryApi, supplierApi } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { StatusBanner } from '../components/StatusBanner'
import type { InventoryItem, PartCategory, Supplier } from '../types/domain'
import { availableQuantity, formatMoney } from '../utils/money'

const emptyItem: Partial<InventoryItem> = {
  sku: '',
  name: '',
  description: '',
  category_id: 1,
  supplier_id: 1,
  price: 0,
  unit_cost: 0,
  quantity_on_hand: 0,
  quantity_reserved: 0,
  reorder_point: 0,
  finish: '',
  caliber: '',
  barrel_length: '',
  platform: 'AR-15',
}

export const InventoryPage = () => {
  const [tab, setTab] = useState(0)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<InventoryItem>>(emptyItem)
  const [categoryDraft, setCategoryDraft] = useState({ name: '', slug: '', description: '' })
  const [supplierDraft, setSupplierDraft] = useState({ name: '', contact_name: '', email: '', lead_time_days: 0 })

  const refresh = async () => {
    const [items, categoryData, supplierData] = await Promise.all([inventoryApi.list(), categoryApi.list(), supplierApi.list()])
    setInventory(items)
    setCategories(categoryData)
    setSuppliers(supplierData)
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load inventory.'))
      .finally(() => setLoading(false))
  }, [])

  const totals = useMemo(() => {
    const value = inventory.reduce((sum, item) => sum + item.price * availableQuantity(item.quantity_on_hand, item.quantity_reserved), 0)
    const low = inventory.filter((item) => availableQuantity(item.quantity_on_hand, item.quantity_reserved) <= (item.reorder_point ?? 0)).length
    return { value, low }
  }, [inventory])

  const openCreate = () => {
    setEditing({ ...emptyItem, category_id: categories[0]?.id ?? 1, supplier_id: suppliers[0]?.id ?? 1 })
    setDialogOpen(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const saveItem = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const payload: Partial<InventoryItem> = {
        ...editing,
        category_id: Number(editing.category_id),
        supplier_id: Number(editing.supplier_id),
        price: Number(editing.price),
        unit_cost: Number(editing.unit_cost),
        quantity_on_hand: Number(editing.quantity_on_hand),
        quantity_reserved: Number(editing.quantity_reserved),
        reorder_point: Number(editing.reorder_point),
      }
      if (editing.id) {
        await inventoryApi.update(editing.id, payload)
      } else {
        await inventoryApi.create(payload)
      }
      setDialogOpen(false)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save inventory item.')
    }
  }

  const deleteItem = async (id: number) => {
    setError('')
    try {
      await inventoryApi.remove(id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete inventory item.')
    }
  }

  const addCategory = async (event: FormEvent) => {
    event.preventDefault()
    const slug = categoryDraft.slug || categoryDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await categoryApi.create({ ...categoryDraft, slug, required: false })
    setCategoryDraft({ name: '', slug: '', description: '' })
    await refresh()
  }

  const addSupplier = async (event: FormEvent) => {
    event.preventDefault()
    await supplierApi.create(supplierDraft)
    setSupplierDraft({ name: '', contact_name: '', email: '', lead_time_days: 0 })
    await refresh()
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <StatusBanner />
        <LoadingState rows={5} />
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <StatusBanner />
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h1">Inventory operations</Typography>
          <Typography color="text.secondary">
            Manage InventoryItems, PartCategories, and Suppliers through FastAPI CRUD endpoints.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} data-testid="button-new-inventory">
          New item
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" data-testid="status-inventory-error">
          {error}
        </Alert>
      )}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Available inventory value" value={formatMoney(totals.value)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Low / reorder watch" value={String(totals.low)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Active suppliers" value={String(suppliers.filter((supplier) => supplier.active !== false).length)} />
        </Grid>
      </Grid>
      <Card>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons="auto">
          <Tab label="Inventory Items" data-testid="tab-inventory-items" />
          <Tab label="Part Categories" data-testid="tab-part-categories" />
          <Tab label="Suppliers" data-testid="tab-suppliers" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <TableContainer>
              <Table data-testid="table-inventory">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU / Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">On hand</TableCell>
                    <TableCell align="right">Reserved</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => {
                    const available = availableQuantity(item.quantity_on_hand, item.quantity_reserved)
                    return (
                      <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                        <TableCell>
                          <Typography fontWeight={700}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.category?.name || categories.find((category) => category.id === item.category_id)?.name || '—'}</TableCell>
                        <TableCell>{item.supplier?.name || suppliers.find((supplier) => supplier.id === item.supplier_id)?.name || '—'}</TableCell>
                        <TableCell align="right">{formatMoney(item.price)}</TableCell>
                        <TableCell align="right">{item.quantity_on_hand}</TableCell>
                        <TableCell align="right">{item.quantity_reserved}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={available}
                            color={available <= 0 ? 'error' : available <= (item.reorder_point ?? 0) ? 'warning' : 'success'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => openEdit(item)} data-testid={`button-edit-item-${item.id}`}>
                            <EditOutlinedIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => deleteItem(item.id)} data-testid={`button-delete-item-${item.id}`}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <Stack spacing={2}>
              <Box component="form" onSubmit={addCategory}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField required label="Name" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} data-testid="input-category-name" />
                  <TextField label="Slug" value={categoryDraft.slug} onChange={(e) => setCategoryDraft({ ...categoryDraft, slug: e.target.value })} data-testid="input-category-slug" />
                  <TextField label="Description" value={categoryDraft.description} onChange={(e) => setCategoryDraft({ ...categoryDraft, description: e.target.value })} data-testid="input-category-description" />
                  <Button type="submit" variant="contained" data-testid="button-add-category">
                    Add category
                  </Button>
                </Stack>
              </Box>
              <TableContainer>
                <Table data-testid="table-categories">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Slug</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Required</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{category.description || '—'}</TableCell>
                        <TableCell>{category.required === false ? 'Optional' : 'Required'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
          {tab === 2 && (
            <Stack spacing={2}>
              <Box component="form" onSubmit={addSupplier}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField required label="Name" value={supplierDraft.name} onChange={(e) => setSupplierDraft({ ...supplierDraft, name: e.target.value })} data-testid="input-supplier-name" />
                  <TextField label="Contact" value={supplierDraft.contact_name} onChange={(e) => setSupplierDraft({ ...supplierDraft, contact_name: e.target.value })} data-testid="input-supplier-contact" />
                  <TextField label="Email" value={supplierDraft.email} onChange={(e) => setSupplierDraft({ ...supplierDraft, email: e.target.value })} data-testid="input-supplier-email" />
                  <TextField type="number" label="Lead days" value={supplierDraft.lead_time_days} onChange={(e) => setSupplierDraft({ ...supplierDraft, lead_time_days: Number(e.target.value) })} data-testid="input-supplier-lead-days" />
                  <Button type="submit" variant="contained" data-testid="button-add-supplier">
                    Add supplier
                  </Button>
                </Stack>
              </Box>
              <TableContainer>
                <Table data-testid="table-suppliers">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Lead time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>{supplier.name}</TableCell>
                        <TableCell>{supplier.contact_name || '—'}</TableCell>
                        <TableCell>{supplier.email || '—'}</TableCell>
                        <TableCell>{supplier.lead_time_days ?? 0} days</TableCell>
                        <TableCell>
                          <Chip size="small" label={supplier.active === false ? 'Inactive' : 'Active'} color={supplier.active === false ? 'default' : 'success'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <Box component="form" onSubmit={saveItem}>
          <DialogTitle>{editing.id ? 'Edit inventory item' : 'Create inventory item'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField required fullWidth label="SKU" value={editing.sku ?? ''} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} data-testid="input-item-sku" />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField required fullWidth label="Name" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="input-item-name" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline minRows={2} label="Description" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} data-testid="input-item-description" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Category" value={editing.category_id ?? ''} onChange={(e) => setEditing({ ...editing, category_id: Number(e.target.value) })} data-testid="select-item-category">
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Supplier" value={editing.supplier_id ?? ''} onChange={(e) => setEditing({ ...editing, supplier_id: Number(e.target.value) })} data-testid="select-item-supplier">
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {[
                ['price', 'Price'],
                ['unit_cost', 'Unit cost'],
                ['quantity_on_hand', 'On hand'],
                ['quantity_reserved', 'Reserved'],
                ['reorder_point', 'Reorder point'],
              ].map(([field, label]) => (
                <Grid key={field} size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    value={(editing as Record<string, unknown>)[field] ?? 0}
                    onChange={(e) => setEditing({ ...editing, [field]: Number(e.target.value) })}
                    data-testid={`input-item-${field}`}
                  />
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Finish" value={editing.finish ?? ''} onChange={(e) => setEditing({ ...editing, finish: e.target.value })} data-testid="input-item-finish" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Caliber" value={editing.caliber ?? ''} onChange={(e) => setEditing({ ...editing, caliber: e.target.value })} data-testid="input-item-caliber" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Barrel length" value={editing.barrel_length ?? ''} onChange={(e) => setEditing({ ...editing, barrel_length: e.target.value })} data-testid="input-item-barrel-length" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} data-testid="button-cancel-item">
              Cancel
            </Button>
            <Button type="submit" variant="contained" data-testid="button-save-item">
              Save item
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h2" data-testid={`metric-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
        {value}
      </Typography>
    </CardContent>
  </Card>
)
