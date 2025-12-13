import React from 'react';
import { Card } from 'react-bootstrap';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "primary" }) => {
  // trend: 'up' | 'down' | 'neutral'
  
  const getTrendIcon = () => {
    if (trend === 'up') return <MdArrowUpward size={14} className="text-white" />;
    if (trend === 'down') return <MdArrowDownward size={14} className="text-white" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#3b82f6'; // Blue for up
    if (trend === 'down') return '#3b82f6'; // Blue for down (as per design image, both arrows are blue/white on blue bg)
    // Actually in the image:
    // Income: Blue arrow up
    // Expense: Blue arrow down
    // Savings: Red dot?
    // Budget: Orange dot?
    return '#3b82f6';
  };

  return (
    <Card className="card-custom h-100">
      <Card.Body className="d-flex justify-content-between align-items-center p-4">
        <div>
          <p className="text-muted mb-1 small">{title}</p>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>
        
        <div 
          className="d-flex align-items-center justify-content-center rounded-circle"
          style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: trend ? '#e3f2fd' : '#f3e5f5', // Light blue or light purple
            color: color
          }}
        >
           {Icon ? <Icon size={24} style={{ color: color }} /> : (
             <div style={{ 
               width: '24px', 
               height: '24px', 
               borderRadius: '50%', 
               backgroundColor: color === 'orange' ? '#ffa600' : '#ff75c3' 
              }} />
           )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
