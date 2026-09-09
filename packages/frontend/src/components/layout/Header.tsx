import React from 'react';
import { useAuth } from '../../store/auth-context';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user } = useAuth();

  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      ADMIN: 'مدیر',
      MANAGER: 'مدیرعامل',
      ACCOUNTANT: 'حسابدار',
      VIEWER: 'ناظر',
    };
    return roles[role] || role;
  };

  return (
    <header className="flex items-center justify-between h-16 bg-white border-b px-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">حسابداری هوشمند</h2>

      <div className="flex items-center space-x-4 space-x-reverse">
        <button className="p-2 text-gray-600 hover:text-primary transition-colors">
          <BellIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 space-x-reverse">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
          <div className="text-right">
            <span className="text-sm font-medium text-gray-800">
              {user?.firstName || ''} {user?.lastName || ''}
            </span>
            <span className="block text-xs text-gray-500">
              {user?.role ? getRoleLabel(user.role) : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
