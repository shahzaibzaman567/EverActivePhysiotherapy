import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatAssistant from './components/AIChatAssistant';

// Import Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import MyAppointments from './pages/MyAppointments';
import AppointmentDetail from './pages/AppointmentDetail';
import AdminDashboard from './pages/AdminDashboard';
import BookFreeSession from './pages/BookFreeSession';

// Route Guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="loader-ring" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="loader-ring" />
      </div>
    );
  }

  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

// Layout wrapper to inject Navbar & Footer on public/patient pages
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 68px - 340px)' }}>
        {children}
      </main>
      <Footer />
      <AIChatAssistant />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages with Layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/doctors" element={<Layout><Doctors /></Layout>} />
          <Route path="/reviews" element={<Layout><Reviews /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/book-free-session" element={<Layout><BookFreeSession /></Layout>} />

          {/* Authentication Pages (No Navbar/Footer Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Secure User Pages with Layout */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/my-appointments" element={
            <PrivateRoute>
              <Layout>
                <MyAppointments />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/appointment/:id" element={
            <PrivateRoute>
              <Layout>
                <AppointmentDetail />
              </Layout>
            </PrivateRoute>
          } />

          {/* Secure Admin Pages (No Footer, but has custom dashboard UI) */}
          <Route path="/admin" element={
            <AdminRoute>
              <Navbar />
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
