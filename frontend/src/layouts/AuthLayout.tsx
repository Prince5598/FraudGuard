import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/ui/GlassCard';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              className="mx-auto h-16 w-16 bg-primary-gradient rounded-2xl flex items-center justify-center mb-6"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ShieldCheckIcon className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient font-display mb-2">
              FraudGuard
            </h1>
            <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-white/60 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Form Container */}
          <GlassCard className="p-8">
            {children}
          </GlassCard>

          {/* Additional Info */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-white/40 text-xs">
              Secure financial fraud detection system
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AuthLayout;