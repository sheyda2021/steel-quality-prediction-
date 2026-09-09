import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import SupplierForm from '../components/ui/SupplierForm';

interface Supplier {
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

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get(`/suppliers?search=${search}`);
      setSuppliers(res.data.data);
    } catch (error) {
      console.error('Error fetching suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در حذف تامین‌کننده');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">تامین‌کنندگان</h1>
        <button
          onClick={() => { setShowForm(true); setEditingSupplier(null); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>تامین‌کننده جدید</span>
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="جستجو در تامین‌کنندگان..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={() => { setShowForm(false); setEditingSupplier(null); }}
          onSave={() => { setShowForm(false); setEditingSupplier(null); fetchSuppliers(); }}
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
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">هیچ تامین‌کننده یافت نشد</td></tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{supplier.code}</td>
                    <td className="px-4 py-3 text-sm font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{supplier.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{supplier.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={supplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {supplier.balance.toLocaleString('fa-IR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => { setEditingSupplier(supplier); setShowForm(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
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

export default SuppliersPage;
