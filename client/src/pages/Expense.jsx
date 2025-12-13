import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function Expense() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTransaction = location.state?.transaction;

  const [show, setShow] = useState(true);
  const [type, setType] = useState("expense");
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("other");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setExpense(editingTransaction.title);
      setAmount(editingTransaction.amount);
      setCategory(editingTransaction.category);
      setNote(editingTransaction.notes || "");
    }
  }, [editingTransaction]);

  const closeModal = () => navigate(-1);
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.put(`/dashboard/expense/${editingTransaction._id}`, {
          expense, amount, category, note, type
        }, { withCredentials: true });
      } else {
        await api.post('dashboard/expense', {
          expense, amount, category, note, type
        }, { withCredentials: true });
      }
      navigate(location.state?.from || '/dashboard');
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const expenseCategories = [
    "Food", "Travel", "Shopping", "Bills", "Health", "Entertainment", "Investment", "Other"
  ];

  const incomeCategories = [
    "Salary", "Freelance", "Investments", "Gift", "Other"
  ];

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  return (
    <Modal show={show} onHide={closeModal} centered contentClassName="card-custom border-0 shadow-lg" backdropClassName="bg-dark opacity-50">
      <Modal.Header closeButton className="border-0 pb-0 ps-4 pe-4 pt-4">
        <Modal.Title className="fw-bold fs-5">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="d-flex justify-content-center mb-4">
            <div className="bg-light p-1 rounded-pill d-inline-flex position-relative" style={{ minWidth: '200px' }}>
              <div 
                className="position-absolute bg-white rounded-pill shadow-sm"
                style={{
                  top: '4px',
                  bottom: '4px',
                  left: type === 'expense' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <button
                type="button"
                className={`btn border-0 rounded-pill position-relative flex-fill py-1 px-3 fw-bold ${type === 'expense' ? 'text-purple' : 'text-muted'}`}
                onClick={() => { setType("expense"); setCategory("Other"); }}
                style={{ zIndex: 1, transition: 'color 0.3s' }}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn border-0 rounded-pill position-relative flex-fill py-1 px-3 fw-bold ${type === 'income' ? 'text-success' : 'text-muted'}`}
                onClick={() => { setType("income"); setCategory("Other"); }}
                style={{ zIndex: 1, transition: 'color 0.3s' }}
              >
                Income
              </button>
            </div>
          </div>

          {/* Large Amount Input */}
          <div className="mb-4 text-center">
            <label className="small text-muted text-uppercase fw-bold mb-1 d-block">Amount</label>
            <div className="d-flex justify-content-center align-items-center">
              <span className={`display-4 fw-bold me-1 ${type === 'expense' ? 'text-purple' : 'text-success'}`}>$</span>
              <input
                type="number"
                className={`form-control border-0 bg-transparent p-0 text-center display-4 fw-bold shadow-none ${type === 'expense' ? 'text-purple' : 'text-success'}`}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ maxWidth: '200px', outline: 'none' }}
                autoFocus
              />
            </div>
          </div>

          {/* Title & Category */}
          <div className="row g-3 mb-3">
            <div className="col-12">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control bg-light border-0 rounded-3"
                  id="titleInput"
                  placeholder="Title"
                  value={expense}
                  onChange={(e) => setExpense(e.target.value)}
                />
                <label htmlFor="titleInput" className="text-muted">Title</label>
              </div>
            </div>
            <div className="col-12">
              <div className="dropdown w-100">
                <button
                  className="btn bg-light border-0 w-100 text-start d-flex justify-content-between align-items-center rounded-3 py-3 px-3"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <span className={category ? 'text-dark' : 'text-muted'}>
                    {category || "Select Category"}
                  </span>
                  <span className="small text-muted">▼</span>
                </button>
                <ul className="dropdown-menu w-100 border-0 shadow-lg rounded-3 mt-1" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        className="dropdown-item py-2 px-3"
                        type="button"
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <div className="form-floating">
              <textarea
                className="form-control bg-light border-0 rounded-3"
                id="noteInput"
                placeholder="Note"
                style={{ height: '80px', resize: 'none' }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <label htmlFor="noteInput" className="text-muted">Note (Optional)</label>
            </div>
          </div>

          {/* Actions */}
          <div className="d-grid">
            <Button 
              type="submit" 
              className={`py-3 shadow-sm border-0 ${type === 'expense' ? 'bg-purple' : 'btn-success'}`}
              style={{ borderRadius: '12px', fontSize: '1.1rem' }}
            >
              {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
