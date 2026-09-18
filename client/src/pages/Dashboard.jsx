import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import TransactionList from "../components/TransactionList";
import ExpenseChart from "../components/ExpenseChart";
import { MdAttachMoney, MdCategory, MdTimeline, MdReceipt } from "react-icons/md";

export default function Dashboard() {
  const navigate = useNavigate();

  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [user, setUser] = useState();
  const [transactions, setTransactions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState();

  useEffect(() => {
    api.get("/userStats", { withCredentials: true }).then((res) => {
      setUser(res.data.user);
      setStats(res.data.stats);
    });

    api.get("/transactions", { withCredentials: true }).then((res) => {
      const fetchedTransactions =
        res.data.transactions || res.data.allExpense || [];
      setTransactions(fetchedTransactions);
    });
  }, []);

  useEffect(() => {
    if (stats?.totalExpense !== undefined) {
      setTotalExpenseAmount(stats.totalExpense);
    } else {
      const expenses = transactions.filter((txn) => txn.type === "expense");
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenseAmount(total);
    }
  }, [stats, transactions]);

  useEffect(() => {
    const last = transactions[transactions.length - 1] || null;
    setLastTransaction(last);
  }, [transactions]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleQuickAdd = () => {
    navigate("/dashboard/add-transaction");
  };

  return user ? (
    <div>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-grow-1 main-content main-content-shifted">
        <Container fluid className="p-4">
          <Topbar
            title="Dashboard"
            onQuickAdd={handleQuickAdd}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            username={user?.username}
          />

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} md={6} lg={3}>
              <StatCard
                title="Total Income"
                value={`$${stats?.totalIncome || 0}`}
                icon={MdAttachMoney}
                color="#28a745"
                trend="up"
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <StatCard
                title="Total Expense"
                value={`$${totalExpenseAmount}`}
                icon={MdAttachMoney}
                color="#6c5dd3"
                trend="up"
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <StatCard
                title="Net Savings"
                value={`$${(
                  (stats?.totalIncome || 0) - totalExpenseAmount
                ).toFixed(2)}`}
                icon={MdAttachMoney}
                color="#17a2b8"
                trend={
                  (stats?.totalIncome || 0) - totalExpenseAmount >= 0
                    ? "up"
                    : "down"
                }
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <StatCard
                title="Most Spent On"
                value={stats?.mostSpentCategory || "None"}
                icon={MdCategory}
                color="#ff75c3"
                trend="neutral"
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <StatCard
                title="Last Transaction"
                value={`$${lastTransaction?.amount || 0}`}
                icon={MdTimeline}
                color="#ffa600"
                trend="down"
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <StatCard
                title="Total Transactions"
                value={transactions.length}
                icon={MdReceipt}
                color="#3b82f6"
                trend="up"
              />
            </Col>
          </Row>

          {/* Charts and Lists */}
          <Row className="g-4">
            <Col xs={12} lg={8}>
              <div className="card-custom p-4 h-100">
                <h5 className="fw-bold mb-4">Transaction Overview</h5>
                <ExpenseChart
                  expenseCategoryTotals={stats?.expenseCategoryTotals || []}
                  incomeCategoryTotals={stats?.incomeCategoryTotals || []}
                />
              </div>
            </Col>
            <Col xs={12} lg={4}>
              <TransactionList transactions={transactions} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  ) : (
    <Container
      fluid
      className="min-vh-100 p-4 d-flex justify-content-center align-items-center"
    >
      <div
        className="spinner-border text-primary"
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </Container>
  );
}
