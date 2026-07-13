import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProdukPage from './pages/ProdukPage';
import ProductDetail from './pages/ProductDetail';
import SellAccount from './pages/SellAccount';
import RekberPage from './pages/RekberPage';
import Akun from './pages/Akun';
import ChatRoom from './pages/ChatRoom';
import ChatList from './pages/ChatList';
import SellerDashboard from './pages/SellerDashboard';
import RiwayatPage from './pages/RiwayatPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminListings from './pages/admin/AdminListings';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Market is the entry page */}
        <Route path="/" element={<Layout />}>
          <Route index element={<ProdukPage />} />
        </Route>
        <Route path="/produk" element={<Layout />}>
          <Route index element={<ProdukPage />} />
        </Route>
        <Route path="/product/:id" element={<Layout />}>
          <Route index element={<ProductDetail />} />
        </Route>
        <Route path="/jual" element={<Layout />}>
          <Route index element={<SellAccount />} />
        </Route>
        <Route path="/rekber" element={<Layout />}>
          <Route index element={<RekberPage />} />
        </Route>
        <Route path="/akun" element={<Layout />}>
          <Route index element={<Akun />} />
        </Route>
        <Route path="/seller" element={<Layout />}>
          <Route index element={<SellerDashboard />} />
        </Route>
        <Route path="/checkout/:id" element={<Layout />}>
          <Route index element={<Checkout />} />
        </Route>
        <Route path="/chats" element={<Layout />}>
          <Route index element={<ChatList />} />
        </Route>
        <Route path="/riwayat" element={<Layout />}>
          <Route index element={<RiwayatPage />} />
        </Route>
        <Route path="/chat/:transactionId" element={<Layout />}>
          <Route index element={<ChatRoom />} />
        </Route>
        <Route path="/room/:id" element={<Layout />}>
          <Route index element={<ChatRoom />} />
        </Route>
        <Route path="/login" element={<Layout />}>
          <Route index element={<Login />} />
        </Route>
        <Route path="/register" element={<Layout />}>
          <Route index element={<Register />} />
        </Route>
        <Route path="/404" element={<Layout />}>
          <Route index element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
