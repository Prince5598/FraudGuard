import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import AnimatedInput from '../../components/ui/AnimatedInput';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { toast } from 'react-toastify';

interface LoginFormData {
  email: string;
  password: string;
  isAdmin: boolean;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      isAdmin: false,
    },
  });
  
  const isAdmin = watch('isAdmin');
  
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    
    try {
      const response = isAdmin
        ? await authAPI.adminLogin(data.email, data.password)
        : await authAPI.userLogin(data.email, data.password);
      
      const  token  = response.data.data;
      login(token, isAdmin);
      
      toast.success('Welcome back!');
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatedInput
          label="Email Address"
          type="email"
          icon={<EnvelopeIcon className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        
        <AnimatedInput
          label="Password"
          type="password"
          icon={<LockClosedIcon className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />
        
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <input
            id="isAdmin"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-white/20 rounded bg-white/5"
            {...register('isAdmin')}
          />
          <label htmlFor="isAdmin" className="text-sm text-white/80">
            Login as Administrator
          </label>
        </motion.div>
        
        <AnimatedButton
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={<ArrowRightIcon className="h-5 w-5" />}
          className="w-full"
        >
          Sign In
        </AnimatedButton>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <p className="text-white/60 text-sm">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

export default Login;