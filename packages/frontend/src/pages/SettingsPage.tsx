import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'users' | 'security'>('company');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await api.get(`/auth/profile/${storedUser.id}`);
        setCompany(res.data.data);
      } catch (error) {
        console.error('Error fetching settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'company', name: 'شرکت', icon: '🏢' },
    { id: 'users', name: 'کاربران', icon: '👥' },
    { id: 'security', name: 'امنیت', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <UserCircleIcon className="w-6 h-6 text-primary ml-3" />
        <h1 className="text-2xl font-bold text-gray-800">تنظیمات</h1>
      </div>

      <div className="flex space-x-4 space-x-reverse border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600'
            }`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {activeTab === 'company' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات شرکت</h2>
            {loading ? (
              <div>بارگذاری...</div>
            ) : company ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام شرکت</label>
                  <input type="text" defaultValue={company.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                  <input type="email" defaultValue={company.email} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تلفیکن</label>
                  <input type="text" defaultValue={company.phone} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آدرس</label>
                  <input type="text" defaultValue={company.address} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">کد مالیاتی</label>
                  <input type="text" defaultValue={company.taxId} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ارز پیش‌فرض</label>
                  <input type="text" defaultValue={company.currency} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">کاربران شرکت</h2>
            <p className="text-sm text-gray-500 mb-4">مدیریت کاربران و نقش‌های دسترسی</p>
            <div className="text-center py-8 text-gray-500">
              این بخش در نسخه کامل قابلیت مدیریت کاربران را دارد
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">تنظیمات امنیتی</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">تغییر رمز عبور</h3>
                <p className="text-sm text-gray-500 mb-3">رمز عبور خود را هر ۳ ماه یکبار تغییر دهید</p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                  تغییر رمز عبور
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">احراز هویت ۲ عاملی</h3>
                <p className="text-sm text-gray-500 mb-3">نشان‌های امنیتی اضافه کنید</p>
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">
                  فعال‌سازی
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
