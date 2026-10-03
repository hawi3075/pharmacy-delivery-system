import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Protected from './components/Protected';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Addresses from './pages/Addresses';
import Support from './pages/Support';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminMessages from './admin/AdminMessages';
import AdminCustomers from './admin/AdminCustomers';
import AdminFinance from './admin/AdminFinance';
import AdminAdmins from './admin/AdminAdmins';
import AdminAudit from './admin/AdminAudit';
import AdminReviews from './admin/AdminReviews';

const CUSTOMER = ['CUSTOMER'];
const STAFF = ['ADMIN', 'SUPER_ADMIN'];

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/checkout" element={<Protected roles={CUSTOMER}><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected roles={CUSTOMER}><Orders /></Protected>} />
          <Route path="/addresses" element={<Protected roles={CUSTOMER}><Addresses /></Protected>} />
          <Route path="/support" element={<Protected roles={CUSTOMER}><Support /></Protected>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Protected roles={STAFF}><AdminLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="admins" element={<Protected roles={['SUPER_ADMIN']}><AdminAdmins /></Protected>} />
            <Route path="audit" element={<Protected roles={['SUPER_ADMIN']}><AdminAudit /></Protected>} />
          </Route>
          <Route path="*" element={<p className="p-10 text-center">Page not found</p>} />
        </Routes>
      </main>
      <ChatWidget />
    </>
  );
}
