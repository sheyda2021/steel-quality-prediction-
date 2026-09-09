import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth-context';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UsersIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { name: 'داشبورد', path: '/dashboard', icon: HomeIcon },
    { name: 'نمودار حساب‌ها', path: '/accounts', icon: BookOpenIcon },
    { name: 'اسناد حسابداری', path: '/journals', icon: ClipboardDocumentListIcon },
    { name: 'مشتریان', path: '/customers', icon: UserGroupIcon },
    { name: 'تامین‌کنندگان', path: '/suppliers', icon: UsersIcon },
    { name: 'فاکتورها', path: '/invoices', icon: DocumentTextIcon },
    { name: 'صورتحساب‌ها', path: '/bills', icon: ReceiptRefundIcon },
    { name: 'حساب‌های بانکی', path: '/bank', icon: CurrencyDollarIcon },
    { name: 'گزارشات مالی', path: '/reports', icon: ChartBarIcon },
    { name: 'بینش‌های هوش مصنوعی', path: '/ai-insights', icon: SparklesIcon },
    { name: 'تنظیمات', path: '/settings', icon: CogIcon },
  ];

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg overflow-y-auto">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-primary">Smart Accounting</h1>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-700 hover:bg-primary hover:text-white transition-colors rounded-l-full ${
                isActive ? 'bg-primary text-white font-medium' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 ml-3" />
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 ml-3" />
          <span className="text-sm">خروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
