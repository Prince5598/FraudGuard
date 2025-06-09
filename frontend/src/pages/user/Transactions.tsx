import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { userAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import { PlusCircle, Download, AlertCircle } from 'lucide-react';
import { Transaction } from '../../types';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const response = await userAPI.getTransactions();
      const tx = response.data?.transactions || [];
      setTransactions(tx);

      setTransactions(tx);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchTransactions();
}, []);

  const handleDownload = async () => {
    setDownloadLoading(true);
    
    try {
      const response = await userAPI.downloadTransactions();
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download transactions');
      console.error(err);
    } finally {
      setDownloadLoading(false);
    }
  };
  
  const columns = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
    },
    {
      key: 'transactionTime',
      header: 'Date & Time',
      render: (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    {
      key: 'transactionType',
      header: 'Type',
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: number) => (
        <span className="font-medium">${value.toFixed(2)}</span>
      ),
    },
    {
      key: 'ccNum',
      header: 'Card',
      render: (value: string) => (
        <span>
          •••• {value.slice(-4)}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      render: (value: string) => value || '—',
    },
    {
      key: 'isFraud',
      header: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {value ? (
            <>
              <AlertCircle className="mr-1 h-3 w-3" />
              Flagged
            </>
          ) : 'Completed'}
        </span>
      ),
    },
  ];
  
  return (
    <MainLayout>
      <PageHeader
        title="Transactions"
        subtitle="View and manage your transaction history"
        action={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              isLoading={downloadLoading}
              icon={<Download className="h-4 w-4" />}
            >
              Download CSV
            </Button>
            <Link to="/transaction/new">
              <Button
                icon={<PlusCircle className="h-4 w-4" />}
              >
                New Transaction
              </Button>
            </Link>
          </div>
        }
      />
      
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      
      <Card>
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          emptyMessage="No transactions found. Create your first transaction!"
        />
      </Card>
    </MainLayout>
  );
};

export default Transactions;