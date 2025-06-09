import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { format } from 'date-fns';
import { userAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Send, ArrowLeft } from 'lucide-react';
import { TransactionFormData } from '../../types';

const transactionTypes = [
  { value: 'payment', label: 'Payment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'deposit', label: 'Deposit' },
];

const TransactionForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const methods = useForm<TransactionFormData>({
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
  
  const { handleSubmit, formState: { isValid, isDirty } } = methods;

  // Get user location on component mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          methods.setValue('userLocation.lat', position.coords.latitude);
          methods.setValue('userLocation.lon', position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [methods]);
  
  const onSubmit = async (data: TransactionFormData) => {
    setStatus('processing');
    setErrorMessage(null);
    
    try {
      // Convert form data to API format
      const formattedData = {
        ...data,
        // Clean up nullable location data
        userLocation: data.userLocation?.lat ? data.userLocation : undefined,
        merchantLocation: data.merchantLocation?.lat ? data.merchantLocation : undefined,
      };
      
      await userAPI.submitTransaction(formattedData);
      
      setStatus('success');
      
      // Reset form and navigate back to transactions after success
      setTimeout(() => {
        navigate('/transactions');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 
        'Failed to submit transaction. Please try again.'
      );
    }
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="New Transaction" 
        subtitle="Submit a new transaction for processing"
        action={
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
        }
      />
      
      {status === 'success' && (
        <Alert
          type="success"
          message="Transaction submitted successfully! Redirecting..."
          className="mb-6"
        />
      )}
      
      {status === 'error' && (
        <Alert
          type="error"
          message={errorMessage || 'An error occurred'}
          className="mb-6"
          onClose={() => setErrorMessage(null)}
        />
      )}
      
      <Card>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormInput
                  name="transactionId"
                  label="Transaction ID"
                  required
                  placeholder="e.g., TRANS12345"
                  helpText="A unique identifier for this transaction"
                />
                
                <FormInput
                  name="transactionTime"
                  label="Transaction Time"
                  type="datetime-local"
                  required
                />
                
                <FormInput
                  name="ccNum"
                  label="Credit Card Number"
                  required
                  placeholder="e.g., 4111111111111111"
                  helpText="Enter the full credit card number"
                />
                
                <FormSelect
                  name="transactionType"
                  label="Transaction Type"
                  options={transactionTypes}
                  required
                />
              </div>
              
              <div>
                <FormInput
                  name="amount"
                  label="Amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                />
                
                <FormInput
                  name="city"
                  label="City"
                  placeholder="e.g., New York"
                  helpText="City where the transaction occurred"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="userLocation.lat"
                    label="User Latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                  />
                  
                  <FormInput
                    name="userLocation.lon"
                    label="User Longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="merchantLocation.lat"
                    label="Merchant Latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                  />
                  
                  <FormInput
                    name="merchantLocation.lon"
                    label="Merchant Longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                isLoading={status === 'processing'}
                disabled={!isValid || !isDirty}
                icon={<Send className="h-4 w-4" />}
              >
                Submit Transaction
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
    </MainLayout>
  );
};

export default TransactionForm;