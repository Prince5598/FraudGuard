import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import { PlusCircle, Download, AlertCircle } from 'lucide-react';
import { Transaction } from '../../types';

const ITEMS_PER_PAGE = 5;  
const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLoading, setDownloadLoading] = useState(false);
  useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const response = await userAPI.getTransactions();
      const tx = response.data?.transactions || [];
      setTransactions(tx);
      console.log(transactions.length)
    } catch (err) {
      
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
      
      console.error(err);
    } finally {
      setDownloadLoading(false);
    }
  };
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
              My <span className="text-gradient">Transactions</span>
            </h1>
            <p className="text-white/60 text-lg">
              View and manage your transaction history
            </p>
          </div>
          <div className="flex space-x-4 mt-4 lg:mt-0">
            <AnimatedButton
              variant="secondary"
              onClick={handleDownload}
              isLoading={downloadLoading}
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            >
              Download CSV
            </AnimatedButton>
            <Link to="/transaction/new">
              <AnimatedButton
                variant="primary"
                icon={<PlusIcon className="h-5 w-5" />}
              >
                New Transaction
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-gradient rounded-xl">
                    <CreditCardIcon className="h-8 w-8 text-white" />
                  </div>
                  <ClockIcon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {transactions.length}
                </h3>
                <p className="text-white/60 text-sm">Total Transactions</p>
              </div>
            </GlassCard>
          </motion.div>

        </div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-display flex items-center">
                <CreditCardIcon className="h-8 w-8 mr-3 text-primary-400" />
                All Transactions
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
                <p className="text-white/60 text-lg mb-4">No transactions found</p>
                <Link to="/transaction/new">
                  <AnimatedButton
                    variant="primary"
                    icon={<PlusIcon className="h-5 w-5" />}
                  >
                    Create your first transaction
                  </AnimatedButton>
                </Link>
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
                {renderPagination()}
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Transactions;