import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AccountType } from '@shared';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string | null;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
}

interface AccountFormProps {
  account: Account | null;
  onClose: () => void;
  onSave: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: account?.code || '',
    name: account?.name || '',
    type: account?.type || '',
    category: account?.category || '',
    description: account?.description || '',
    isActive: account?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type: inputType } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: inputType === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      if (account) {
        await api.put(`/accounts/${account.id}`, formData);
      } else {
        await api.post('/accounts', formData);
      }
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ذخیره‌سازی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{account ? 'ویرایش حساب' : 'ایجاد حساب جدید'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد حساب</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="اختیاری - خودکار تولید می‌شود"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام حساب *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع حساب *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">انتخاب کنید</option>
                <option value="ASSET">دارایی</option>
                <option value="LIABILITY">بدهی</option>
                <option value="EQUITY">حق‌الامتیاز</option>
                <option value="REVENUE">درآمد</option>
                <option value="EXPENSE">هزینه</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">دسته</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">انتخاب کنید</option>
                <option value="CURRENT_ASSETS">دارایی‌های جاری</option>
                <option value="FIXED_ASSETS">دارایی‌های ثابت</option>
                <option value="CURRENT_LIABILITIES">بدهی‌های جاری</option>
                <option value="LONG_TERM_LIABILITIES">بدهی‌های طولانی‌مدت</option>
                <option value="OPERATING_REVENUE">درآمد عملیاتی</option>
                <option value="OPERATING_EXPENSE">هزینه عملیاتی</option>
                <option value="COST_OF_GOODS_SOLD">هزینه تمام‌شده فروش</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="توضیحات اختیاری..."
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                id="isActive"
                className="ml-2"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">فعال</label>
            </div>
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
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
