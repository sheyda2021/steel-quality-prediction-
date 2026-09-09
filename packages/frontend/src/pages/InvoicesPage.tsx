import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, EyeIcon, TrashIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import InvoiceForm from '../components/ui/InvoiceForm';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: { id: string; name: string };
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

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [paymentModal, setPaymentModal] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchInvoices = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data.data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusLabel = (status: string): string => {
    const statuses: Record<string, string> = {
      DRAFT: 'پیش‌نویس',
      POSTED: 'ثبت شده',
      PAID: 'پرداخت شده',
      CANCELLED: 'لغو شده',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      POSTED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handlePost = async (id: string): Promise<void> => {
    try {
      await api.post(`/invoices/${id}/post`);
      fetchInvoices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (!paymentModal || !paymentAmount) return;
    try {
      await api.post(`/invoices/${paymentModal.id}/payment`, { amount: parseFloat(paymentAmount) });
      setPaymentModal(null);
      setPaymentAmount('');
      fetchInvoices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">فاکتورها</h1>
        <button
          onClick={() => { setShowForm(true); setEditingInvoice(null); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>فاکتور جدید</span>
        </button>
      </div>

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={() => { setShowForm(false); setEditingInvoice(null); }}
          onSave={() => { setShowForm(false); setEditingInvoice(null); fetchInvoices(); }}
        />
      )}

      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">ثبت پرداخت - فاکتور {paymentModal.invoiceNumber}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ پرداخت</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-ltr"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                موجود بدهی: {Number(paymentModal.total - paymentModal.paidAmount).toLocaleString('fa-IR')}
              </p>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <button
                onClick={() => { setPaymentModal(null); setPaymentAmount(''); }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
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
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مشتری</th>
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
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">هیچ فاکتوری یافت نشد</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">{invoice.customer?.name}</td>
                    <td className="px-4 py-3 text-sm">{new Date(invoice.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 text-sm text-ltr">{Number(invoice.total).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-ltr">{Number(invoice.paidAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-ltr font-medium">
                      {Number(invoice.total - invoice.paidAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <>
                            <button
                              onClick={() => handlePost(invoice.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="ثبت"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setPaymentModal(invoice); }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="ثبت پرداخت"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="ویرایش"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'PAID' && (
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
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

export default InvoicesPage;
