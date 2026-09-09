import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BalanceSheetData, IncomeStatementData } from '@shared';
import { ChartBarIcon, TableCellsIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

type ReportTab = 'balance-sheet' | 'income-statement' | 'trial-balance';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('balance-sheet');
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData | null>(null);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    asOfDate: new Date().toISOString().split('T')[0],
  });

  const fetchReport = async (): Promise<void> => {
    setLoading(true);
    try {
      if (activeTab === 'balance-sheet') {
        const res = await api.get('/reports/BALANCE_SHEET?asOfDate=' + dateRange.asOfDate);
        setBalanceSheet(res.data.data);
      } else if (activeTab === 'income-statement') {
        const res = await api.get(`/reports/INCOME_STATEMENT?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
        setIncomeStatement(res.data.data);
      } else if (activeTab === 'trial-balance') {
        const res = await api.get('/reports/TRIAL_BALANCE');
        setTrialBalance(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching report', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const exportToCsv = (): void => {
    let csv = '';
    if (activeTab === 'balance-sheet' && balanceSheet) {
      csv = 'دسته,مقدار\n';
      csv += `دارایی‌های جاری,${balanceSheet.assets.current}\n`;
      csv += `دارایی‌های ثابت,${balanceSheet.assets.fixed}\n`;
      csv += `کل دارایی‌ها,${balanceSheet.assets.total}\n`;
      csv += `بدهی‌های جاری,${balanceSheet.liabilities.current}\n`;
      csv += `بدهی‌های طولانی‌مدت,${balanceSheet.liabilities.longTerm}\n`;
      csv += `کل بدهی‌ها,${balanceSheet.liabilities.total}\n`;
      csv += `حق‌الامتیاز,${balanceSheet.equity}\n`;
    } else if (activeTab === 'income-statement' && incomeStatement) {
      csv = 'آیتم,مقدار\n';
      csv += `درآمد,${incomeStatement.revenue}\n`;
      csv += `هزینه تمام‌شده فروش,${incomeStatement.costOfGoodsSold}\n`;
      csv += `سود ناشی از فروش,${incomeStatement.grossProfit}\n`;
      csv += `هزینه‌های عملیاتی,${incomeStatement.operatingExpenses}\n`;
      csv += `سود عملیاتی,${incomeStatement.operatingIncome}\n`;
      csv += `سود خالص,${incomeStatement.netIncome}\n`;
    } else if (activeTab === 'trial-balance' && trialBalance) {
      csv = 'کد حساب,نام حساب,نوع,موجودی\n';
      trialBalance.accounts.forEach((acc: any) => {
        csv += `${acc.accountCode},${acc.accountName},${acc.accountType},${acc.balance}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `گزارش-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">گزارشات مالی</h1>
        <button
          onClick={exportToCsv}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <ArrowDownTrayIcon className="w-5 h-5 ml-2" />
          <span>خروجی CSV</span>
        </button>
      </div>

      <div className="flex space-x-4 space-x-reverse border-b">
        <button
          onClick={() => setActiveTab('balance-sheet')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'balance-sheet'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          تراز نامه
        </button>
        <button
          onClick={() => setActiveTab('income-statement')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'income-statement'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          صورت سود و ضرر
        </button>
        <button
          onClick={() => setActiveTab('trial-balance')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'trial-balance'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          تریال بالانس
        </button>
      </div>

      {activeTab === 'balance-sheet' && (
        <div>
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <input
              type="date"
              value={dateRange.asOfDate}
              onChange={(e) => setDateRange({...dateRange, asOfDate: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              اعمال
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">بارگذاری...</div>
          ) : balanceSheet ? (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-6 text-center">تراز نامه تاریخی</h2>
              <p className="text-center text-sm text-gray-500 mb-6">
                تاریخ: {new Date(balanceSheet.date).toLocaleDateString('fa-IR')}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">دارایی‌ها</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">جاری</span>
                      <span className="font-medium text-ltr">{Number(balanceSheet.assets.current).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">ثابت</span>
                      <span className="font-medium text-ltr">{Number(balanceSheet.assets.fixed).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg border-t">
                      <span>کل</span>
                      <span className="text-ltr">{Number(balanceSheet.assets.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">بدهی‌ها و حق‌الامتیاز</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">جاری</span>
                      <span className="font-medium text-ltr">{Number(balanceSheet.liabilities.current).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">طولانی‌مدت</span>
                      <span className="font-medium text-ltr">{Number(balanceSheet.liabilities.longTerm).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span>کل بدهی‌ها</span>
                      <span className="text-ltr">{Number(balanceSheet.liabilities.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t">
                      <span className="text-gray-600">حق‌الامتیاز</span>
                      <span className="font-medium text-ltr">{Number(balanceSheet.equity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 font-bold text-lg border-t-2">
                      <span>کل بدهی و حق‌الامتیاز</span>
                      <span className="text-ltr">{Number(balanceSheet.totalLiabilitiesAndEquity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'income-statement' && (
        <div>
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <input type="date" value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            <input type="date" value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            <button onClick={fetchReport}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
              اعمال
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">بارگذاری...</div>
          ) : incomeStatement ? (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-6 text-center">صورت سود و ضرر</h2>
              <p className="text-center text-sm text-gray-500 mb-6">
                از {new Date(incomeStatement.startDate).toLocaleDateString('fa-IR')} تا {new Date(incomeStatement.endDate).toLocaleDateString('fa-IR')}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between py-2"><span>درآمد</span><span className="text-ltr font-medium">{Number(incomeStatement.revenue).toLocaleString()}</span></div>
                <div className="flex justify-between py-2 text-gray-600"><span>هزینه تمام‌شده فروش</span><span className="text-ltr">({Number(incomeStatement.costOfGoodsSold).toLocaleString()})</span></div>
                <div className="flex justify-between py-2 font-bold border-t"><span>سود ناشی از فروش</span><span className={`text-ltr ${incomeStatement.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(incomeStatement.grossProfit).toLocaleString()}</span></div>
                <div className="flex justify-between py-2 text-gray-600"><span>هزینه‌های عملیاتی</span><span className="text-ltr">({Number(incomeStatement.operatingExpenses).toLocaleString()})</span></div>
                <div className="flex justify-between py-3 font-bold text-lg border-t"><span>سود خالص</span><span className={`text-ltr ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(incomeStatement.netIncome).toLocaleString()}</span></div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'trial-balance' && (
        <div>
          {loading ? (
            <div className="text-center py-8">بارگذاری...</div>
          ) : trialBalance ? (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">کد حساب</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نام حساب</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع</th>
                    <th className="px-4 py-3 text-ltr text-right text-sm font-medium text-gray-700">موجودی</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.accounts.map((acc: any) => (
                    <tr key={acc.accountId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">{acc.accountCode}</td>
                      <td className="px-4 py-3 text-sm">{acc.accountName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{acc.accountType}</td>
                      <td className="px-4 py-3 text-ltr font-medium">{Number(acc.balance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold">کل</td>
                    <td className="px-4 py-3 text-ltr font-bold">
                      {Number(trialBalance.totalDebit).toLocaleString()} / {Number(trialBalance.totalCredit).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
