import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Dropdown } from 'react-bootstrap';
import { MdDownload, MdArrowUpward, MdArrowDownward, MdMenu } from 'react-icons/md';
import { FaWallet } from 'react-icons/fa';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
);

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('All Months');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/dashboard", { withCredentials: true });
        if (userRes.data.user) {
          const expenseRes = await api.get(`/dashboard/expense/${userRes.data.user._id}`, { withCredentials: true });
          setTransactions(expenseRes.data.allExpense);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Filter Logic ---
  const availableMonths = ['All Months', ...new Set(transactions.map(t => {
    const date = new Date(t.date);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }))].sort((a, b) => {
    if (a === 'All Months') return -1;
    if (b === 'All Months') return 1;
    return new Date(a) - new Date(b);
  });

  const filteredTransactions = selectedMonth === 'All Months' 
    ? transactions 
    : transactions.filter(t => {
        const date = new Date(t.date);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
      });

  // --- Data Processing ---

  // 1. Totals (Based on Filtered Data)
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // 2. Category Data (Based on Filtered Data - Pie Chart)
  const categoryData = {};
  filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
    if (!categoryData[t.category]) categoryData[t.category] = 0;
    categoryData[t.category] += t.amount;
  });

  // 3. Monthly Data (Always based on ALL transactions for Trends)
  const monthlyData = {};
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') monthlyData[monthYear].income += t.amount;
    else monthlyData[monthYear].expense += t.amount;
  });

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));

  // --- Chart Configurations ---

  const barChartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Income',
        data: sortedMonths.map(m => monthlyData[m].income),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: sortedMonths.map(m => monthlyData[m].expense),
        backgroundColor: '#6c5dd3',
        borderRadius: 4,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#6c5dd3', '#3b82f6', '#10b981', '#ff75c3', '#ffa600', '#ef4444', '#64748b'
        ],
        borderWidth: 0,
      },
    ],
  };

  const lineChartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Spending Trend',
        data: sortedMonths.map(m => monthlyData[m].expense),
        borderColor: '#6c5dd3',
        backgroundColor: 'rgba(108, 93, 211, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // --- PDF Download ---
  const downloadPDF = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;

    try {
      // Capture the visual report
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add Image (Visual Report)
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Add Date (Overlay or below image)
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      // pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, imgHeight + 10); // Option A: Below image

      // Add Transaction Table (New Page or below if space)
      let startY = imgHeight + 10;
      if (startY > pdfHeight - 20) {
        pdf.addPage();
        startY = 20;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(108, 93, 211);
      pdf.text("Transaction Details", 14, startY);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Period: ${selectedMonth}`, 14, startY + 6);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, startY + 12);

      const tableColumn = ["Date", "Title", "Category", "Type", "Amount"];
      const tableRows = [];

      filteredTransactions.slice().reverse().forEach(t => {
        const transactionData = [
          new Date(t.date).toLocaleDateString(),
          t.title,
          t.category,
          t.type,
          `$${t.amount}`
        ];
        tableRows.push(transactionData);
      });

      autoTable(pdf, {
        head: [tableColumn],
        body: tableRows,
        startY: startY + 15,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [108, 93, 211] },
      });

      pdf.save(`financial_report_${selectedMonth.replace(' ', '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-grow-1 main-content main-content-shifted">
        <Container fluid className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pt-3 gap-3">
             <div className="d-flex align-items-center gap-3">
               <Button 
                 variant="link" 
                 className="d-md-none p-0 text-dark" 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               >
                 <MdMenu size={28} />
               </Button>
               <h2 className="fw-bold mb-0 text-purple">Reports</h2>
             </div>
             
             <div className="d-flex align-items-center gap-3 w-100 w-md-auto">
               <Dropdown onSelect={(e) => setSelectedMonth(e)} className="w-50">
                 <Dropdown.Toggle variant="light" className="w-100 rounded-pill border-0 bg-white px-3 text-muted shadow-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span className="text-truncate">{selectedMonth}</span>
                 </Dropdown.Toggle>
                 <Dropdown.Menu className="border-0 shadow-sm rounded-4 mt-2 w-100">
                   {availableMonths.map(month => (
                     <Dropdown.Item key={month} eventKey={month} active={selectedMonth === month}>
                       {month}
                     </Dropdown.Item>
                   ))}
                 </Dropdown.Menu>
               </Dropdown>

               <Button 
                 className="btn d-flex align-items-center justify-content-center gap-2 px-3 py-2 w-50"
                 onClick={downloadPDF}
                 style={{ backgroundColor: '#958fc4', border: '#6c757d' ,borderRadius: '10px'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#221a54ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#958fc4'}
               >
                 <MdDownload size={20} />
                 <span className="text-truncate">Download PDF</span>
               </Button>
             </div>
          </div>

          {/* Report Content to Capture */}
          <div id="report-content" className="bg-transparent">
            {/* Summary Cards */}
            <Row className="g-4 mb-4">
              <Col md={4}>
                <Card className="card-custom p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-secondary mb-1 fw-bold">Total Income</p>
                      <h3 className="fw-bold text-success mb-0">${totalIncome.toLocaleString()}</h3>
                    </div>
                    <div className="bg-success-subtle p-2 rounded-circle">
                      <MdArrowUpward size={24} className="text-success" />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="card-custom p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-secondary mb-1 fw-bold">Total Expense</p>
                      <h3 className="fw-bold text-danger mb-0">${totalExpense.toLocaleString()}</h3>
                    </div>
                    <div className="bg-danger-subtle p-2 rounded-circle">
                      <MdArrowDownward size={24} className="text-danger" />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="card-custom p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-secondary mb-1 fw-bold">Net Savings</p>
                      <h3 className={`fw-bold mb-0 ${netSavings >= 0 ? 'text-primary' : 'text-danger'}`}>
                        ${netSavings.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-primary-subtle p-2 rounded-circle">
                      <FaWallet size={24} className="text-primary" />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row className="g-4 mb-4">
              <Col lg={7}>
                <Card className="card-custom p-4 h-100">
                  <h5 className="fw-bold mb-4">Income vs Expense (All Time)</h5>
                  <div style={{ height: '300px' }}>
                    <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                </Card>
              </Col>
              <Col lg={5}>
                <Card className="card-custom p-4 h-100">
                  <h5 className="fw-bold mb-4">Spending by Category ({selectedMonth})</h5>
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row className="g-4">
              <Col xs={12}>
                <Card className="card-custom p-4">
                  <h5 className="fw-bold mb-4">Monthly Spending Trend (All Time)</h5>
                  <div style={{ height: '300px' }}>
                    <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

        </Container>
      </div>
    </div>
  );
}
