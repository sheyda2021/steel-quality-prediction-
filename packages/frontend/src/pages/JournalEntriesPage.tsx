import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, EyeIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import JournalEntryForm from '../components/ui/JournalEntryForm';

interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string | null;
  debit: number;
  credit: number;
  currency: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  type: string;
  totalDebit: number;
  totalCredit: number;
  currency: string;
  isPosted: boolean;
  createdAt: string;
  lines: JournalEntryLine[];
}

const JournalEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  const fetchEntries = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/journals?isPosted=false');
      setEntries(res.data.data.entries);
    } catch (error) {
      console.error('Error fetching journal entries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handlePost = async (id: string): Promise<void> => {
    if (!confirm('آیا از ثبت این سند مطمئن هستید؟')) return;
    try {
      await api.post(`/journals/${id}/post`);
      fetchEntries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ثبت سند');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/journals/${id}`);
      fetchEntries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در حذف سند');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">اسناد حسابداری</h1>
        <button
          onClick={() => { setShowForm(true); setViewingEntry(null); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>سند جدید</span>
        </button>
      </div>

      {showForm && (
        <JournalEntryForm
          onClose={() => { setShowForm(false); }}
          onSave={() => { setShowForm(false); fetchEntries(); }}
        />
      )}

      {viewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">جزئیات سند {viewingEntry.entryNumber}</h2>
              <button
                onClick={() => setViewingEntry(null)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-medium">تاریخ:</span> {new Date(viewingEntry.date).toLocaleDateString('fa-IR')}</div>
                <div><span className="font-medium">نوع:</span> {viewingEntry.type}</div>
                <div><span className="font-medium">وضعیت:</span> {viewingEntry.isPosted ? 'ثبت شده' : 'پیش‌نویس'}</div>
              </div>
              <div><span className="font-medium">توضیحات:</span> {viewingEntry.description}</div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-right">حساب</th>
                    <th className="px-3 py-2 text-right">کد حساب</th>
                    <th className="px-3 py-2 text-right">بدهی</th>
                    <th className="px-3 py-2 text-right">بستانی</th>
                    <th className="px-3 py-2 text-right">توضیحات</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingEntry.lines.map((line) => (
                    <tr key={line.id} className="border-b">
                      <td className="px-3 py-2">{line.accountName}</td>
                      <td className="px-3 py-2 font-mono">{line.accountCode}</td>
                      <td className="px-3 py-2 text-ltr text-right">
                        {line.debit ? Number(line.debit).toLocaleString() : ''}
                      </td>
                      <td className="px-3 py-2 text-ltr text-right">
                        {line.credit ? Number(line.credit).toLocaleString() : ''}
                      </td>
                      <td className="px-3 py-2">{line.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 font-medium">کل</td>
                    <td className="px-3 py-2 text-ltr text-right font-bold">
                      {Number(viewingEntry.totalDebit).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-ltr text-right font-bold">
                      {Number(viewingEntry.totalCredit).toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">شماره سند</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تاریخ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">توضیحات</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">بدهی کل</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">بستانی کل</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">بارگذاری...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">هیچ سندی یافت نشد</td></tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{entry.entryNumber}</td>
                    <td className="px-4 py-3 text-sm">{new Date(entry.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 text-sm">{entry.description}</td>
                    <td className="px-4 py-3 text-sm">{entry.type}</td>
                    <td className="px-4 py-3 text-sm text-ltr">{Number(entry.totalDebit).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-ltr">{Number(entry.totalCredit).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => setViewingEntry(entry)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {!entry.isPosted && (
                          <button
                            onClick={() => handlePost(entry.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        {!entry.isPosted && (
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
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

export default JournalEntriesPage;
