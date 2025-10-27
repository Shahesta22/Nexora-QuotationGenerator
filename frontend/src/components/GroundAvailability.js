import React, { useState } from 'react';

const GroundAvailability = ({ data, updateData, nextStep }) => {
  const [formData, setFormData] = useState({
    areaAvailable: data.areaAvailable || '',
    soilType: data.soilType || '',
    locationType: data.locationType || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData(formData);
    nextStep();
  };

  return (
    <div className="form-container">
      <h2>Ground Availability Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Area Available (sq. meters):</label>
          <input
            type="number"
            name="areaAvailable"
            value={formData.areaAvailable}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Soil Type:</label>
          <select
            name="soilType"
            value={formData.soilType}
            onChange={handleChange}
            required
          >
            <option value="">Select Soil Type</option>
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
            <option value="loamy">Loamy</option>
            <option value="rocky">Rocky</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location Type:</label>
          <select
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            required
          >
            <option value="">Select Location Type</option>
            <option value="urban">Urban</option>
            <option value="suburban">Suburban</option>
            <option value="rural">Rural</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">Next</button>
      </form>
    </div>
  );
};

export default GroundAvailability;