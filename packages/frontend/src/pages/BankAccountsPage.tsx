import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, TrashIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  iban: string | null;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  isCleared: boolean;
}

const BankAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showReconcile, setShowReconcile] = useState<BankAccount | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '', bankName: '', accountNumber: '', iban: '', currency: 'USD',
  });

  const fetchAccounts = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/bank/accounts');
      setAccounts(res.data.data);
    } catch (error) {
      console.error('Error fetching bank accounts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await api.post('/bank/accounts', newAccount);
      setShowAddAccount(false);
      setNewAccount({ name: '', bankName: '', accountNumber: '', iban: '', currency: 'USD' });
      fetchAccounts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  const handleReconcile = async (account: BankAccount): Promise<void> => {
    setShowReconcile(account);
    try {
      const res = await api.get('/bank/transactions');
      setTransactions(res.data.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">حساب‌های بانکی</h1>
        <button
          onClick={() => setShowAddAccount(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>حساب بانکی جدید</span>
        </button>
      </div>

      {showAddAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">افزودن حساب بانکی</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام حساب</label>
                <input type="text" name="name" value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام بانک</label>
                <input type="text" name="bankName" value={newAccount.bankName}
                  onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره حساب</label>
                <input type="text" name="accountNumber" value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره شبا</label>
                <input type="text" name="iban" value={newAccount.iban}
                  onChange={(e) => setNewAccount({...newAccount, iban: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ارز</label>
                <select value={newAccount.currency}
                  onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="USD">دلار</option>
                  <option value="EUR">یورو</option>
                  <option value="TRY">لیر</option>
                  <option value="IRR">ریال</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  انصراف
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                  افزودن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-8">بارگذاری...</div>
        ) : accounts.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">هیچ حساب بانکی یافت نشد</div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-8 h-8 text-primary ml-3" />
                  <div>
                    <h3 className="font-bold text-lg">{account.name}</h3>
                    <p className="text-sm text-gray-600">{account.bankName}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleReconcile(account)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="همسازی"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">شماره حساب:</span> {account.accountNumber}</div>
                <div><span className="text-gray-500">شبا:</span> {account.iban || '-'}</div>
                <div className="pt-2 border-t">
                  <span className="text-gray-500">موجودی:</span>
                  <span className={`font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {' '}{Number(account.balance).toLocaleString('fa-IR')} {account.currency}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BankAccountsPage;
