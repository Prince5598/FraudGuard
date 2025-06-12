import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  UsersIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
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
import { UserProfile } from '../../types';
import { toast } from 'react-toastify';

const searchFieldOptions = [
  { value: 'email', label: 'Email Address' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
];

const ITEMS_PER_PAGE = 6; // Adjust based on screen size

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'email' | 'firstName' | 'lastName'>('email');
  const [currentPage, setCurrentPage] = useState(1);
  
  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      if (searchQuery) {
        const response = await adminAPI.searchUser({ [searchField]: searchQuery });
        setUsers(response.data);
      } else {
        const response = await adminAPI.getAllUsers();
        setUsers(response.data);
      }
      setCurrentPage(1); // Reset to first page when data changes
    } catch (err) {
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };
  
  const handleReset = () => {
    setSearchQuery('');
    setSearchField('email');
    fetchUsers();
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

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
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white font-display mb-2">
            User <span className="text-gradient">Management</span>
          </h1>
          <p className="text-white/60 text-lg">
            View and search for users in the system
          </p>
        </motion.div>

        {/* Search Section - Higher z-index */}
        <motion.div
          className="relative z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="relative z-50">
            <h3 className="text-xl font-bold text-white font-display mb-6">Search Users</h3>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 relative z-50">
                  <AnimatedSelect
                    label="Search Field"
                    options={searchFieldOptions}
                    value={searchField}
                    onChange={(value) => setSearchField(value as any)}
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    forceFloatLabel={true}
                    className="relative z-50"
                  />
                </div>
                
                <div className="lg:col-span-6">
                  <AnimatedInput
                    label={`Enter ${searchFieldOptions.find(opt => opt.value === searchField)?.label || 'search term'}...`}
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search by ${searchField}...`}
                  />
                </div>
                
                <div className="lg:col-span-3">
                  <div className="flex gap-3 h-full">
                    <div className="flex-1">
                      <AnimatedButton
                        type="submit"
                        variant="primary"
                        className="w-full h-[60px]"
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                      >
                        Search
                      </AnimatedButton>
                    </div>
                    
                    <div className="flex-1">
                      <AnimatedButton
                        type="button"
                        variant="secondary"
                        className="w-full h-[60px]"
                        onClick={handleReset}
                        icon={<ArrowPathIcon className="h-5 w-5" />}
                      >
                        Reset
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </GlassCard>
        </motion.div>

        {/* Users List - Lower z-index */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-display flex items-center">
                <UsersIcon className="h-8 w-8 mr-3 text-primary-400" />
                Users ({users.length})
              </h2>
              {users.length > ITEMS_PER_PAGE && (
                <div className="text-white/60 text-sm">
                  Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  {searchQuery
                    ? `No users found matching "${searchQuery}" in ${searchField}`
                    : 'No users found'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <GlassCard hover className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/20 rounded-full -translate-y-12 translate-x-12" />
                        <div className="relative">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 bg-primary-gradient rounded-full flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold truncate">
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-white/60 text-sm font-mono">
                                ID: {user._id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <EnvelopeIcon className="h-4 w-4 text-primary-400" />
                              <span className="text-white/80 text-sm truncate">{user.email}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4 text-primary-400" />
                              <span className="text-white/80 text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
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

export default AdminUsers;