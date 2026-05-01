import { Box, Chip, Stack, Typography } from '@mui/material'
import type { BuildSelection, InventoryItem, WeaponPlatform } from '../types/domain'

export const ConfiguratorVisual = ({ selection, platform }: { selection: BuildSelection; platform?: WeaponPlatform }) => {
  const selectedItems = Object.values(selection).filter(Boolean) as InventoryItem[]
  const imageItems = selectedItems.filter((item) => item.image_url)
  const finish = selection['lower-receiver']?.finish || selection['upper-receiver']?.finish || selection.handguard?.finish || ''
  const finishColor = finish.toLowerCase().includes('fde')
    ? '#8c7650'
    : finish.toLowerCase().includes('tungsten')
      ? '#6d6d66'
      : finish.toLowerCase().includes('nickel')
        ? '#c8c3b4'
        : '#29311d'
  const barrelLength = selection.barrel?.barrel_length || ''
  const isShortBarrel = barrelLength.includes('9') || barrelLength.includes('10') || barrelLength.includes('11')

  const labels = [
    selection['lower-receiver']?.finish || 'Lower',
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
        <Chip size="small" color={platform ? 'primary' : 'default'} label={platform || 'Choose platform'} />
        {labels.map((label) => (
          <Chip key={label} size="small" label={label} />
        ))}
      </Stack>
      {imageItems.length > 0 && (
        <Box
          sx={{
            mb: 2,
            display: 'grid',
            gridTemplateColumns: imageItems.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 1,
          }}
          data-testid="visual-selected-images"
        >
          {imageItems.slice(0, 4).map((item) => (
            <Box key={item.id} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, minHeight: 110 }}>
              <Box
                component="img"
                src={item.image_url}
                alt={item.name}
                sx={{ width: '100%', height: 150, objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  p: 1,
                  bgcolor: 'rgba(32,39,25,0.72)',
                  color: '#fffaf0',
                }}
              >
                <Typography variant="caption" fontWeight={700}>{item.category?.name || item.name}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
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
        <path d="M112 96h278c25 0 42 9 52 27h-330Z" fill={finishColor} opacity="0.92" />
        <path d="M382 102h104v44H362l-19-23 19-21Z" fill="#1f2419" opacity="0.9" />
        <path d="M478 111h124v24H478Z" fill={selection.handguard?.finish?.toLowerCase().includes('fde') ? '#8c7650' : '#745830'} opacity="0.86" />
        <path d={isShortBarrel ? 'M602 118h70v10H602Z' : 'M602 118h112v10H602Z'} fill="#1f2419" />
        <path d="M142 84h74v22h-74zM228 84h78v22h-78z" fill="#f4f0e7" opacity="0.22" />
        <path d="M143 143h96l-25 46h-54z" fill={finishColor} opacity="0.72" />
        <path d={selection['stock-brace'] ? 'M91 111l-60 24 12 25 78-17z' : 'M96 112l-42 16 9 20 58-13z'} fill={finishColor} opacity="0.82" />
        <path d="M99 94h42v52H99z" fill="#1f2419" opacity="0.9" />
        <path d="M228 136c6 28 22 43 49 45l18-38" fill="none" stroke="#1f2419" strokeWidth="13" strokeLinecap="round" />
        <path d="M340 102l28-42h72l15 42" fill="none" stroke="#1f2419" strokeWidth="15" strokeLinejoin="round" />
        <path d="M520 111v24M548 111v24M576 111v24" stroke="#f4f0e7" strokeWidth="5" opacity="0.4" />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Preview updates from selected inventory. When item image URLs are available, selected part photos appear above the build silhouette.
      </Typography>
    </Box>
  )
}
