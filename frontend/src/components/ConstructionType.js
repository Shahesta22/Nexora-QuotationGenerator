import React, { useState } from 'react';

const ConstructionType = ({ data, updateData, nextStep }) => {
  const [formData, setFormData] = useState({
    constructionType: data.constructionType || '',
    customArea: data.customArea || ''
  });

  const handleTypeChange = (type) => {
    setFormData({
      constructionType: type,
      customArea: type === 'standard' ? '' : formData.customArea
    });
  };

  const handleAreaChange = (e) => {
    setFormData({
      ...formData,
      customArea: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.constructionType) {
      alert('Please select construction type');
      return;
    }
    if (formData.constructionType !== 'standard' && !formData.customArea) {
      alert('Please enter area for non-standard/recreational court');
      return;
    }
    updateData(formData);
    nextStep();
  };

  const typeDescriptions = {
    standard: {
      title: 'Standard Size',
      description: 'Official competition dimensions',
      features: ['Official dimensions', 'Professional specifications', 'Tournament ready']
    },
    'non-standard': {
      title: 'Non-Standard Size',
      description: 'Custom dimensions to fit your space',
      features: ['Custom dimensions', 'Space optimization', 'Flexible design']
    },
    recreational: {
      title: 'Recreational Purpose',
      description: 'For casual play and community use',
      features: ['Casual play', 'Community friendly', 'Multi-purpose use']
    }
  };

  return (
    <div className="form-container">
      <h2>Select Construction Type</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>1. Construction Type</h3>
          <div className="construction-type-selection">
            {['standard', 'non-standard', 'recreational'].map(type => (
              <div
                key={type}
                className={`type-card ${formData.constructionType === type ? 'selected' : ''}`}
                onClick={() => handleTypeChange(type)}
              >
                <h4>{typeDescriptions[type].title}</h4>
                <p>{typeDescriptions[type].description}</p>
                <div className="features-list">
                  {typeDescriptions[type].features.map((feature, index) => (
                    <span key={index} className="feature-tag">✓ {feature}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {formData.constructionType && formData.constructionType !== 'standard' && (
          <div className="section">
            <h3>2. Enter Court Area</h3>
            <div className="form-group">
              <label>Area Available (sq. meters):</label>
              <input
                type="number"
                value={formData.customArea}
                onChange={handleAreaChange}
                required
                min="1"
                placeholder="Enter area in square meters"
              />
            </div>
            <p className="info-text">We'll design the court according to your available space</p>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary"
          disabled={!formData.constructionType || (formData.constructionType !== 'standard' && !formData.customArea)}
        >
          Next: Select Sport
        </button>
      </form>
    </div>
  );
};

export default ConstructionType;