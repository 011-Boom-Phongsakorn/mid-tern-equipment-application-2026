import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Equipment from './pages/Equipment';
import EquipmentDetail from './pages/EquipmentDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminChat from './pages/admin/AdminChat';

// Components
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes - without Layout */}
          <Route path="/admin" element={<Layout><AdminLayout /></Layout>}>
            <Route index element={<AdminDashboard />} />
            <Route path="equipment" element={<AdminEquipment />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="chat" element={<AdminChat />} />
          </Route>

          {/* Public Routes - with Layout */}
          <Route element={<Layout><Home /></Layout>} path="/" />
          <Route path="/login" element={<Layout><GuestRoute><Login /></GuestRoute></Layout>} />
          <Route path="/register" element={<Layout><GuestRoute><Register /></GuestRoute></Layout>} />
          <Route path="/equipment" element={<Layout><Equipment /></Layout>} />
          <Route path="/equipment/:id" element={<Layout><EquipmentDetail /></Layout>} />

          {/* Protected Routes */}
          <Route
            path="/my-bookings"
            element={
              <Layout>
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Layout>
            }
          />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
