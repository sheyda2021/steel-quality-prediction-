import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, CheckIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import BillForm from '../components/ui/BillForm';

interface Bill {
  id: string;
  billNumber: string;
  supplier: { id: string; name: string };
  date: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paidAmount: number;
  currency: string;
  description: string | null;
  createdAt: string;
  items: any[];
}

const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [paymentModal, setPaymentModal] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchBills = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/bills');
      setBills(res.data.data);
    } catch (error) {
      console.error('Error fetching bills', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      DRAFT: 'پیش‌نویس', POSTED: 'ثبت شده', PAID: 'پرداخت شده', CANCELLED: 'لغو شده',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800', POSTED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const handlePost = async (id: string): Promise<void> => {
    try {
      await api.post(`/bills/${id}/post`);
      fetchBills();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (!paymentModal || !paymentAmount) return;
    try {
      await api.post(`/bills/${paymentModal.id}/payment`, { amount: parseFloat(paymentAmount) });
      setPaymentModal(null);
      setPaymentAmount('');
      fetchBills();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/bills/${id}`);
      fetchBills();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">صورتحساب‌ها (هزینه‌ها)</h1>
        <button
          onClick={() => { setShowForm(true); setEditingBill(null); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>صورتحساب جدید</span>
        </button>
      </div>

      {showForm && (
        <BillForm
          bill={editingBill}
          onClose={() => { setShowForm(false); setEditingBill(null); }}
          onSave={() => { setShowForm(false); setEditingBill(null); fetchBills(); }}
        />
      )}

      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">ثبت پرداخت - صورتحساب {paymentModal.billNumber}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ پرداخت</label>
              <input
                type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-ltr"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                موجود بدهی: {Number(paymentModal.total - paymentModal.paidAmount).toLocaleString('fa-IR')}
              </p>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <button onClick={() => { setPaymentModal(null); setPaymentAmount(''); }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                انصراف
              </button>
              <button onClick={handlePayment}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                ثبت پرداخت
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">شماره</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تامین‌کننده</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تاریخ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مجموع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">پرداخت شده</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">باقی‌مانده</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">وضعیت</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8">بارگذاری...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">هیچ صورتحسابی یافت نشد</td></tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{bill.billNumber}</td>
                    <td className="px-4 py-3 text-sm">{bill.supplier?.name}</td>
                    <td className="px-4 py-3 text-sm">{new Date(bill.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 text-sm text-ltr">{Number(bill.total).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-ltr">{Number(bill.paidAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-ltr font-medium">
                      {Number(bill.total - bill.paidAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                        {getStatusLabel(bill.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                          <>
                            <button onClick={() => handlePost(bill.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="ثبت">
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setPaymentModal(bill); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="ثبت پرداخت">
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(bill.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="حذف">
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

export default BillsPage;
