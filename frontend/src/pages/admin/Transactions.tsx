import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FunnelIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedInput from '../../components/ui/AnimatedInput';
import AnimatedSelect from '../../components/ui/AnimatedSelect';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Transaction, TransactionFilter } from '../../types';
import { toast } from 'react-toastify';

const transactionTypes = [
  { value: '', label: 'All Types' },
  { value: 'payment', label: 'Payment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'deposit', label: 'Deposit' },
];

const ITEMS_PER_PAGE = 5; // Show 5 transactions per page

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
      setCurrentPage(1); // Reset to first page when data changes
    } catch (err) {
      toast.error('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
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
  
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
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

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={<ChevronLeftIcon className="h-4 w-4" />}
        >
          Previous
        </AnimatedButton>
        
        {pages.map((page) => (
          <AnimatedButton
            key={page}
            variant={currentPage === page ? "primary" : "ghost"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className="min-w-[40px]"
          >
            {page}
          </AnimatedButton>
        ))}
        
        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={<ChevronRightIcon className="h-4 w-4" />}
        >
          Next
        </AnimatedButton>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white font-display mb-2">
              Transaction <span className="text-gradient">Management</span>
            </h1>
            <p className="text-white/60 text-lg">
              View and filter transactions across the system
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <AnimatedButton
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="h-5 w-5" />}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Fraud Analysis Modal */}
        {selectedTransaction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)} />
            <motion.div
              className="relative w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <GlassCard>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-white font-display">
                    Fraud Analysis Report
                  </h3>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTransaction(null)}
                    icon={<XMarkIcon className="h-5 w-5" />}
                  >
                    Close
                  </AnimatedButton>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-white/60 text-sm font-medium mb-1">Transaction ID</p>
                      <p className="text-white font-mono">{selectedTransaction.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm font-medium mb-1">Fraud Confidence</p>
                      <p className="text-white font-semibold">
                        {(selectedTransaction.fraudConfidence * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-3">Analysis Factors</p>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <ul className="space-y-2">
                        {selectedTransaction.fraudReason?.map((reason, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard>
              <h3 className="text-xl font-bold text-white font-display mb-6">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedInput
                  label="Email"
                  value={filters.email || ''}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                />
                
                <AnimatedInput
                  label="First Name"
                  value={filters.firstName || ''}
                  onChange={(e) => handleFilterChange('firstName', e.target.value)}
                />
                
                <AnimatedInput
                  label="Last Name"
                  value={filters.lastName || ''}
                  onChange={(e) => handleFilterChange('lastName', e.target.value)}
                />
                
                <AnimatedInput
                  label="User ID"
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                />
                
                <AnimatedSelect
                  label="Transaction Type"
                  options={transactionTypes}
                  value={filters.transactionType || ''}
                  onChange={(value) => handleFilterChange('transactionType', value)}
                  forceFloatLabel={true}
                />
                
                <AnimatedInput
                  label="City"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
                
                <AnimatedInput
                  label="Min Amount"
                  type="number"
                  step="0.01"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                />
                
                <AnimatedInput
                  label="Max Amount"
                  type="number"
                  step="0.01"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                />
                
                <AnimatedInput
                  label="Start Date"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  forceFloatLabel={true}
                />
                
                <AnimatedInput
                  label="End Date"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  forceFloatLabel={true}
                />
                
                <div className="flex items-center space-x-3 mt-8">
                  <input
                    id="isFraud"
                    name="isFraud"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-white/20 rounded bg-white/5"
                    checked={!!filters.isFraud}
                    onChange={(e) => handleFilterChange('isFraud', e.target.checked || undefined)}
                  />
                  <label htmlFor="isFraud" className="text-white/80 text-sm">
                    Fraudulent Transactions Only
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <AnimatedButton
                  variant="secondary"
                  onClick={resetFilters}
                  icon={<ArrowPathIcon className="h-5 w-5" />}
                >
                  Reset Filters
                </AnimatedButton>
                
                <AnimatedButton
                  variant="primary"
                  onClick={() => fetchTransactions(filters)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                >
                  Apply Filters
                </AnimatedButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-display flex items-center">
                <CreditCardIcon className="h-8 w-8 mr-3 text-primary-400" />
                Transactions ({transactions.length})
              </h2>
              {transactions.length > ITEMS_PER_PAGE && (
                <div className="text-white/60 text-sm">
                  Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCardIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No transactions found matching your criteria
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction._id}
                      className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            transaction.isFraud 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {transaction.isFraud ? (
                              <ExclamationTriangleIcon className="h-6 w-6" />
                            ) : (
                              <CheckCircleIcon className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {transaction.transactionId}
                            </h3>
                            <p className="text-white/60 text-sm">
                              {format(new Date(transaction.transactionTime), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                          <div className="text-center lg:text-left">
                            <p className="text-white font-semibold">${transaction.amount.toFixed(2)}</p>
                            <p className="text-white/60 text-sm capitalize">{transaction.transactionType}</p>
                          </div>
                          
                          <div className="text-center lg:text-left">
                            <p className="text-white/80">•••• {transaction.ccNum.slice(-4)}</p>
                            <p className="text-white/60 text-sm">{transaction.city || '—'}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.isFraud ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {transaction.isFraud ? 'Flagged' : 'Valid'}
                            </span>
                            {transaction.fraudReason && transaction.fraudReason.length > 0 && (
                              <AnimatedButton
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedTransaction(transaction)}
                                icon={<InformationCircleIcon className="h-4 w-4" />}
                              >
                                Details
                              </AnimatedButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Pagination */}
                {renderPagination()}
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default AdminTransactions;