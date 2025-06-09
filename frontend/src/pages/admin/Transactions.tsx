import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { adminAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import { Search, RefreshCcw, Filter, AlertCircle, Info } from 'lucide-react';
import { Transaction, TransactionFilter } from '../../types';

const transactionTypes = [
  { value: '', label: 'All Types' },
  { value: 'payment', label: 'Payment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'deposit', label: 'Deposit' },
];

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<TransactionFilter>({
    email: '',
    firstName: '',
    lastName: '',
    userId: '',
    transactionType: '',
    minAmount: undefined,
    maxAmount: undefined,
    startDate: '',
    endDate: '',
    isFraud: searchParams.get('isFraud') === 'true',
    city: '',
  });
  
  const fetchTransactions = async (currentFilters: TransactionFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanFilters = Object.entries(currentFilters).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );
      
      const response = await adminAPI.getFilteredTransactions(cleanFilters);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Update filters when URL changes
    const isFraud = searchParams.get('isFraud') === 'true';
    setFilters(prev => ({
      ...prev,
      isFraud: isFraud || undefined
    }));
    
    fetchTransactions({
      ...filters,
      isFraud: isFraud || undefined
    });
  }, [location.search]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFilters((prev) => ({
        ...prev,
        [name]: checkbox.checked || undefined,
      }));
    } else if (type === 'number') {
      setFilters((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const resetFilters = () => {
    setFilters({
      email: '',
      firstName: '',
      lastName: '',
      userId: '',
      transactionType: '',
      minAmount: undefined,
      maxAmount: undefined,
      startDate: '',
      endDate: '',
      isFraud: undefined,
      city: '',
    });
    fetchTransactions({});
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
      key: 'userId',
      header: 'User',
      render: (_: any, item: Transaction) => (
        <div className="whitespace-normal">
          <div className="font-medium">
            {item.userId?.firstName} {item.userId?.lastName}
          </div>
          {item.userId?.email && (
            <div className="text-xs text-gray-500">{item.userId.email}</div>
          )}
        </div>
      ),
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
      render: (value: boolean, item: Transaction) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {value ? (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                Flagged
              </>
            ) : 'Valid'}
          </span>
          {item.fraudReason && item.fraudReason.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedTransaction(item)}
              icon={<Info className="h-3 w-3" />}
            >
              Report
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <MainLayout>
      <PageHeader
        title="Transaction Management"
        subtitle="View and filter transactions across the system"
        action={
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-4 w-4" />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
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
      
      {selectedTransaction && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">
                Fraud Analysis Report
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="mt-1">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fraud Confidence</p>
                  <p className="mt-1">
                    {(selectedTransaction.fraudConfidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Analysis Factors
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedTransaction.fraudReason?.map((reason, index) => (
                      <li 
                        key={index}
                        className="text-sm flex items-start"
                      >
                        <span className="text-gray-400 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {showFilters && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.email || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.firstName || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.lastName || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.userId || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                id="transactionType"
                name="transactionType"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.transactionType || ''}
                onChange={handleFilterChange}
              >
                {transactionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.city || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                id="minAmount"
                name="minAmount"
                type="number"
                step="0.01"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.minAmount || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                id="maxAmount"
                name="maxAmount"
                type="number"
                step="0.01"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.maxAmount || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.startDate || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.endDate || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="flex items-center mt-7">
              <input
                id="isFraud"
                name="isFraud"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={!!filters.isFraud}
                onChange={(e) => 
                  setFilters((prev) => ({
                    ...prev,
                    isFraud: e.target.checked || undefined,
                  }))
                }
              />
              <label htmlFor="isFraud" className="ml-2 block text-sm text-gray-900">
                Fraudulent Transactions Only
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={resetFilters}
              icon={<RefreshCcw className="h-4 w-4" />}
            >
              Reset Filters
            </Button>
            
            <Button
              onClick={() => fetchTransactions(filters)}
              icon={<Search className="h-4 w-4" />}
            >
              Apply Filters
            </Button>
          </div>
        </Card>
      )}
      
      <Card>
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          emptyMessage="No transactions found matching your criteria"
        />
      </Card>
    </MainLayout>
  );
};

export default AdminTransactions;