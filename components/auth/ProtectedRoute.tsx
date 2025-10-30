'use client';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasPermission, UserRole } from '../../lib/roles';
import { isAuthenticated as checkSuperAdminAuth, getCurrentUser } from '../../lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback
}) => {
  const { isAuthenticated: oldAuthAuthenticated, isLoading, error, user: oldUser } = useAuth();
  const router = useRouter();

  // Check both auth systems
  const superAdminAuth = checkSuperAdminAuth();
  const superAdminUser = getCurrentUser();
  const isAuthenticated = superAdminAuth || oldAuthAuthenticated;
  const user = superAdminUser || oldUser;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to SuperAdmin login instead
      router.push('/superadmin-login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const role = user.role as UserRole;
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      if (!hasPermission(path, role)) {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !superAdminAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error: {error}</p>
          <button
            onClick={() => router.push('/superadmin-login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // This should not be reached due to the useEffect redirect
  return null;
}; 