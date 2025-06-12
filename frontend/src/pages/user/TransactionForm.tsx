import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  PaperAirplaneIcon, 
  ArrowLeftIcon,
  CreditCardIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedInput from '../../components/ui/AnimatedInput';
import AnimatedSelect from '../../components/ui/AnimatedSelect';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { TransactionFormData } from '../../types';
import { toast } from 'react-toastify';

const transactionTypes = [
  { value: 'payment', label: 'Payment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'deposit', label: 'Deposit' },
];

const TransactionForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionType, setTransactionType] = useState('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<TransactionFormData>({
    defaultValues: {
      transactionId: '',
      transactionTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      ccNum: '',
      transactionType: '',
      amount: 0,
      city: '',
      userLocation: {
        lat: null,
        lon: null,
      },
      merchantLocation: {
        lat: null,
        lon: null,
      },
    },
  });

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('userLocation.lat', position.coords.latitude);
          setValue('userLocation.lon', position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [setValue]);
  
  const onSubmit = async (data: TransactionFormData) => {
    setStatus('processing');
    
    try {
      const formattedData = {
        ...data,
        transactionType,
        userLocation: data.userLocation?.lat ? data.userLocation : undefined,
        merchantLocation: data.merchantLocation?.lat ? data.merchantLocation : undefined,
      };
      
      await userAPI.submitTransaction(formattedData);
      
      setStatus('success');
      toast.success('Transaction submitted successfully!');
      
      setTimeout(() => {
        navigate('/transactions');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      toast.error(
        err.response?.data?.message || 
        'Failed to submit transaction. Please try again.'
      );
    }
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
              New <span className="text-gradient">Transaction</span>
            </h1>
            <p className="text-white/60 text-lg">
              Submit a new transaction for processing
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <AnimatedButton
              variant="secondary"
              onClick={() => navigate(-1)}
              icon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              Back
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Success Message */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GlassCard className="bg-green-500/10 border-green-500/30">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-green-500/20 rounded-full">
                  <PaperAirplaneIcon className="h-12 w-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Transaction Submitted!</h3>
                <p className="text-white/60">Redirecting to your transactions...</p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xl font-bold text-white font-display mb-6 flex items-center">
                    <CreditCardIcon className="h-6 w-6 mr-3 text-primary-400" />
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatedInput
                      label="Transaction ID"
                      icon={<CreditCardIcon className="h-5 w-5" />}
                      placeholder="e.g., TRANS12345"
                      error={errors.transactionId?.message}
                      {...register('transactionId', {
                        required: 'Transaction ID is required',
                        minLength: {
                          value: 5,
                          message: 'Transaction ID must be at least 5 characters',
                        },
                      })}
                    />
                    
                    <AnimatedInput
                      label="Transaction Time"
                      type="datetime-local"
                      icon={<ClockIcon className="h-5 w-5" />}
                      error={errors.transactionTime?.message}
                      forceFloatLabel={true}
                      {...register('transactionTime', {
                        required: 'Transaction time is required',
                      })}
                    />
                    
                    <AnimatedInput
                      label="Credit Card Number"
                      icon={<CreditCardIcon className="h-5 w-5" />}
                      placeholder="e.g., 4111111111111111"
                      error={errors.ccNum?.message}
                      {...register('ccNum', {
                        required: 'Credit card number is required',
                        pattern: {
                          value: /^\d{13,19}$/,
                          message: 'Please enter a valid credit card number',
                        },
                      })}
                    />
                    
                    <AnimatedSelect
                      label="Transaction Type"
                      options={transactionTypes}
                      value={transactionType}
                      onChange={setTransactionType}
                      forceFloatLabel={true}
                      icon={<CreditCardIcon className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Amount and Location */}
                <div>
                  <h3 className="text-xl font-bold text-white font-display mb-6 flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 mr-3 text-primary-400" />
                    Amount & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatedInput
                      label="Amount"
                      type="number"
                      step="0.01"
                      icon={<CurrencyDollarIcon className="h-5 w-5" />}
                      placeholder="0.00"
                      error={errors.amount?.message}
                      forceFloatLabel={true}
                      {...register('amount', {
                        required: 'Amount is required',
                        min: {
                          value: 0.01,
                          message: 'Amount must be greater than 0',
                        },
                      })}
                    />
                    
                    <AnimatedInput
                      label="City"
                      icon={<MapPinIcon className="h-5 w-5" />}
                      placeholder="e.g., New York"
                      {...register('city')}
                    />
                  </div>
                </div>

                {/* Location Coordinates */}
                <div>
                  <h3 className="text-xl font-bold text-white font-display mb-6 flex items-center">
                    <GlobeAltIcon className="h-6 w-6 mr-3 text-primary-400" />
                    Location Coordinates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white/80 font-medium mb-4">User Location</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <AnimatedInput
                          label="Latitude"
                          type="number"
                          step="any"
                          placeholder="e.g., 40.7128"
                          forceFloatLabel={true}
                          {...register('userLocation.lat')}
                        />
                        <AnimatedInput
                          label="Longitude"
                          type="number"
                          step="any"
                          placeholder="e.g., -74.0060"
                          forceFloatLabel={true}
                          {...register('userLocation.lon')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white/80 font-medium mb-4">Merchant Location</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <AnimatedInput
                          label="Latitude"
                          type="number"
                          step="any"
                          placeholder="e.g., 40.7128"
                          {...register('merchantLocation.lat')}
                        />
                        <AnimatedInput
                          label="Longitude"
                          type="number"
                          step="any"
                          placeholder="e.g., -74.0060"
                          {...register('merchantLocation.lon')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={status === 'processing'}
                    disabled={!transactionType}
                    icon={<PaperAirplaneIcon className="h-5 w-5" />}
                  >
                    Submit Transaction
                  </AnimatedButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default TransactionForm;