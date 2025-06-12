import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserPlusIcon 
} from '@heroicons/react/24/outline';
import { authAPI } from '../../services/api';
import AuthLayout from '../../layouts/AuthLayout';
import AnimatedInput from '../../components/ui/AnimatedInput';
import AnimatedButton from '../../components/ui/AnimatedButton';
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isAdmin: false,
    },
  });
  
  const isAdmin = watch('isAdmin');
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    
    try {
      if (isAdmin) {
        await authAPI.adminSignup(data.firstName, data.lastName, data.email, data.password);
      } else {
        await authAPI.userSignup(data.firstName, data.lastName, data.email, data.password);
      }
      
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join FraudGuard to secure your transactions"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <AnimatedInput
            label="First Name"
            icon={<UserIcon className="h-5 w-5" />}
            error={errors.firstName?.message}
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
            })}
          />
          
          <AnimatedInput
            label="Last Name"
            icon={<UserIcon className="h-5 w-5" />}
            error={errors.lastName?.message}
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
            })}
          />
        </div>
        
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
        
        <AnimatedInput
          label="Confirm Password"
          type="password"
          icon={<LockClosedIcon className="h-5 w-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
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
            Register as Administrator
          </label>
        </motion.div>
        
        <AnimatedButton
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={<UserPlusIcon className="h-5 w-5" />}
          className="w-full"
        >
          Create Account
        </AnimatedButton>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <p className="text-white/60 text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

export default Register;