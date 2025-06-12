import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  CreditCardIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { jwtDecode } from 'jwt-decode';

interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  fraudTransactions: number;
  fraudRate: number;
}

const state = (() => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<{ user: { firstName: string;} }>(token);
      return {
        firstName: decoded.firstName,
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

const AdminDashboard: React.FC = () => {
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStatistics();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }
  
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'bg-blue-500/20',
      link: '/admin/users'
    },
    {
      title: 'Total Transactions',
      value: stats?.totalTransactions || 0,
      icon: CreditCardIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'bg-green-500/20',
      link: '/admin/transactions'
    },
    {
      title: 'Fraud Transactions',
      value: stats?.totalFrauds || 0,
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'bg-red-500/20',
      link: '/admin/transactions?isFraud=true'
    },
    {
      title: 'Fraud Rate',
      value: stats?.fraudRate ? `${(stats.fraudRate)}%` : '0%',
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'bg-purple-500/20',
      link: '/admin/statistics'
    }
  ];
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white font-display mb-2">
            Welcome, <span className="text-gradient">{state?.firstName || 'Admin'}</span>!
          </h1>
          <p className="text-white/60 text-lg">
            Monitor and manage the fraud detection system
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={card.link}>
                <GlassCard hover className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgGradient} rounded-full -translate-y-16 translate-x-16`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${card.gradient} rounded-xl`}>
                        <card.icon className="h-8 w-8 text-white" />
                      </div>
                      <ArrowTrendingUpIcon className="h-6 w-6 text-primary-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {card.value}
                    </h3>
                    <p className="text-white/60 text-sm">{card.title}</p>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Quick Actions & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard>
              <h2 className="text-2xl font-bold text-white font-display mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'User Management', desc: 'View and search users', icon: UsersIcon, link: '/admin/users', color: 'blue' },
                  { title: 'Transaction Monitor', desc: 'View all transactions', icon: CreditCardIcon, link: '/admin/transactions', color: 'green' },
                  { title: 'Fraud Detection', desc: 'Review flagged items', icon: ExclamationTriangleIcon, link: '/admin/transactions?isFraud=true', color: 'red' },
                  { title: 'Analytics', desc: 'View system statistics', icon: ChartBarIcon, link: '/admin/statistics', color: 'purple' }
                ].map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <Link to={action.link}>
                      <div className={`p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-${action.color}-500/10 hover:border-${action.color}-500/30 transition-all duration-300 group`}>
                        <div className="flex items-center space-x-3">
                          <action.icon className={`h-6 w-6 text-${action.color}-400 group-hover:text-${action.color}-300 transition-colors`} />
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-white transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-white/60 text-sm">{action.desc}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
          
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white font-display">System Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Online</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'System Load', value: 28, icon: CpuChipIcon, color: 'blue' },
                  { label: 'API Response', value: 20, icon: ServerIcon, color: 'green' },
                  { label: 'Database Usage', value: 42, icon: ServerIcon, color: 'red' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className="space-y-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <metric.icon className="h-5 w-5 text-white/60" />
                        <span className="text-white font-medium">{metric.label}</span>
                      </div>
                      <span className="text-white/60 text-sm">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;