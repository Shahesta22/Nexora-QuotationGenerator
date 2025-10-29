import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SportSelection = ({ data, updateData, nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    sport: data.sport || ''
  });
  const [sportsConfig, setSportsConfig] = useState([]);

  useEffect(() => {
    const fetchSportsConfig = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quotations/sports-config');
        setSportsConfig(response.data.sports);
      } catch (error) {
        console.error('Error fetching sports config:', error);
      }
    };
    fetchSportsConfig();
  }, []);

  const handleSportChange = (sport) => {
    const updatedData = {
      sport
    };
    setFormData(updatedData);
    updateData({
      ...data,
      ...updatedData
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sport) {
      alert('Please select a sport');
      return;
    }
    updateData({
      ...data,
      ...formData
    });
    nextStep();
  };

  const getSportDimensions = (sportId) => {
    const dimensions = {
      'basketball': '28m × 15m',
      'badminton': '13.4m × 6.1m',
      'boxcricket': '30m × 25m',
      'football': '105m × 68m',
      'gymflooring': 'Custom Area',
      'pickleball': '13.4m × 6.1m',
      'running-track': '400m Standard',
      'tennis': '23.77m × 8.23m',
      'volleyball': '18m × 9m'
    };
    return dimensions[sportId] || 'Custom Dimensions';
  };

  return (
    <div className="form-container">
      <h2>Select Sport</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Construction Type: <span className="highlight">{data.constructionType}</span></h3>
          {data.constructionType !== 'standard' && (
            <p className="info-text">Selected Area: <strong>{data.customArea} sq. meters</strong></p>
          )}
          
          <h4>Choose Your Sport</h4>
          <div className="sport-selection">
            {sportsConfig.map(sport => (
              <div
                key={sport.id}
                className={`sport-card ${formData.sport === sport.id ? 'selected' : ''}`}
                onClick={() => handleSportChange(sport.id)}
              >
                <div className="sport-icon">{sport.image}</div>
                <div className="sport-info">
                  <div className="sport-name">{sport.name}</div>
                  <div className="sport-dimensions">
                    {data.constructionType === 'standard' ? 
                      `Standard: ${getSportDimensions(sport.id)}` : 
                      'Custom dimensions based on your area'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={!formData.sport}
          >
            Next: Requirements
          </button>
        </div>
      </form>
    </div>
  );
};

export default SportSelection;