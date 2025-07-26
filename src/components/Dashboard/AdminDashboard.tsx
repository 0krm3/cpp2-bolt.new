import React from 'react';
import { Users, Calculator, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Employee } from '../../types';
import { formatCurrency } from '../../utils/payrollCalculations';

interface AdminDashboardProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onCalculatePayroll: () => void;
  onBulkUpload: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  employees, 
  onAddEmployee, 
  onCalculatePayroll, 
  onBulkUpload 
}) => {
  const activeEmployees = employees.filter(emp => emp.isActive);
  const totalSalary = activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0);
  const averageSalary = activeEmployees.length > 0 ? totalSalary / activeEmployees.length : 0;

  const stats = [
    {
      name: '在籍従業員数',
      value: activeEmployees.length.toString(),
      icon: Users,
      color: 'blue',
      description: `全従業員${employees.length}名中`
    },
    {
      name: '月間給与総額',
      value: formatCurrency(totalSalary),
      icon: Calculator,
      color: 'green',
      description: '基本給の合計額'
    },
    {
      name: '平均基本給',
      value: formatCurrency(averageSalary),
      icon: TrendingUp,
      color: 'purple',
      description: '在籍従業員の平均'
    },
    {
      name: '今月の給与計算',
      value: '未実行',
      icon: FileText,
      color: 'orange',
      description: `${new Date().getMonth() + 1}月分`
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'employee_added',
      message: '新しい従業員が登録されました',
      employee: '田中太郎',
      time: '2時間前',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 2,
      type: 'payroll_pending',
      message: '今月の給与計算が未実行です',
      time: '1日前',
      icon: AlertCircle,
      color: 'orange'
    },
    {
      id: 3,
      type: 'csv_upload',
      message: 'CSVファイルから2名の従業員情報が更新されました',
      time: '3日前',
      icon: Users,
      color: 'blue'
    }
  ];

  const departmentSummary = activeEmployees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h2>
        <p className="text-gray-600">給与計算システムの概要と最新の活動状況</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className={`p-2 rounded-md bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近の活動</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start">
                    <div className={`p-1 rounded-full bg-${activity.color}-100 mr-3 mt-0.5`}>
                      <Icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      {activity.employee && (
                        <p className="text-sm font-medium text-gray-700">{activity.employee}</p>
                      )}
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">部署別従業員数</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(departmentSummary).map(([department, count]) => (
                <div key={department} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{department}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / activeEmployees.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}名</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">クイックアクション</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={onAddEmployee}
              className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">新規従業員登録</p>
                <p className="text-xs text-gray-500">個別で従業員を追加</p>
              </div>
            </button>
            
            <button 
              onClick={onCalculatePayroll}
              className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="text-center">
                <Calculator className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">給与計算実行</p>
                <p className="text-xs text-gray-500">今月分の給与を計算</p>
              </div>
            </button>
            
            <button 
              onClick={onBulkUpload}
              className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">CSV一括登録</p>
                <p className="text-xs text-gray-500">複数の従業員を一括追加</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;