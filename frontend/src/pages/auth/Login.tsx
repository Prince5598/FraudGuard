import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { LogIn } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { toast } from 'react-toastify';

interface LoginFormData {
  email: string;
  password: string;
  isAdmin: boolean;
}

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const methods = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      isAdmin: false,
    },
  });
  
  const { handleSubmit, watch, register } = methods;
  const isAdmin = watch('isAdmin');
  
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = isAdmin
        ? await authAPI.adminLogin(data.email, data.password)
        : await authAPI.userLogin(data.email, data.password);
      
      const token  = response.data.data;
      console.log(token);
      login(token, isAdmin);
      
      toast.success('Login successful!');
      
      // Navigate after successful login
      navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Sign in to your account" 
      subtitle="Enter your credentials to access your account"
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
          <div>
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
              autoComplete="current-password"
              required
            />
            
            <div className="flex items-center my-4">
              <input
                id="isAdmin"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('isAdmin')}
              />
              <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                Login as Administrator
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            fullWidth 
            isLoading={loading}
            icon={<LogIn className="h-4 w-4" />}
          >
            Sign in
          </Button>
          
          <div className="text-sm text-center">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </FormProvider>
    </AuthLayout>
  );
};

export default Login;