'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../lib/i18n';
import { getAccessibleRoutes, getRoleHierarchy, UserRole } from '../../lib/roles';
import { getCurrentUser } from '../../lib/permissions';

export const RoleAccessInfo: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const { user: oldAuthUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check both auth systems
  const superAdminUser = getCurrentUser();
  const user = superAdminUser || oldAuthUser;

  if (!isClient || !user) return null;

  const userRole = user.role as UserRole;
  const accessibleRoutes = getAccessibleRoutes(userRole);
  const roleHierarchy = getRoleHierarchy(userRole);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'text-purple-600 bg-purple-100';
      case 'superadmin':
        return 'text-red-600 bg-red-100';
      case 'account':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'pi pi-crown';
      case 'superadmin':
        return 'pi pi-shield';
      case 'account':
        return 'pi pi-user';
      default:
        return 'pi pi-user';
    }
  };

  const getRoleName = (role: UserRole) => {
    return t(`roleAccess.roleNames.${role}`);
  };

  const getRoleDescription = (role: UserRole) => {
    return t(`roleAccess.roleDescriptions.${role}`);
  };

  return (
    <div className="role-access-info">
      <div className="role-access-card">
        <div className="role-access-header">
          <div className="role-info">
            <div className={`role-badge ${getRoleColor(userRole)}`}>
              <i className={getRoleIcon(userRole)}></i>
              <span className="role-name">{getRoleName(userRole)}</span>
            </div>
            <div className="user-info">
              <span className="username">{(user as any).username || (user as any).name || (user as any).email}</span>
              <span className="role-description">
                {getRoleDescription(userRole)}
              </span>
            </div>
          </div>
        </div>

        <div className="access-summary">
          <div className="access-stats">
            <div className="stat-item">
              <span className="stat-label">{t('roleAccess.accessiblePages')}</span>
              <span className="stat-value">{userRole === 'superadmin' ? 'All' : accessibleRoutes.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('roleAccess.roleLevel')}</span>
              <span className="stat-value">{roleHierarchy}/4</span>
            </div>
            {userRole === 'superadmin' && (user as any).organizationName && (
              <div className="stat-item">
                <span className="stat-label">Organization</span>
                <span className="stat-value">{(user as any).organizationName}</span>
              </div>
            )}
          </div>

          <div className="accessible-features">
            <h6 className="features-title">{t('roleAccess.accessibleFeatures')}</h6>
            {userRole === 'superadmin' ? (
              <div className="features-grid">
                <div className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">✅ Full System Access</span>
                </div>
                <div className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">✅ All Pages</span>
                </div>
                <div className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">✅ All Settings</span>
                </div>
                <div className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">✅ User Management</span>
                </div>
                <div className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">✅ Admin Approval</span>
                </div>
                <div className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">✅ No PIN Required</span>
                </div>
              </div>
            ) : (
              <div className="features-grid">
                {accessibleRoutes.slice(0, 6).map((route) => (
                  <div key={route.path} className="feature-item">
                    <i className="pi pi-check-circle text-green-500"></i>
                    <span className="feature-name">{t(route.title)}</span>
                  </div>
                ))}
                {accessibleRoutes.length > 6 && (
                  <div className="feature-item">
                    <i className="pi pi-ellipsis-h text-gray-400"></i>
                    <span className="feature-name">
                      +{accessibleRoutes.length - 6} {t('roleAccess.moreFeatures')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="role-access-footer">
          <p>
            {userRole === 'superadmin'
              ? '🔓 You have unrestricted access to all features and settings as SuperAdmin.'
              : t('roleAccess.accessSummary')}
          </p>
        </div>
      </div>
    </div>
  );
}; 