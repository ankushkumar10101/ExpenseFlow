import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Button, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdArrowUpward, MdArrowDownward, MdMenu } from 'react-icons/md';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';


export default function Transactions() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [user, setUser] = useState(null);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice().reverse().slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fetch User and Transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/dashboard", { withCredentials: true });
        if (userRes.data.user) {
          setUser(userRes.data.user);
          const expenseRes = await api.get(`/dashboard/expense/${userRes.data.user._id}`, { withCredentials: true });
          setTransactions(expenseRes.data.allExpense);
          setFilteredTransactions(expenseRes.data.allExpense);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle Resize for Sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = transactions;

    if (categoryFilter !== 'All Categories') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (typeFilter !== 'All Types') {
      result = result.filter(t => t.type === typeFilter.toLowerCase()); // 'Income' -> 'income'
    }

    setFilteredTransactions(result);
  }, [categoryFilter, typeFilter, transactions]);

  const handleQuickAdd = () => {
    navigate("/dashboard/add-expense", { state: { from: '/transactions' } });
  };

  const handleEdit = (transaction) => {
    navigate("/dashboard/add-expense", { state: { transaction, from: '/transactions' } });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/dashboard/expense/${id}`, { withCredentials: true });
        setTransactions(transactions.filter(t => t._id !== id));
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  // Unique Categories for Filter
  const categories = ['All Categories', ...new Set(transactions.map(t => t.category))];

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
               <h2 className="fw-bold text-purple mb-0">Transactions</h2>
             </div>
             <Button 
               className="btn-secondary custom d-flex align-items-center justify-content-center gap-2 px-4 py-2 w-100 w-md-auto"
               onClick={handleQuickAdd}
               style={{ backgroundColor: '#958fc4',border: '#6c757d' ,borderRadius: '10px' }}
               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#221a54ff'}
               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#958fc4'}
             
             >
               <MdAdd size={20} />
               Add Transaction
             </Button>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 rounded-4 shadow-sm mb-4 d-flex gap-3">
            <Dropdown onSelect={(e) => setCategoryFilter(e)}>
              <Dropdown.Toggle variant="light" className="rounded-pill border-0 bg-light px-3 text-muted" style={{ minWidth: '180px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {categoryFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-0 shadow-sm rounded-4 mt-2">
                {categories.map(cat => (
                  <Dropdown.Item key={cat} eventKey={cat} active={categoryFilter === cat}>
                    {cat}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown onSelect={(e) => setTypeFilter(e)}>
              <Dropdown.Toggle variant="light" className="rounded-pill border-0 bg-light px-3 text-muted" style={{ minWidth: '180px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {typeFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-0 shadow-sm rounded-4 mt-2">
                <Dropdown.Item eventKey="All Types" active={typeFilter === "All Types"}>All Types</Dropdown.Item>
                <Dropdown.Item eventKey="Income" active={typeFilter === "Income"}>Income</Dropdown.Item>
                <Dropdown.Item eventKey="Expense" active={typeFilter === "Expense"}>Expense</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-4">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 ps-4 text-muted fw-normal">Title</th>
                  <th className="border-0 py-3 text-muted fw-normal">Category</th>
                  <th className="border-0 py-3 text-muted fw-normal">Date</th>
                  <th className="border-0 py-3 text-muted fw-normal">Type</th>
                  <th className="border-0 py-3 text-muted fw-normal">Amount</th>
                  <th className="border-0 py-3 text-muted fw-normal text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((t) => {
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t._id}>
                      <td className="border-0 py-3 ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className={`d-flex align-items-center justify-content-center rounded-circle ${isIncome ? 'bg-success-subtle' : 'bg-danger-subtle'}`}
                            style={{ width: '40px', height: '40px' }}
                          >
                            {isIncome ? <MdArrowUpward className="text-success" /> : <MdArrowDownward className="text-danger" />}
                          </div>
                          <span className="fw-bold">{t.title}</span>
                        </div>
                      </td>
                      <td className="border-0 py-3">
                        <span className="badge bg-light text-dark fw-normal px-3 py-2 rounded-pill">
                          {t.category}
                        </span>
                      </td>
                      <td className="border-0 py-3 text-muted">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="border-0 py-3">
                        <span 
                          className={`badge fw-normal px-3 py-2 rounded-pill ${isIncome ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className={`border-0 py-3 fw-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
                        {isIncome ? '+' : '-'}${t.amount}
                      </td>
                      <td className="border-0 py-3 text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-3 flex-nowrap">
                          <Button variant="link" className="text-primary p-0" onClick={() => handleEdit(t)}>
                            <div className="rounded-circle border border-primary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                               <MdEdit size={16} />
                            </div>
                          </Button>
                          <Button variant="link" className="text-danger p-0" onClick={() => handleDelete(t._id)}>
                            <div className="rounded-circle border border-danger d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                               <MdDelete size={16} />
                            </div>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > itemsPerPage && (
            <div className="d-flex justify-content-center align-items-center gap-2">
              <Button 
                variant="light" 
                className="rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: '40px', height: '40px' }}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </Button>
              {[...Array(Math.ceil(filteredTransactions.length / itemsPerPage))].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "primary" : "light"}
                  className={`rounded-circle d-flex align-items-center justify-content-center p-0 ${currentPage === i + 1 ? 'bg-purple border-purple' : ''}`}
                  style={{ width: '40px', height: '40px' }}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button 
                variant="light" 
                className="rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: '40px', height: '40px' }}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredTransactions.length / itemsPerPage)}
              >
                &gt;
              </Button>
            </div>
          )}

        </Container>
      </div>
    </div>
  );
}
