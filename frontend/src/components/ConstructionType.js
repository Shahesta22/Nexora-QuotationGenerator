import React, { useState } from 'react';

const ConstructionType = ({ data, updateData, nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    type: data.type || '',
    category: data.category || ''
  });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'type' && { category: '' }) // Reset category when type changes
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData(formData);
    nextStep();
  };

  const getCategories = () => {
    switch (formData.type) {
      case 'standard':
        return ['Basketball Court', 'Tennis Court', 'Football Field', 'Cricket Ground', 'Volleyball Court'];
      case 'non-standard':
        return ['Multi-sport Court', 'Training Ground', 'Practice Area', 'Custom Dimensions'];
      case 'recreational':
        return ['Children Play Area', 'Community Park', 'Fitness Zone', 'Leisure Area'];
      default:
        return [];
    }
  };

  return (
    <div className="form-container">
      <h2>Construction Type</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Construction Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="standard">Standard Size Court</option>
            <option value="non-standard">Non-standard Size</option>
            <option value="recreational">Recreational Purpose</option>
          </select>
        </div>

        {formData.type && (
          <div className="form-group">
            <label>Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Next</button>
        </div>
      </form>
    </div>
  );
};

export default ConstructionType;