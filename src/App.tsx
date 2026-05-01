import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BuilderPage } from './pages/BuilderPage'
import { CartPage } from './pages/CartPage'
import { InventoryPage } from './pages/InventoryPage'
import { OrdersPage } from './pages/OrdersPage'
import { AccountPage } from './pages/AccountPage'
import { CleaningPage } from './pages/CleaningPage'
import { FflTransferPage } from './pages/FflTransferPage'
import { ReceiversPage } from './pages/ReceiversPage'

const App = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<BuilderPage />} />
      <Route path="/receivers" element={<ReceiversPage />} />
      <Route path="/ffl-transfer" element={<FflTransferPage />} />
      <Route path="/cleaning" element={<CleaningPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  </AppShell>
)

export default App
