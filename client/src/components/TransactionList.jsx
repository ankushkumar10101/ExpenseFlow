import React from 'react';
import { Card } from 'react-bootstrap';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';

const TransactionList = ({ transactions }) => {
  return (
    <Card className="card-custom h-100">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">Recent Transactions</h5>
        
        <div className="d-flex flex-column gap-3">
          {transactions.slice(-5).reverse().map((t, index) => {
            const isIncome = t.type === 'income';
            return (
              <div key={index} className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: isIncome ? '#e8f5e9' : '#ffebee' 
                    }}
                  >
                    {isIncome ? (
                      <MdArrowUpward className="text-success" size={20} />
                    ) : (
                      <MdArrowDownward className="text-danger" size={20} />
                    )}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{t.title}</h6>
                    <small className="text-muted">{new Date(t.date).toLocaleDateString()}</small>
                  </div>
                </div>
                <span className={`fw-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
                  {isIncome ? '+' : '-'}${t.amount}
                </span>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
            <p className="text-center text-muted my-3">No recent transactions</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TransactionList;
