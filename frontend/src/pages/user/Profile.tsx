import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { User, Save } from 'lucide-react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const Profile: React.FC = () => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const methods = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });
  const [profile, setProfile] = useState<ProfileFormData>({
  firstName: '',
  lastName: '',
  email: '',
});
  const { reset, handleSubmit } = methods;
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        const firstName = response.data.user.firstName || '';
        const lastName = response.data.user.lastName || '';
        const email = response.data.user.email || '';
  
        reset({
          firstName,
          lastName,
          email,
        });
        setProfile({ firstName, lastName, email });
      } catch (err) {
        setMessage({
          type: 'error',
          text: 'Failed to load profile data',
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [reset]);
  
  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true);
    setMessage(null);
    
    try {
      await userAPI.updateProfile(data.firstName, data.lastName);
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully',
      });
      setProfile({ firstName: data.firstName, lastName: data.lastName, email: data.email });
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to update profile',
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="Profile Settings" 
        subtitle="View and update your profile information"
      />
      
      {message && (
        <Alert
          type={message.type}
          message={message.text}
          className="mb-6"
          onClose={() => setMessage(null)}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
            <div className="border-t border-gray-200 w-full mt-6 pt-6">
              <div className="flex flex-col space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Account Type:</span>
                  <span className="ml-2 font-medium">User</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Member Since:</span>
                  <span className="ml-2 font-medium">
                    {new Date(state.user?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="lg:col-span-2" title="Edit Profile">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="firstName"
                    label="First Name"
                    required
                  />
                  
                  <FormInput
                    name="lastName"
                    label="Last Name"
                    required
                  />
                </div>
                
                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  disabled
                  helpText="Email address cannot be changed"
                  className="mt-6 bg-gray-50"
                />
                
                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={submitting}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;