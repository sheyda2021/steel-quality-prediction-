import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface Line {
  accountId: string;
  description: string;
  debit: string;
  credit: string;
}

interface JournalEntryFormProps {
  onClose: () => void;
  onSave: () => void;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onClose, onSave }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { accountId: '', description: '', debit: '', credit: '' },
    { accountId: '', description: '', debit: '', credit: '' },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/accounts').then(res => setAccounts(res.data.data));
  }, []);

  const handleLineChange = (index: number, field: string, value: string): void => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  const addLine = (): void => {
    setLines([...lines, { accountId: '', description: '', debit: '', credit: '' }]);
  };

  const removeLine = (index: number): void => {
    if (lines.length > 2) {
      const newLines = [...lines];
      newLines.splice(index, 1);
      setLines(newLines);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/journals', {
        date: new Date(date),
        description,
        type: 'JOURNAL_ENTRY',
        lines: lines.map(line => ({
          accountId: line.accountId,
          description: line.description,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
        })),
      });
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ثبت سند');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">سند حسابداری جدید</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="توضیح سند..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">خطوط سند</h3>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <PlusIcon className="w-4 h-4 ml-1" />
                <span>اضافه کردن</span>
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-right">حساب</th>
                  <th className="px-3 py-2 text-right">بدهی</th>
                  <th className="px-3 py-2 text-right">بستانی</th>
                  <th className="px-3 py-2 text-right">توضیحات</th>
                  <th className="px-3 py-2 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-3 py-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary"
                        required
                      >
                        <option value="">انتخاب حساب</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.debit}
                        onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary text-ltr"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.credit}
                        onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary text-ltr"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'در حال ذخیره...' : 'ثبت سند'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalEntryForm;
