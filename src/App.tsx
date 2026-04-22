import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BuilderPage } from './pages/BuilderPage'
import { CartPage } from './pages/CartPage'
import { InventoryPage } from './pages/InventoryPage'
import { OrdersPage } from './pages/OrdersPage'

const App = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<BuilderPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>
  </AppShell>
)

export default App
