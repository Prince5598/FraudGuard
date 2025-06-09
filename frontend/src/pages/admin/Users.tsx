import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import { Search, RefreshCcw } from 'lucide-react';
import { UserProfile } from '../../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'email' | 'firstName' | 'lastName'>('email');
  
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (searchQuery) {
        const response = await adminAPI.searchUser({ [searchField]: searchQuery });
        setUsers(response.data);
      } else {
        const response = await adminAPI.getAllUsers();
        console.log(response);
        setUsers(response.data);
      }
    } catch (err) {
      setError('Failed to load users');
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
  
  const columns = [
    {
      key: 'id',
      header: 'User ID',
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      key: 'firstName',
      header: 'First Name',
    },
    {
      key: 'lastName',
      header: 'Last Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];
  
  return (
    <MainLayout>
      <PageHeader
        title="User Management"
        subtitle="View and search for users in the system"
      />
      
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <label htmlFor="searchField" className="block text-sm font-medium text-gray-700 mb-1">
              Search By
            </label>
            <select
              id="searchField"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as any)}
            >
              <option value="email">Email</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Search Query
            </label>
            <input
              id="searchQuery"
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder={`Search by ${searchField}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-end gap-2">
            <Button
              type="submit"
              icon={<Search className="h-4 w-4" />}
            >
              Search
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSearchField('email');
                fetchUsers();
              }}
              icon={<RefreshCcw className="h-4 w-4" />}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
      
      <Card>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage={
            searchQuery
              ? `No users found matching "${searchQuery}" in ${searchField}`
              : 'No users found'
          }
        />
      </Card>
    </MainLayout>
  );
};

export default AdminUsers;