import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import { Users, AlertTriangle, FileText, PieChart } from 'lucide-react';
import {jwtDecode} from 'jwt-decode';

interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalFrauds: number;
  blockedUsers: number;
}

const AdminDashboard: React.FC = () => {
  // const { state } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const state = {
      firstName: (() => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const decoded = jwtDecode<{ user: { firstname: string } }>(token);
            return decoded.firstName;
          }
        } catch {
          return null;
        }
        return null;
      })(),
    }

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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader
        title={`Welcome, ${state?.firstName || 'Admin'}!`}
        subtitle="Monitor and manage the fraud detection system"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/users" 
              className="text-sm font-medium text-blue-100 hover:text-white"
            >
              View all users →
            </Link>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Transactions</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalTransactions || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/transactions" 
              className="text-sm font-medium text-green-100 hover:text-white"
            >
              View all transactions →
            </Link>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Fraud Transactions</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalFrauds || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/transactions?isFraud=true" 
              className="text-sm font-medium text-red-100 hover:text-white"
            >
              View fraudulent transactions →
            </Link>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Blocked Users</p>
              <p className="text-3xl font-bold mt-1">
                {stats?.blockedUsers   ? `${stats.blockedUsers }` : 0}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <PieChart className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/statistics" 
              className="text-sm font-medium text-purple-100 hover:text-white"
            >
              View detailed statistics →
            </Link>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="System Overview">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-blue-50 transition-colors">
                <Link to="/admin/users" className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">User Management</span>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  View and search for users
                </p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-green-50 transition-colors">
                <Link to="/admin/transactions" className="flex items-center">
                  <FileText className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">Transaction Monitoring</span>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  View and filter transactions
                </p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-red-50 transition-colors">
                <Link to="/admin/transactions?isFraud=true" className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="font-medium">Fraud Detection</span>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  Review flagged transactions
                </p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-purple-50 transition-colors">
                <Link to="/admin/statistics" className="flex items-center">
                  <PieChart className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="font-medium">Statistics & Reporting</span>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  View detailed system analytics
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="System Status">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-medium">Fraud Detection System</h3>
                <p className="text-sm text-gray-500">Real-time monitoring active</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">System Load</span>
                  <span className="text-sm text-gray-500">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-gray-500">120ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Database Usage</span>
                  <span className="text-sm text-gray-500">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;