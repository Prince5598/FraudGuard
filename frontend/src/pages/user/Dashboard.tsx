import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  PlusIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DashboardData } from '../../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await userAPI.getDashboard();
        console.log("data",response.data);
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
            Welcome back, <span className="text-gradient">{dashboardData?.firstName || 'User'}</span>!
          </h1>
          <p className="text-white/60 text-lg">
            Monitor your transactions and account activity
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center lg:justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link to="/transaction/new">
            <AnimatedButton
              variant="primary"
              size="lg"
              icon={<PlusIcon className="h-5 w-5" />}
            >
              New Transaction
            </AnimatedButton>
          </Link>
          <Link to="/transactions">
            <AnimatedButton
              variant="secondary"
              size="lg"
              icon={<CreditCardIcon className="h-5 w-5" />}
            >
              View All Transactions
            </AnimatedButton>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-gradient rounded-xl">
                    <CreditCardIcon className="h-8 w-8 text-white" />
                  </div>
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {dashboardData?.total || 0}
                </h3>
                <p className="text-white/60 text-sm">Total Transactions</p>
              </div>
            </GlassCard>
          </motion.div>

        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-display">Recent Transactions</h2>
              <Link to="/transactions">
                <AnimatedButton variant="ghost" size="sm">
                  View All
                </AnimatedButton>
              </Link>
            </div>

            {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                          'bg-green-500/20 text-green-400'
                      }`}>
                        { false ? (
                          <ExclamationTriangleIcon className="h-5 w-5" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {transaction.transactionId}
                        </p>
                        <p className="text-white/60 text-sm">
                          {format(new Date(transaction.transactionTime), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-white/60 text-sm capitalize">
                        {transaction.transactionType}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCardIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-4">No transactions yet</p>
                <Link to="/transaction/new">
                  <AnimatedButton
                    variant="primary"
                    icon={<PlusIcon className="h-5 w-5" />}
                  >
                    Create your first transaction
                  </AnimatedButton>
                </Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;