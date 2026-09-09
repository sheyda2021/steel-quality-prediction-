import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, MagnifyingIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AccountForm from '../components/ui/AccountForm';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string | null;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
}

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const fetchAccounts = async (searchTerm: string = ''): Promise<void> => {
    setLoading(true);
    try {
      const url = searchTerm ? `/accounts?search=${searchTerm}` : '/accounts';
      const res = await api.get(url);
      setAccounts(res.data.data);
    } catch (error) {
      console.error('Error fetching accounts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearch(value);
    fetchAccounts(value);
  };

  const handleEdit = (account: Account): void => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts(search);
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در حذف حساب');
    }
  };

  const handleSave = (): void => {
    setShowForm(false);
    setEditingAccount(null);
    fetchAccounts(search);
  };

  const getTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      ASSET: 'دارایی',
      LIABILITY: 'بدهی',
      EQUITY: 'حق‌الامتیاز',
      REVENUE: 'درآمد',
      EXPENSE: 'هزینه',
    };
    return types[type] || type;
  };

  const typeColors: Record<string, string> = {
    ASSET: 'bg-blue-100 text-blue-800',
    LIABILITY: 'bg-red-100 text-red-800',
    EQUITY: 'bg-green-100 text-green-800',
    REVENUE: 'bg-purple-100 text-purple-800',
    EXPENSE: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">نمودار حساب‌ها</h1>
        <button
          onClick={() => { setShowForm(true); setEditingAccount(null); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>حساب جدید</span>
        </button>
      </div>

      <div className="relative">
        <MagnifyingIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="جستجو در حساب‌ها..."
          value={search}
          onChange={handleSearch}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {showForm && (
        <AccountForm
          account={editingAccount}
          onClose={() => { setShowForm(false); setEditingAccount(null); }}
          onSave={handleSave}
        />
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">کد</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نام حساب</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">دسته</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">وضعیت</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">بارگذاری...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">هیچ حسابی یافت نشد</td></tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{account.code}</td>
                    <td className="px-4 py-3 text-sm">{account.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${typeColors[account.type]}`}>
                        {getTypeLabel(account.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {account.category || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {account.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
