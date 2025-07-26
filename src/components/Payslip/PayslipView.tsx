import React from 'react';
import { FileText, Download, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Employee, PayrollRecord } from '../../types';
import { formatCurrency } from '../../utils/payrollCalculations';
import { generatePayslipPDF } from '../../utils/pdfGenerator';

interface PayslipViewProps {
  employee: Employee;
  payrollRecord?: PayrollRecord;
  payrollRecords?: PayrollRecord[];
}

const PayslipView: React.FC<PayslipViewProps> = ({ 
  employee, 
  payrollRecord, 
  payrollRecords = [] 
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  // 従業員の給与記録を取得
  const employeeRecords = payrollRecords.filter(record => record.employeeId === employee.id);
  
  // 利用可能な年月のリストを作成
  const availablePeriods = employeeRecords.map(record => ({
    year: record.year,
    month: parseInt(record.month),
    record
  })).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  // 現在選択されている期間の給与記録を取得
  const currentRecord = employeeRecords.find(
    record => record.year === selectedYear && parseInt(record.month) === selectedMonth
  );

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // モックの給与データ（実際のアプリでは適切なデータを使用）
  const displayPayroll = currentRecord || payrollRecord || {
    id: '1',
    employeeId: employee.id,
    month: `${selectedMonth}`,
    year: selectedYear,
    baseSalary: employee.baseSalary,
    overtime: 15000,
    bonus: 0,
    grossPay: employee.baseSalary + 15000,
    incomeTax: Math.floor((employee.baseSalary + 15000) * 0.08),
    employeeInsurance: Math.floor((employee.baseSalary + 15000) * 0.006),
    healthInsurance: Math.floor((employee.baseSalary + 15000) * 0.0495),
    pensionInsurance: Math.floor((employee.baseSalary + 15000) * 0.0915),
    totalDeductions: 0,
    netPay: 0,
    createdAt: new Date().toISOString()
  };

  displayPayroll.totalDeductions = displayPayroll.incomeTax + displayPayroll.employeeInsurance + displayPayroll.healthInsurance + displayPayroll.pensionInsurance;
  displayPayroll.netPay = displayPayroll.grossPay - displayPayroll.totalDeductions;

  const handleDownload = async () => {
    try {
      await generatePayslipPDF(employee, displayPayroll);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成中にエラーが発生しました');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = availablePeriods.findIndex(
      p => p.year === selectedYear && p.month === selectedMonth
    );
    
    if (direction === 'prev' && currentIndex < availablePeriods.length - 1) {
      const nextPeriod = availablePeriods[currentIndex + 1];
      setSelectedYear(nextPeriod.year);
      setSelectedMonth(nextPeriod.month);
    } else if (direction === 'next' && currentIndex > 0) {
      const prevPeriod = availablePeriods[currentIndex - 1];
      setSelectedYear(prevPeriod.year);
      setSelectedMonth(prevPeriod.month);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">給与明細書</h2>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                disabled={availablePeriods.findIndex(p => p.year === selectedYear && p.month === selectedMonth) >= availablePeriods.length - 1}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-lg font-medium text-gray-700">
                {displayPayroll.year}年{displayPayroll.month}月分
              </span>
              <button
                onClick={() => navigateMonth('next')}
                disabled={availablePeriods.findIndex(p => p.year === selectedYear && p.month === selectedMonth) <= 0}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            {availablePeriods.length > 0 && (
              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedYear(parseInt(year));
                  setSelectedMonth(parseInt(month));
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {availablePeriods.map(period => (
                  <option key={`${period.year}-${period.month}`} value={`${period.year}-${period.month}`}>
                    {period.year}年{period.month}月
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          PDF版ダウンロード
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* ヘッダー情報 */}
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">従業員ID: {employee.id} | {employee.department} | {employee.position}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 支給項目 */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                支給項目
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">基本給</span>
                  <span className="font-medium">{formatCurrency(displayPayroll.baseSalary)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">時間外手当</span>
                  <span className="font-medium">{formatCurrency(displayPayroll.overtime)}</span>
                </div>
                {displayPayroll.bonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">賞与</span>
                    <span className="font-medium">{formatCurrency(displayPayroll.bonus)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">支給合計</span>
                  <span className="text-lg">{formatCurrency(displayPayroll.grossPay)}</span>
                </div>
              </div>
            </div>

            {/* 控除項目 */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                控除項目
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">所得税</span>
                  <span className="font-medium text-red-600">-{formatCurrency(displayPayroll.incomeTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">雇用保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(displayPayroll.employeeInsurance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">健康保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(displayPayroll.healthInsurance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">厚生年金保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(displayPayroll.pensionInsurance)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">控除合計</span>
                  <span className="text-lg text-red-600">-{formatCurrency(displayPayroll.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 差引支給額 */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">差引支給額</span>
                <span className="text-3xl font-bold text-blue-700">{formatCurrency(displayPayroll.netPay)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                支給額 {formatCurrency(displayPayroll.grossPay)} - 控除額 {formatCurrency(displayPayroll.totalDeductions)}
              </p>
            </div>
          </div>

          {/* 備考・詳細情報 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-3">詳細情報</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">扶養人数:</span> {employee.dependents}人
              </div>
              <div>
                <span className="font-medium">居住地:</span> {employee.municipality}
              </div>
              <div>
                <span className="font-medium">作成日:</span> {new Date(mockPayroll.createdAt).toLocaleDateString('ja-JP')}
                <span className="font-medium">作成日:</span> {new Date(displayPayroll.createdAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">重要なお知らせ</p>
                <p>この給与明細書は大切に保管してください。年末調整や確定申告の際に必要となる場合があります。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipView;