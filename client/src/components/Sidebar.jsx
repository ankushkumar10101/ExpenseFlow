import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MdDashboard, MdSwapHoriz, MdPieChart, MdLogout, MdClose, MdSmartToy } from 'react-icons/md';
import { GiTakeMyMoney } from 'react-icons/gi';
import { Container } from 'react-bootstrap';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div 
        className={`d-flex flex-column flex-shrink-0 p-3 bg-white sidebar-fixed ${isOpen ? 'open' : ''}`} 
      >
        <div className="d-flex align-items-center justify-content-between ">
          <Link to="/dashboard" className="d-flex align-items-center link-dark text-decoration-none">
            <span className="fs-4 fw-bold d-flex align-items-center gap-2">
              <GiTakeMyMoney className="text-purple" size={32} />
              ExpenseFlow
            </span>
          </Link>
          <button className="btn btn-link d-md-none text-dark p-0" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
              end
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <MdDashboard size={20} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/transactions" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <MdSwapHoriz size={20} />
              Transactions
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/reports" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <MdPieChart size={20} />
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ai-chat" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <MdSmartToy size={20} />
              AI Chat
            </NavLink>
          </li>
        </ul>
        <hr />
        <div className="dropdown">
          <a href="#" className="d-flex align-items-center link-dark text-decoration-none sidebar-link" onClick={() => {
              window.location.href = '/';
          }}>
            <MdLogout size={20} />
            <strong>Log out</strong>
          </a>
        </div>
      </div>
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
    </>
  );
};  

export default Sidebar;
