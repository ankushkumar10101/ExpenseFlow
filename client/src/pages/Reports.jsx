import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Dropdown } from 'react-bootstrap';
import { MdArrowUpward, MdArrowDownward, MdMenu } from 'react-icons/md';
import { FaWallet } from 'react-icons/fa';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
);

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const statsRes = await api.get("/userStats", { withCredentials: true });
          if (statsRes.data?.stats) {
            setStats(statsRes.data.stats);
          }
        } catch (err) {
          // Non-critical, fallback to transactions
        }

        const txRes = await api.get("/transactions", { withCredentials: true });
        const fetchedTransactions =
          txRes.data.transactions || txRes.data.allExpense || [];
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Processing ---

  // 1. Totals (Use pre-aggregated stats directly if available, otherwise calculate from transactions)
  const calcIncome = transactions.filter(txn => txn.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const calcExpense = transactions.filter(txn => txn.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = stats?.totalIncome !== undefined ? stats.totalIncome : calcIncome;
  const totalExpense = stats?.totalExpense !== undefined ? stats.totalExpense : calcExpense;
  const netSavings = totalIncome - totalExpense;

  // 2. Category Data (Use pre-aggregated expenseCategoryTotals if available, otherwise calculate)
  const categoryData = {};
  const expenseCatList = stats?.expenseCategoryTotals;
  if (expenseCatList && expenseCatList.length > 0) {
    expenseCatList.forEach(item => {
      categoryData[item._id] = item.totalSpent;
    });
  } else {
    transactions.filter(txn => txn.type === 'expense').forEach(txn => {
      if (!categoryData[txn.category]) categoryData[txn.category] = 0;
      categoryData[txn.category] += txn.amount;
    });
  }

  // 3. Monthly Data (Always based on ALL transactions for Trends)
  const monthlyData = {};
  transactions.forEach(txn => {
    const date = new Date(txn.date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    if (txn.type === 'income') monthlyData[monthYear].income += txn.amount;
    else monthlyData[monthYear].expense += txn.amount;
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
          </div>

          <div className="bg-transparent">
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
                  <h5 className="fw-bold mb-4">Spending by Category (All Time)</h5>
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

