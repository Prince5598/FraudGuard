import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
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
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { Statistics } from '../../types';

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
  const [error, setError] = useState<string | null>(null);
  
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
        setError('Failed to load statistics');
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
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
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
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
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
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
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
        title="System Statistics"
        subtitle="View detailed statistics and analytics for the fraud detection system"
      />
      
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <div className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-medium mb-2">Transactions in 24hr </h3>
            <p className="text-4xl font-bold">{stats?.tx24h || 0}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-medium mb-2">Avg amount </h3>
            <p className="text-4xl font-bold">{stats?.avgTransactionAmount ? `${stats.avgTransactionAmount}$` : '0$'}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
          <div className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-medium mb-2">Fraud Rate</h3>
            <p className="text-4xl font-bold">{stats?.fraudRate ? `${stats.fraudRate }%` : '0%'}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-medium mb-2"> Avg Transaction </h3>
            <p className="text-4xl font-bold">
              {stats?.avgTxPerUser || 0}
            </p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Transactions by Type">
          <div className="p-4 h-80">
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </Card>
        
        <Card title="Transaction Status">
          <div className="p-4 h-80">
            <Doughnut 
              data={fraudChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
      
      <Card title="Transactions by City">
        <div className="p-4 h-80">
          <Doughnut 
            data={doughnutChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </Card>
    </MainLayout>
  );
};

export default AdminStatistics;