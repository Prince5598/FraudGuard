import React, { useState } from 'react';
 import {jwtDecode} from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { 
  HomeIcon, 
  UserIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import GlassCard from '../components/ui/GlassCard';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

 const token = localStorage.getItem('token');
 console.log(token)
    if (token) {
      const decoded =  jwtDecode<{ user: { firstName: string; lastName: string;} }>(token);
      console.log(decoded.role);
    }
const state = (() => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<{ user: { firstName: string; lastName: string; } }>(token);
      return {
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isAdmin: decoded.role == 'admin' ? true : false,
      };
    }
  } catch {
    // You can optionally log error here

  }

  return {
    firstName: null,
    lastName: null,
    isAdmin: false,
  };
})();
console.log(state.firstName);
  const handleLogout = async () => {
    try {
      if (state.isAdmin) {
        await authAPI.adminLogout();
      } else {
        await authAPI.userLogout();
      }
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      navigate('/login');
    }
  };

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
    { name: 'New Transaction', href: '/transaction/new', icon: CreditCardIcon },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCardIcon },
    { name: 'Statistics', href: '/admin/statistics', icon: ChartBarIcon },
  ];

  const navigation = state.isAdmin ? adminNavigation : userNavigation;

  const Sidebar = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'w-full' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-6 m-4">
        <Link to={state.isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-3">
          <div className="p-2 bg-primary-gradient rounded-xl">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient font-display">FraudGuard</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary-gradient text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div >
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-gradient rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {state?.firstName} {state?.lastName}
              </p>
              <p className="text-xs text-white/60 truncate">
                {state.isAdmin ? 'Administrator' : 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
            Logout
          </button>
        </GlassCard>
      </div>
    </div>
  );

  
  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-70 lg:flex-col">
        <GlassCard className="flex-1 m-4 overflow-hidden">
          <Sidebar />
        </GlassCard>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            </motion.div>
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <GlassCard className="h-full m-4 overflow-hidden">
                <Sidebar mobile />
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64 ml-14 mr-14">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-gradient rounded-xl">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient font-display">FraudGuard</span>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="mt-auto p-4 lg:p-8">
          <GlassCard className="text-center py-4">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} FraudGuard. All rights reserved.
            </p>
          </GlassCard>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;