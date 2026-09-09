import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Supplier { id: string; name: string; code: string; }

interface Item {
  description: string;
  accountId: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discount: string;
}

interface BillFormProps {
  bill: any | null;
  onClose: () => void;
  onSave: () => void;
}

const BillForm: React.FC<BillFormProps> = ({ bill, onClose, onSave }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [billNumber, setBillNumber] = useState(bill?.billNumber || '');
  const [supplierId, setSupplierId] = useState(bill?.supplier?.id || '');
  const [date, setDate] = useState(bill?.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(bill?.dueDate?.split('T')[0] || '');
  const [description, setDescription] = useState(bill?.description || '');
  const [items, setItems] = useState<Item[]>(
    bill?.items?.length > 0
      ? bill.items.map((i: any) => ({
          description: i.description, accountId: i.accountId,
          quantity: i.quantity?.toString() || '1', unitPrice: i.unitPrice?.toString() || '0',
          taxRate: i.taxRate?.toString() || '0', discount: i.discount?.toString() || '0',
        }))
      : [{ description: '', accountId: '', quantity: '1', unitPrice: '0', taxRate: '0', discount: '0' }]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/suppliers').then(res => setSuppliers(res.data.data));
    api.get('/accounts').then(res => setAccounts(res.data.data));
  }, []);

  const handleItemChange = (index: number, field: string, value: string): void => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = (): void => {
    setItems([...items, { description: '', accountId: '', quantity: '1', unitPrice: '0', taxRate: '0', discount: '0' }]);
  };

  const removeItem = (index: number): void => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bill) {
        await api.put(`/bills/${bill.id}`, {
          billNumber, supplierId, date, dueDate, description,
          items: items.map(item => ({
            description: item.description, accountId: item.accountId,
            quantity: parseFloat(item.quantity), unitPrice: parseFloat(item.unitPrice),
            taxRate: parseFloat(item.taxRate), discount: parseFloat(item.discount),
          })),
        });
      } else {
        await api.post('/bills', {
          billNumber, supplierId, date, dueDate, description,
          items: items.map(item => ({
            description: item.description, accountId: item.accountId,
            quantity: parseFloat(item.quantity), unitPrice: parseFloat(item.unitPrice),
            taxRate: parseFloat(item.taxRate), discount: parseFloat(item.discount),
          })),
        });
      }
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-5xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{bill ? 'ویرایش صورتحساب' : 'صورتحساب جدید'}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">شماره صورتحساب</label>
              <input type="text" value={billNumber} onChange={(e) => setBillNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">تامین‌کننده *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" required>
                <option value="">انتخاب تامین‌کننده</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">تاریخ سررسید</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">آیتم‌ها</h3>
              <button type="button" onClick={addItem}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                <PlusIcon className="w-4 h-4 ml-1" />
                <span>اضافه کردن</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-right">توضیحات</th>
                    <th className="px-3 py-2 text-right">حساب</th>
                    <th className="px-3 py-2 text-right">تعداد</th>
                    <th className="px-3 py-2 text-right">قیمت واحد</th>
                    <th className="px-3 py-2 text-right">مالیات</th>
                    <th className="px-3 py-2 text-right">تخفیف</th>
                    <th className="px-3 py-2 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">
                        <input type="text" value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={item.accountId}
                          onChange={(e) => handleItemChange(index, 'accountId', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary">
                          <option value="">انتخاب حساب</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input type="number" step="0.01" value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-ltr" />
                      </td>
                      <td className="px-3 py-2"><input type="number" step="0.01" value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-ltr" />
                      </td>
                      <td className="px-3 py-2"><input type="number" step="0.01" value={item.taxRate}
                        onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-ltr" placeholder="%" />
                      </td>
                      <td className="px-3 py-2"><input type="number" step="0.01" value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-ltr" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              انصراف
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillForm;
