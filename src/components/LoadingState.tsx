import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material'

export const LoadingState = ({ rows = 4 }: { rows?: number }) => (
  <Stack spacing={2} data-testid="status-loading">
    {Array.from({ length: rows }).map((_, index) => (
      <Card key={index}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rounded" width={80} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="45%" height={28} />
              <Skeleton width="72%" />
              <Skeleton width="28%" />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Stack>
)
