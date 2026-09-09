import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { SparklesIcon, FunnelIcon, CheckIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AiSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  confidence: number;
  isApplied: boolean;
  createdAt: string;
}

interface ForecastPoint {
  date: string;
  predictedInflow: number;
  predictedOutflow: number;
  netCashFlow: number;
  confidenceLower: number;
  confidenceUpper: number;
}

const AIInsightsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'forecast' | 'anomalies'>('suggestions');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [suggestionsRes, forecastRes, anomaliesRes] = await Promise.all([
        api.get('/ai/suggestions'),
        api.get('/ai/forecast?days=14'),
        api.get('/ai/anomalies'),
      ]);
      setSuggestions(suggestionsRes.data.data || []);
      setForecast(forecastRes.data.data || []);
      setAnomalies(anomaliesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching AI insights', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = async (id: string): Promise<void> => {
    try {
      await api.post(`/ai/suggestions/${id}/apply`);
      setSuggestions(suggestions.filter(s => s.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا');
    }
  };

  const getTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
      CATEGORIZATION: 'دسته‌بندی',
      FORECASTING: 'پیش‌بینی',
      ANOMALY: 'ناهنجاری',
      RECONCILIATION: 'همسازی',
      TAX_OPTIMIZATION: 'بهینه‌سازی مالیات',
    };
    return map[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const map: Record<string, string> = {
      CATEGORIZATION: 'bg-blue-100 text-blue-800',
      FORECASTING: 'bg-purple-100 text-purple-800',
      ANOMALY: 'bg-red-100 text-red-800',
      RECONCILIATION: 'bg-green-100 text-green-800',
      TAX_OPTIMIZATION: 'bg-yellow-100 text-yellow-800',
    };
    return map[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SparklesIcon className="w-6 h-6 text-primary ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">بینش‌های هوش مصنوعی</h1>
        </div>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          به‌روزرسانی
        </button>
      </div>

      <div className="flex space-x-4 space-x-reverse border-b">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'suggestions' ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
        >
          پیشنهادات
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'forecast' ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
        >
          پیش‌بینی نقدینگی
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'anomalies' ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
        >
          ناهنجاری‌ها
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">بارگذاری...</div>
      ) : (
        <>
          {activeTab === 'suggestions' && (
            <div className="bg-white rounded-xl shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">عنوان</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">توضیحات</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">اعتماد</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-500">هیچ پیشنهادی یافت نشد</td></tr>
                    ) : (
                      suggestions.map((suggestion) => (
                        <tr key={suggestion.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(suggestion.type)}`}>
                              {getTypeLabel(suggestion.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{suggestion.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{suggestion.description}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Number(suggestion.confidence)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 mr-2">{Number(suggestion.confidence).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {suggestion.isApplied ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">اعمال شده</span>
                            ) : (
                              <div className="flex justify-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => handleApplySuggestion(suggestion.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="اعمال"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">پیش‌بینی جریان نقدی - ۱۴ روز آینده</h2>
              <div className="space-y-3">
                {forecast.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">داده کافی برای پیش‌بینی نیست</p>
                ) : (
                  forecast.map((point) => (
                    <div key={point.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{new Date(point.date).toLocaleDateString('fa-IR')}</span>
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <span className="text-green-600 text-sm">ورودی: {point.predictedInflow.toLocaleString('fa-IR')}</span>
                        <span className="text-red-600 text-sm">خروجی: {point.predictedOutflow.toLocaleString('fa-IR')}</span>
                        <span className={`font-bold text-sm ${point.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          خالص: {point.netCashFlow.toLocaleString('fa-IR')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">تراکنش‌های غیرعادی شناسایی شده</h2>
              <div className="space-y-3">
                {anomalies.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">هیچ ناهنجاری شناسایی نشد</p>
                ) : (
                  anomalies.map((anomaly, index) => (
                    <div key={index} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-start">
                        <InformationCircleIcon className="w-5 h-5 text-yellow-600 ml-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-yellow-800">{anomaly.reason}</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            شدت: {anomaly.severity === 'high' ? 'بالا' : anomaly.severity === 'medium' ? 'متوسط' : 'پایین'} |
                            اعتماد: {(Number(anomaly.confidence) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIInsightsPage;
