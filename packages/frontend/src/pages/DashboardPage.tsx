import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BalanceSheetData } from '@shared';
import {
  WalletIcon,
  BanknotesIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [forecast, setForecast] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [bsRes, fcRes] = await Promise.all([
          api.get('/reports/BALANCE_SHEET'),
          api.get('/ai/forecast?days=7'),
        ]);

        setBalanceSheet(bsRes.data.data);
        setForecast(fcRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">بارگذاری داشبورد...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">داشبورد حسابداری</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">دارایی‌ها</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {balanceSheet?.assets.total.toLocaleString('fa-IR') || '0'}
              </p>
            </div>
            <WalletIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">بدهی‌ها</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {balanceSheet?.liabilities.total.toLocaleString('fa-IR') || '0'}
              </p>
            </div>
            <BanknotesIcon className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">حق‌الامتیاز</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {balanceSheet?.equity.toLocaleString('fa-IR') || '0'}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">پیش‌بینی نقدینگی ۷ روزه</p>
              <p className={`text-2xl font-bold mt-1 ${
                (forecast || []).reduce((sum, f) => sum + f.netCashFlow, 0) >= 0
                  ? 'text-green-600' : 'text-red-600'
              }`}>
                {(forecast || []).reduce((sum, f) => sum + f.netCashFlow, 0).toLocaleString('fa-IR') || '0'}
              </p>
            </div>
            <SparklesIcon className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">پیش‌بینی جریان نقدی (۷ روز آینده)</h2>
          <div className="space-y-3">
            {(forecast || []).slice(0, 7).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{new Date(item.date).toLocaleDateString('fa-IR')}</span>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="flex items-center text-green-600">
                    <ArrowTrendingUpIcon className="w-4 h-4 ml-1" />
                    {item.predictedInflow.toLocaleString('fa-IR')}
                  </span>
                  <span className="flex items-center text-red-600">
                    <ArrowTrendingDownIcon className="w-4 h-4 ml-1" />
                    {item.predictedOutflow.toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">دستورالعمل‌های AI</h2>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center">
                <SparklesIcon className="w-5 h-5 text-purple-600 ml-2" />
                <span className="font-medium text-purple-800">هوش مصنوعی فعال است</span>
              </div>
              <p className="text-sm text-purple-700 mt-1">
                برای بهترین نتایج، تراکنش‌های خود را بارگذاری کنید.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">
                تراکنش‌های جدید خودکار دسته‌بندی می‌شوند
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
