import { Employee, PayrollRecord } from '../types';
import { formatCurrency } from './payrollCalculations';

// PDF生成のためのユーティリティ関数
export const generatePayslipPDF = async (employee: Employee, payrollRecord: PayrollRecord): Promise<void> => {
  // jsPDFライブラリを動的にインポート（実際の実装では事前にインストールが必要）
  try {
    // 簡易的なPDF生成の実装
    // 実際のプロダクションでは jsPDF や PDFKit などのライブラリを使用
    const pdfContent = generatePDFContent(employee, payrollRecord);
    
    // ブラウザでPDFダウンロードをシミュレート
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `給与明細_${employee.name}_${payrollRecord.year}年${payrollRecord.month}月.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('PDF生成エラー:', error);
    // フォールバック: HTMLをPDF風に印刷
    printPayslip(employee, payrollRecord);
  }
};

// PDF内容生成（簡易版）
const generatePDFContent = (employee: Employee, payrollRecord: PayrollRecord): string => {
  // 実際のPDF生成では、適切なPDFライブラリを使用してバイナリデータを生成
  // ここでは簡易的にテキストベースの内容を返す
  return `
給与明細書
${payrollRecord.year}年${payrollRecord.month}月分

従業員情報:
氏名: ${employee.name}
従業員ID: ${employee.id}
部署: ${employee.department}
役職: ${employee.position}

支給項目:
基本給: ${formatCurrency(payrollRecord.baseSalary)}
時間外手当: ${formatCurrency(payrollRecord.overtime)}
賞与: ${formatCurrency(payrollRecord.bonus)}
支給合計: ${formatCurrency(payrollRecord.grossPay)}

控除項目:
所得税: ${formatCurrency(payrollRecord.incomeTax)}
雇用保険料: ${formatCurrency(payrollRecord.employeeInsurance)}
健康保険料: ${formatCurrency(payrollRecord.healthInsurance)}
厚生年金保険料: ${formatCurrency(payrollRecord.pensionInsurance)}
控除合計: ${formatCurrency(payrollRecord.totalDeductions)}

差引支給額: ${formatCurrency(payrollRecord.netPay)}

作成日: ${new Date(payrollRecord.createdAt).toLocaleDateString('ja-JP')}
  `;
};

// フォールバック: 印刷機能を使用したPDF生成
const printPayslip = (employee: Employee, payrollRecord: PayrollRecord): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('ポップアップがブロックされています。ブラウザの設定を確認してください。');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>給与明細書 - ${employee.name}</title>
      <style>
        body { 
          font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; 
          margin: 20px; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 10px; 
          margin-bottom: 20px; 
        }
        .employee-info { 
          background-color: #f5f5f5; 
          padding: 15px; 
          margin-bottom: 20px; 
          border-radius: 5px; 
        }
        .payroll-section { 
          margin-bottom: 20px; 
        }
        .payroll-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 15px; 
        }
        .payroll-table th, .payroll-table td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .payroll-table th { 
          background-color: #f2f2f2; 
        }
        .amount { 
          text-align: right; 
          font-weight: bold; 
        }
        .total-row { 
          background-color: #e8f4f8; 
          font-weight: bold; 
        }
        .net-pay { 
          background-color: #d4edda; 
          font-size: 1.2em; 
          font-weight: bold; 
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>給与明細書</h1>
        <h2>${payrollRecord.year}年${payrollRecord.month}月分</h2>
      </div>
      
      <div class="employee-info">
        <h3>従業員情報</h3>
        <p><strong>氏名:</strong> ${employee.name}</p>
        <p><strong>従業員ID:</strong> ${employee.id}</p>
        <p><strong>部署:</strong> ${employee.department}</p>
        <p><strong>役職:</strong> ${employee.position}</p>
        <p><strong>扶養人数:</strong> ${employee.dependents}人</p>
      </div>
      
      <div class="payroll-section">
        <h3>支給項目</h3>
        <table class="payroll-table">
          <tr><td>基本給</td><td class="amount">${formatCurrency(payrollRecord.baseSalary)}</td></tr>
          <tr><td>時間外手当</td><td class="amount">${formatCurrency(payrollRecord.overtime)}</td></tr>
          ${payrollRecord.bonus > 0 ? `<tr><td>賞与</td><td class="amount">${formatCurrency(payrollRecord.bonus)}</td></tr>` : ''}
          <tr class="total-row"><td>支給合計</td><td class="amount">${formatCurrency(payrollRecord.grossPay)}</td></tr>
        </table>
      </div>
      
      <div class="payroll-section">
        <h3>控除項目</h3>
        <table class="payroll-table">
          <tr><td>所得税</td><td class="amount">${formatCurrency(payrollRecord.incomeTax)}</td></tr>
          <tr><td>雇用保険料</td><td class="amount">${formatCurrency(payrollRecord.employeeInsurance)}</td></tr>
          <tr><td>健康保険料</td><td class="amount">${formatCurrency(payrollRecord.healthInsurance)}</td></tr>
          <tr><td>厚生年金保険料</td><td class="amount">${formatCurrency(payrollRecord.pensionInsurance)}</td></tr>
          <tr class="total-row"><td>控除合計</td><td class="amount">${formatCurrency(payrollRecord.totalDeductions)}</td></tr>
        </table>
      </div>
      
      <div class="payroll-section">
        <table class="payroll-table">
          <tr class="net-pay"><td>差引支給額</td><td class="amount">${formatCurrency(payrollRecord.netPay)}</td></tr>
        </table>
      </div>
      
      <div style="margin-top: 30px; text-align: right; font-size: 0.9em; color: #666;">
        作成日: ${new Date(payrollRecord.createdAt).toLocaleDateString('ja-JP')}
      </div>
      
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">印刷</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">閉じる</button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // 印刷ダイアログを自動で開く
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};

// 高度なPDF生成（jsPDFを使用する場合の実装例）
export const generateAdvancedPDF = async (employee: Employee, payrollRecord: PayrollRecord): Promise<void> => {
  try {
    // 動的インポートでjsPDFを読み込み（実際の実装では事前にインストールが必要）
    // npm install jspdf html2canvas
    
    const { jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    // PDFドキュメントを作成
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 日本語フォントの設定（必要に応じて）
    // pdf.addFont('path/to/japanese-font.ttf', 'japanese', 'normal');
    // pdf.setFont('japanese');
    
    // ヘッダー
    pdf.setFontSize(20);
    pdf.text('給与明細書', 105, 30, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(`${payrollRecord.year}年${payrollRecord.month}月分`, 105, 45, { align: 'center' });
    
    // 従業員情報
    pdf.setFontSize(12);
    let yPosition = 70;
    
    pdf.text('従業員情報', 20, yPosition);
    yPosition += 10;
    pdf.text(`氏名: ${employee.name}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`従業員ID: ${employee.id}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`部署: ${employee.department}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`役職: ${employee.position}`, 25, yPosition);
    
    // 支給項目
    yPosition += 20;
    pdf.text('支給項目', 20, yPosition);
    yPosition += 10;
    
    const payItems = [
      ['基本給', formatCurrency(payrollRecord.baseSalary)],
      ['時間外手当', formatCurrency(payrollRecord.overtime)],
      ...(payrollRecord.bonus > 0 ? [['賞与', formatCurrency(payrollRecord.bonus)]] : []),
      ['支給合計', formatCurrency(payrollRecord.grossPay)]
    ];
    
    payItems.forEach(([label, amount]) => {
      pdf.text(label, 25, yPosition);
      pdf.text(amount, 150, yPosition, { align: 'right' });
      yPosition += 7;
    });
    
    // 控除項目
    yPosition += 10;
    pdf.text('控除項目', 20, yPosition);
    yPosition += 10;
    
    const deductionItems = [
      ['所得税', formatCurrency(payrollRecord.incomeTax)],
      ['雇用保険料', formatCurrency(payrollRecord.employeeInsurance)],
      ['健康保険料', formatCurrency(payrollRecord.healthInsurance)],
      ['厚生年金保険料', formatCurrency(payrollRecord.pensionInsurance)],
      ['控除合計', formatCurrency(payrollRecord.totalDeductions)]
    ];
    
    deductionItems.forEach(([label, amount]) => {
      pdf.text(label, 25, yPosition);
      pdf.text(`-${amount}`, 150, yPosition, { align: 'right' });
      yPosition += 7;
    });
    
    // 差引支給額
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text('差引支給額', 25, yPosition);
    pdf.text(formatCurrency(payrollRecord.netPay), 150, yPosition, { align: 'right' });
    
    // 作成日
    yPosition += 20;
    pdf.setFontSize(10);
    pdf.text(`作成日: ${new Date(payrollRecord.createdAt).toLocaleDateString('ja-JP')}`, 150, yPosition, { align: 'right' });
    
    // PDFを保存
    pdf.save(`給与明細_${employee.name}_${payrollRecord.year}年${payrollRecord.month}月.pdf`);
    
  } catch (error) {
    console.error('高度なPDF生成エラー:', error);
    // フォールバックとして簡易版を使用
    await generatePayslipPDF(employee, payrollRecord);
  }
};