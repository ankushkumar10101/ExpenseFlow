import React from 'react';
import {MdAdd, MdMenu } from 'react-icons/md';
import { Button } from 'react-bootstrap';

const Topbar = ({ title = "Dashboard", onQuickAdd, onToggleSidebar, username }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
      <div className="d-flex align-items-center gap-3">
        <Button 
          variant="link" 
          className="d-md-none p-0 text-dark" 
          onClick={onToggleSidebar}
        >
          <MdMenu size={28} />
        </Button>
        <div>
          <h2 className="fw-bold mb-1 text-purple">{title}</h2>
          <p className="text-muted mb-0">Welcome back {username} !</p>
        </div>
      </div>

      <div className="d-flex align-items-center gap-4">
        
        <Button 
          className="btn-secondary  -custom d-flex align-items-center gap-2"
          style={{ backgroundColor: '#958fc4', border: '#6c757d' ,borderRadius: '10px'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#221a54ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#958fc4'} 
          onClick={onQuickAdd}
        >
          <MdAdd size={20} />
          <span className="d-none d-md-inline">Quick Add</span>
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
