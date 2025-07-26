import React, { useState, useEffect } from 'react';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import EmployeeList from './components/Employee/EmployeeList';
import EmployeeForm from './components/Employee/EmployeeForm';
import CSVUploader from './components/Employee/CSVUploader';
import PayslipView from './components/Payslip/PayslipView';
import PayrollCalculation from './components/Payroll/PayrollCalculation';
import PayrollDetails from './components/Payroll/PayrollDetails';
import ReportsView from './components/Reports/ReportsView';
import SettingsView from './components/Settings/SettingsView';
import { User, Employee } from './types';
import { getCurrentUser, setCurrentUser, logout, authenticateUser } from './utils/auth';
import { useEmployees } from './hooks/useEmployees';
import { usePayroll } from './hooks/usePayroll';
import { useSettings } from './hooks/useSettings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const { employees, loading, addEmployee, updateEmployee, deleteEmployee, bulkUpdateEmployees } = useEmployees();
  const { 
    payrollRecords, 
    payrollBatches, 
    loading: payrollLoading, 
    calculateMonthlyPayroll, 
    approveBatch, 
    getRecordsByBatch 
  } = usePayroll();
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setActiveTab(currentUser.role === 'admin' ? 'dashboard' : 'payslip');
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    const authenticatedUser = authenticateUser(email, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setCurrentUser(authenticatedUser);
      setActiveTab(authenticatedUser.role === 'admin' ? 'dashboard' : 'payslip');
      setLoginError('');
    } else {
      setLoginError('メールアドレスまたはパスワードが間違っています');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setActiveTab('dashboard');
    setSelectedEmployee(null);
    setShowEmployeeForm(false);
    setShowCSVUploader(false);
  };

  const handleEmployeeSave = (employee: Employee) => {
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, employee);
    } else {
      addEmployee(employee);
    }
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
  };

  const handleEmployeeEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleEmployeeDelete = (id: string) => {
    deleteEmployee(id);
  };

  const handleEmployeeAdd = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleBulkUpload = () => {
    setShowCSVUploader(true);
  };

  const handleCSVUpload = (newEmployees: Employee[]) => {
    bulkUpdateEmployees(newEmployees);
    setShowCSVUploader(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowEmployeeForm(false);
    setShowCSVUploader(false);
    setSelectedEmployee(null);
    setSelectedBatchId(null);
  };

  const handlePayrollCalculate = (month: string, year: number) => {
    calculateMonthlyPayroll(employees, month, year);
  };

  const handleBatchApprove = (batchId: string) => {
    approveBatch(batchId);
  };

  const handleViewBatchDetails = (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const handleBackFromDetails = () => {
    setSelectedBatchId(null);
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  const renderContent = () => {
    if (loading || payrollLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      );
    }

    if (user.role === 'admin') {
      // 給与計算詳細画面
      if (selectedBatchId) {
        const batch = payrollBatches.find(b => b.id === selectedBatchId);
        const records = getRecordsByBatch(selectedBatchId);
        
        if (batch) {
          return (
            <PayrollDetails
              batch={batch}
              records={records}
              employees={employees}
              onBack={handleBackFromDetails}
            />
          );
        }
      }

      if (showEmployeeForm) {
        return (
          <EmployeeForm
            employee={selectedEmployee || undefined}
            onSave={handleEmployeeSave}
            onCancel={() => {
              setShowEmployeeForm(false);
              setSelectedEmployee(null);
            }}
          />
        );
      }

      if (showCSVUploader) {
        return (
          <CSVUploader
            onUpload={handleCSVUpload}
            onCancel={() => setShowCSVUploader(false)}
            existingEmployees={employees}
          />
        );
      }

      switch (activeTab) {
        case 'dashboard':
          return (
            <AdminDashboard 
              employees={employees}
              onAddEmployee={handleEmployeeAdd}
              onCalculatePayroll={() => {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                handlePayrollCalculate(currentMonth.toString(), currentYear);
              }}
              onBulkUpload={handleBulkUpload}
            />
          );
        case 'employees':
          return (
            <EmployeeList
              employees={employees}
              onEdit={handleEmployeeEdit}
              onDelete={handleEmployeeDelete}
              onAdd={handleEmployeeAdd}
              onBulkUpload={handleBulkUpload}
            />
          );
        case 'payroll':
          return (
            <PayrollCalculation
              employees={employees}
              payrollBatches={payrollBatches}
              onCalculate={handlePayrollCalculate}
              onApprove={handleBatchApprove}
              onViewDetails={handleViewBatchDetails}
            />
          );
        case 'reports':
          return (
            <ReportsView
              payrollRecords={payrollRecords}
              payrollBatches={payrollBatches}
              employees={employees}
            />
          );
        case 'settings':
          return (
            <SettingsView
              settings={settings}
              onSave={updateSettings}
            />
          );
        default:
          return <AdminDashboard employees={employees} />;
      }
    } else {
      // 従業員用画面
      const currentEmployee = employees.find(emp => emp.id === user.employeeId);
      
      switch (activeTab) {
        case 'payslip':
          if (currentEmployee) {
            return (
              <PayslipView 
                employee={currentEmployee} 
                payrollRecords={payrollRecords}
              />
            );
          } else {
            return (
              <div className="text-center py-12">
                <p className="text-gray-600">従業員情報が見つかりません</p>
              </div>
            );
          }
        case 'profile':
          if (currentEmployee) {
            return (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">個人情報</h2>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">氏名</label>
                      <p className="mt-1 text-sm text-gray-900">{currentEmployee.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">従業員ID</label>
                      <p className="mt-1 text-sm text-gray-900">{currentEmployee.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">部署</label>
                      <p className="mt-1 text-sm text-gray-900">{currentEmployee.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">役職</label>
                      <p className="mt-1 text-sm text-gray-900">{currentEmployee.position}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                      <p className="mt-1 text-sm text-gray-900">{currentEmployee.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">入社日</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(currentEmployee.joinDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="text-center py-12">
                <p className="text-gray-600">従業員情報が見つかりません</p>
              </div>
            );
          }
        default:
          if (currentEmployee) {
            return <PayslipView employee={currentEmployee} />;
          } else {
            return (
              <div className="text-center py-12">
                <p className="text-gray-600">従業員情報が見つかりません</p>
              </div>
            );
          }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Navigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          userRole={user.role} 
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;