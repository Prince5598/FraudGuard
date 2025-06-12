import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import TransactionForm from './pages/user/TransactionForm';
import Transactions from './pages/user/Transactions';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTransactions from './pages/admin/Transactions';
import AdminStatistics from './pages/admin/Statistics';

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
}: { 
  children: React.ReactNode; 
  requireAuth?: boolean; 
  requireAdmin?: boolean;
}) => {
  const { state } = useAuth();
  const { isAuthenticated, isAdmin, loading } = state;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            } 
          />
          
          {/* User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transaction/new" 
            element={
              <ProtectedRoute>
                <TransactionForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/transactions" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminTransactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/statistics" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminStatistics />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      
      <ToastContainer 
        position="top-right" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
      />
    </AuthProvider>
  );
}

export default App;