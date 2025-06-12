import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Shield, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      if (state.isAdmin) {
        await authAPI.adminLogout();
      } else {
        await authAPI.userLogout();
      }
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Logout anyway even if API fails
      logout();
      navigate('/login');
    }
  };
  
  if (!state.isAuthenticated) return null;
  
  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={state.isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold">FraudGuard</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            

            {state.isAdmin ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/admin/users" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Users
                </Link>
                <Link to="/admin/transactions" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Transactions
                </Link>
                <Link to="/admin/statistics" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Statistics
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Dashboard
                </Link>
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Profile
                </Link>
                <Link to="/transactions" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Transactions
                </Link>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t border-blue-800">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {state.isAdmin ? (
            <>
              <Link to="/admin/users\" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors">
                Users
              </Link>
              <Link to="/admin/transactions" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors">
                Transactions
              </Link>
              <Link to="/admin/statistics" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors">
                Statistics
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors">
                Profile
              </Link>
              <Link to="/transactions" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors">
                Transactions
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;