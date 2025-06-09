import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { authAPI } from '../../services/api';
import AuthLayout from '../../layouts/AuthLayout';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { toast } from 'react-toastify';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
}

const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const methods = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isAdmin: false,
    },
  });
  
  const { handleSubmit, watch, register, formState: { errors } } = methods;
  const isAdmin = watch('isAdmin');
  
  const validatePasswordMatch = (value: string) => {
    return value === watch('password') || 'Passwords do not match';
  };
  
  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAdmin) {
        await authAPI.adminSignup(data.firstName, data.lastName, data.email, data.password);
      } else {
        console.log(data.firstName);
        await authAPI.userSignup(data.firstName, data.lastName, data.email, data.password);
      }
      
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Create a new account" 
      subtitle="Fill in your details to create your account"
    >
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4" 
          onClose={() => setError(null)} 
        />
      )}
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                name="firstName"
                label="First Name"
                autoComplete="given-name"
                required
              />
              
              <FormInput
                name="lastName"
                label="Last Name"
                autoComplete="family-name"
                required
              />
            </div>
            
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              required
            />
            
            <FormInput
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
            />
            
            <FormInput
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              {...register('confirmPassword', {
                validate: validatePasswordMatch,
              })}
            />
            
            <div className="flex items-center">
              <input
                id="isAdmin"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('isAdmin')}
              />
              <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                Register as Administrator
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            fullWidth 
            isLoading={loading}
            icon={<UserPlus className="h-4 w-4" />}
          >
            Create Account
          </Button>
          
          <div className="text-sm text-center">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </FormProvider>
    </AuthLayout>
  );
};

export default Register;