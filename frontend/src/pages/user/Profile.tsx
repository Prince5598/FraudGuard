import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedInput from '../../components/ui/AnimatedInput';
import AnimatedButton from '../../components/ui/AnimatedButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { Watch } from 'lucide-react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}
interface ProfileShowData{
  firstName: string;
  lastName: string;
  email: string;
  create : string;
}

const Profile: React.FC = () => {
   
   const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileShowData>({
  firstName: '',
  lastName: '',
  email: '',
  create: ''
});
  
const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();

        const { firstName, lastName, email } = response.data.user;
        const create = response.data.user.createdAt;
        console.log(typeof(create))
        reset({
          firstName,
          lastName,
          email,
        });
        setProfile({ firstName, lastName, email, create });
      } catch (err) {
        toast.error('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [reset]);
  
  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true);
    
    try {
      const res = await userAPI.updateProfile(data.firstName, data.lastName);
      const d = {
        firstName : res.data.user.firstName,
        lastName : res.data.user.lastName,
        email : res.data.user.email,
        create: res.data.user.createdAt
      }
      toast.success('Profile updated successfully');
      setProfile({ firstName: d.firstName, lastName: d.lastName, email: d.email ,create : d.create });
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white font-display mb-2">
            Profile <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-white/60 text-lg">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="text-center">
              <div className="relative inline-block mb-6">
                <div className="h-24 w-24 bg-primary-gradient rounded-full flex items-center justify-center mx-auto">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-dark-800">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-white/60 mb-6">{profile.email}</p>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-white/60 text-sm">Email</p>
                    <p className="text-white text-sm font-medium">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <UserIcon className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-white/60 text-sm">Account Type</p>
                    <p className="text-white text-sm font-medium">User</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-white/60 text-sm">Member Since</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(profile.create || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          
          {/* Edit Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <h3 className="text-2xl font-bold text-white mb-6 font-display">
                Edit Profile
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    label="First Name"
                    icon={<UserIcon className="h-5 w-5" />}
                    error={errors.firstName?.message}
                    forceFloatLabel={true}
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
                    forceFloatLabel={true}
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
                  label="email"
                  type="email"
                  icon={<EnvelopeIcon className="h-5 w-5" />}
                  forceFloatLabel={true}
                  disabled
                  className="bg-white/5 opacity-60 cursor-not-allowed"
                  {...register('email')}
                />
                
                <p className="text-white/40 text-sm">
                  Email address cannot be changed for security reasons.
                </p>
                
                <div className="flex justify-end">
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={submitting}
                    
                    icon={<CheckIcon className="h-5 w-5" />}
                  >
                    Save Changes
                  </AnimatedButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;