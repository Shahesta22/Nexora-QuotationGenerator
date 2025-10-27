import React from 'react';

const DebugInfo = ({ formData }) => {
  return (
    <div style={{ 
      background: '#f5f5f5', 
      padding: '20px', 
      margin: '20px 0', 
      border: '1px solid #ccc',
      fontSize: '12px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h4>Debug Information:</h4>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
};

export default DebugInfo;