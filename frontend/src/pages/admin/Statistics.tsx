import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Statistics } from '../../types';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminStatistics: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [transactionsByType, setTransactionsByType] = useState<Record<string, number>>({});
  const [transactionsByCity, setTransactionsByCity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await adminAPI.getStatistics();
        setStats(response.data);
        
        for(let i = 0; i < response.data.transactionsByType.length; i++) {  
          const type = response.data.transactionsByType[i].type;
          const count = response.data.transactionsByType[i].count;
          setTransactionsByType(prev => ({
            ...prev,
            [type]: count,
          }));
        }


        for(let i = 0; i < response.data.transactionsByCity.length; i++) {
          const city = response.data.transactionsByCity[i].city;
          const count = response.data.transactionsByCity[i].count;
          setTransactionsByCity(prev => ({
            ...prev,
            [city]: count,
          }));
        }

      } catch (err) {
        toast.error('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  const barChartData = {
    labels: Object.keys(transactionsByType),
    datasets: [
      {
        label: 'Number of Transactions',
        data: Object.values(transactionsByType),
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };
  
  const doughnutChartData = {
    labels: Object.keys(transactionsByCity),
    datasets: [
      {
        label: 'Transactions by City',
        data: Object.values(transactionsByCity),
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };
  
  const fraudChartData = {
    labels: ['Valid Transactions', 'Fraudulent Transactions'],
    datasets: [
      {
        label: 'Transaction Status',
        data: stats
          ? [stats.totalTransactions - stats.totalFrauds, stats.totalFrauds]
          : [0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Inter',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };
  
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
      title: 'Transactions in Last 24hr',
      value: stats?.tx24h || 0,
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'bg-blue-500/20'
    },
    {
      title: 'Average Transaction Amount',
      value: stats?.avgTransactionAmount ? `${stats.avgTransactionAmount} $` : '0$',
      icon: CreditCardIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'bg-green-500/20'
    },
    {
      title: 'Blocked Users',
      value: stats?.blockedUsers || 0,
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'bg-red-500/20'
    },
    {
      title: 'Average Transactions By User',
      value: stats?.avgTxPerUser ? `${(stats.avgTxPerUser)}` : '0',
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'bg-purple-500/20'
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
            System <span className="text-gradient">Statistics</span>
          </h1>
          <p className="text-white/60 text-lg">
            View detailed statistics and analytics for the fraud detection system
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="relative overflow-hidden text-center">
                <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgGradient} rounded-full -translate-y-16 translate-x-16`} />
                <div className="relative">
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {card.value}
                  </h3>
                  <p className="text-white/60">{card.title}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard>
              <h2 className="text-2xl font-bold text-white font-display mb-6">
                Transactions by Type
              </h2>
              <div className="h-80">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </GlassCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <GlassCard>
              <h2 className="text-2xl font-bold text-white font-display mb-6">
                Transaction Status
              </h2>
              <div className="h-80">
                <Doughnut data={fraudChartData} options={chartOptions} />
              </div>
            </GlassCard>
          </motion.div>
        </div>
        
        {/* City Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <GlassCard>
            <h2 className="text-2xl font-bold text-white font-display mb-6">
              Transactions by City
            </h2>
            <div className="h-80">
              <Doughnut data={doughnutChartData} options={chartOptions} />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default AdminStatistics;