import React from 'react';
import './OrderStatusTracker.css';

const OrderStatusTracker = ({ history, currentStatus }) => {
  const allStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  
  // Find the index of the current status
  const currentStatusIndex = allStatuses.indexOf(currentStatus);

  // --- NEW: Calculate the width of the active progress line ---
  const progressPercentage = currentStatusIndex > 0 ? (currentStatusIndex / (allStatuses.length - 1)) * 100 : 0;

  return (
    <div className="order-tracker-container">
      <h3>Order History</h3>
      <div className="order-tracker">
        
        {/* --- NEW: The active line is now a separate element --- */}
        <div className="step-line-active" style={{ width: `calc(${progressPercentage}% - 20px)` }}></div>
        
        {allStatuses.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex; // Is this the current active step?
          const historyEntry = history.find(h => h.status === status);
          const timestamp = historyEntry ? new Date(historyEntry.timestamp.seconds * 1000) : null;

          return (
            <div 
                key={status} 
                // --- NEW: Add 'current' class for the active step ---
                className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-dot"></div>
              <div className="step-label">
                <p className="status-name">{status}</p>
                {isCompleted && timestamp && (
                  <p className="status-date">{timestamp.toLocaleDateString()}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;