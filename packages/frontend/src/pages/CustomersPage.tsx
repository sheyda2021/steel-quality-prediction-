import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CustomerForm from '../components/ui/CustomerForm';

interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
  category: string | null;
  creditLimit: number;
  balance: number;
  isActive: boolean;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.data);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در حذف مشتری');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">مشتریان</h1>
        <button
          onClick={() => { setShowForm(true); setEditingCustomer(null); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>مشتری جدید</span>
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="جستجو در مشتریان..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => { setShowForm(false); setEditingCustomer(null); }}
          onSave={() => { setShowForm(false); setEditingCustomer(null); fetchCustomers(); }}
        />
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">کد</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نام</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تلفیکن</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ایمیل</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">موجودی</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">بارگذاری...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">هیچ مشتری یافت نشد</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{customer.code}</td>
                    <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{customer.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {customer.balance.toLocaleString('fa-IR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => { setEditingCustomer(customer); setShowForm(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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

export default CustomersPage;
