import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourtSize = ({ data, updateData, nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    courtSize: data.courtSize || 'standard'
  });
  const [courtSizes, setCourtSizes] = useState({});

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pricing');
        setCourtSizes(response.data.courtSizes);
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    };
    fetchPricing();
  }, []);

  const handleSizeChange = (size) => {
    const updatedData = {
      ...formData,
      courtSize: size
    };
    setFormData(updatedData);
    updateData({
      ...data,
      ...updatedData
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData({
      ...data,
      ...formData
    });
    nextStep();
  };

  const getCourtArea = () => {
    return courtSizes[data.sport]?.[formData.courtSize] || 'N/A';
  };

  const sizeDescriptions = {
    standard: {
      title: 'Standard Size',
      description: 'Official competition dimensions with basic features',
      features: ['Official dimensions', 'Basic equipment', 'Standard materials']
    },
    custom: {
      title: 'Custom Size',
      description: 'Tailored to your space requirements',
      features: ['Custom dimensions', 'Flexible design', 'Personalized features']
    },
    premium: {
      title: 'Premium Size',
      description: 'Enhanced features with professional standards',
      features: ['Enhanced dimensions', 'Premium equipment', 'Professional quality']
    }
  };

  return (
    <div className="form-container">
      <h2>Select Court Size</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Selected Sport: {data.sport?.replace('-', ' ').toUpperCase()}</h3>
          <p className="court-area">Recommended Area: <strong>{getCourtArea()} sq. meters</strong></p>
          
          <div className="court-size-selection">
            {['standard', 'custom', 'premium'].map(size => (
              <div
                key={size}
                className={`court-size-card ${formData.courtSize === size ? 'selected' : ''}`}
                onClick={() => handleSizeChange(size)}
              >
                <h4>{sizeDescriptions[size].title}</h4>
                <p>{sizeDescriptions[size].description}</p>
                <div className="features-list">
                  {sizeDescriptions[size].features.map((feature, index) => (
                    <span key={index} className="feature-tag">✓ {feature}</span>
                  ))}
                </div>
                {size === 'standard' && <div className="popular-badge">Most Popular</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Next</button>
        </div>
      </form>
    </div>
  );
};

export default CourtSize;