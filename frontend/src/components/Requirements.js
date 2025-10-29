import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Requirements = ({ data, updateData, nextStep, prevStep, projectInfo }) => {
  const [formData, setFormData] = useState({
    base: data.base || { type: '', area: '' },
    flooring: data.flooring || { type: '', area: '' },
    equipment: data.equipment || [],
    additionalFeatures: data.additionalFeatures || {
      drainage: { required: false, type: 'drainage-system', area: 0 },
      fencing: { required: false, type: '', length: 0 },
      lighting: { required: false, type: '', quantity: 1 },
      shed: { required: false, type: '', area: 0 }
    }
  });
  const [equipmentList, setEquipmentList] = useState([]);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, equipmentRes] = await Promise.all([
          axios.get('http://localhost:5000/api/pricing'),
          axios.get(`http://localhost:5000/api/quotations/equipment/${projectInfo.sport}`)
        ]);
        
        setPricing(pricingRes.data);
        const equipmentData = equipmentRes.data;
        setEquipmentList(equipmentData);
        
        // Auto-select equipment
        const initializedEquipment = equipmentData.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          totalCost: Number(item.unitCost) * (Number(item.quantity) || 1)
        }));
        
        setFormData(prev => ({
          ...prev,
          equipment: initializedEquipment
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (projectInfo.sport) {
      fetchData();
    }
  }, [projectInfo.sport]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEquipmentChange = (index, field, value) => {
    const updatedEquipment = [...formData.equipment];
    
    if (field === 'quantity') {
      const quantity = Number(value) || 1;
      updatedEquipment[index] = {
        ...updatedEquipment[index],
        quantity: quantity,
        totalCost: (Number(updatedEquipment[index].unitCost) || 0) * quantity
      };
    } else {
      updatedEquipment[index] = {
        ...updatedEquipment[index],
        [field]: value
      };
    }
    
    setFormData(prev => ({
      ...prev,
      equipment: updatedEquipment
    }));
  };

  const handleAdditionalFeatureChange = (feature, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: {
        ...prev.additionalFeatures,
        [feature]: {
          ...prev.additionalFeatures[feature],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.base.type || !formData.flooring.type) {
      alert('Please select base and flooring types');
      return;
    }

    const validatedFormData = {
      ...formData,
      equipment: formData.equipment.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        totalCost: (Number(item.unitCost) || 0) * (Number(item.quantity) || 1)
      }))
    };

    updateData(validatedFormData);
    nextStep();
  };

  const getFlooringOptions = () => {
    const sportFlooring = {
      'basketball': [
        { value: 'acrylic-surface', label: 'Acrylic Surface' },
        { value: 'concrete-flooring', label: 'Concrete Flooring' },
        { value: 'polyurethane-track', label: 'Polyurethane' }
      ],
      'badminton': [
        { value: 'wooden-flooring', label: 'Wooden Flooring' },
        { value: 'pvc-flooring', label: 'PVC Flooring' },
        { value: 'rubber-flooring', label: 'Rubber Flooring' }
      ],
      'boxcricket': [
        { value: 'concrete-flooring', label: 'Concrete Flooring' },
        { value: 'synthetic-turf', label: 'Synthetic Turf' }
      ],
      'football': [
        { value: 'natural-grass', label: 'Natural Grass' },
        { value: 'synthetic-turf', label: 'Synthetic Turf' }
      ],
      'gymflooring': [
        { value: 'rubber-flooring', label: 'Rubber Flooring' },
        { value: 'pvc-flooring', label: 'PVC Flooring' },
        { value: 'wooden-flooring', label: 'Wooden Flooring' }
      ],
      'pickleball': [
        { value: 'acrylic-surface', label: 'Acrylic Surface' },
        { value: 'concrete-flooring', label: 'Concrete Flooring' }
      ],
      'running-track': [
        { value: 'polyurethane-track', label: 'Polyurethane Track' },
        { value: 'rubber-flooring', label: 'Rubber Flooring' }
      ],
      'tennis': [
        { value: 'acrylic-surface', label: 'Acrylic Surface' },
        { value: 'clay-court', label: 'Clay Court' },
        { value: 'concrete-flooring', label: 'Concrete Flooring' }
      ],
      'volleyball': [
        { value: 'acrylic-surface', label: 'Acrylic Surface' },
        { value: 'wooden-flooring', label: 'Wooden Flooring' },
        { value: 'concrete-flooring', label: 'Concrete Flooring' }
      ]
    };

    return sportFlooring[projectInfo.sport] || [
      { value: 'concrete-flooring', label: 'Concrete Flooring' },
      { value: 'synthetic-turf', label: 'Synthetic Turf' }
    ];
  };

  const getBaseOptions = () => [
    { value: 'concrete-base', label: 'Concrete Base' },
    { value: 'asphalt-base', label: 'Asphalt Base' },
    { value: 'compacted-soil', label: 'Compacted Soil' }
  ];

  const getFencingOptions = () => [
    { value: 'chain-link-fencing', label: 'Chain Link Fencing' },
    { value: 'welded-mesh-fencing', label: 'Welded Mesh Fencing' },
    { value: 'pvc-fencing', label: 'PVC Fencing' }
  ];

  const getLightingOptions = () => [
    { value: 'led-floodlights', label: 'LED Floodlights' },
    { value: 'metal-halide', label: 'Metal Halide' },
    { value: 'solar-lights', label: 'Solar Lights' }
  ];

  const getShedOptions = () => [
    { value: 'steel-shed', label: 'Steel Shed' },
    { value: 'fabric-shed', label: 'Fabric Shed' },
    { value: 'permanent-structure', label: 'Permanent Structure' }
  ];

  return (
    <div className="form-container">
      <h2>Construction Requirements</h2>
      <form onSubmit={handleSubmit}>
        {/* Base Section */}
        <div className="section">
          <h3>1. Base Construction</h3>
          <div className="form-group">
            <label>Base Type:</label>
            <select
              value={formData.base.type}
              onChange={(e) => handleChange('base', 'type', e.target.value)}
              required
            >
              <option value="">Select Base Type</option>
              {getBaseOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flooring Section */}
        <div className="section">
          <h3>2. Flooring</h3>
          <div className="form-group">
            <label>Flooring Type:</label>
            <select
              value={formData.flooring.type}
              onChange={(e) => handleChange('flooring', 'type', e.target.value)}
              required
            >
              <option value="">Select Flooring Type</option>
              {getFlooringOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="section">
          <h3>3. Sports Equipment</h3>
          {formData.equipment.map((item, index) => (
            <div key={index} className="equipment-item">
              <div className="equipment-info">
                <strong>{item.name}</strong>
                <span>Unit Cost: ₹{(Number(item.unitCost) || 0).toLocaleString()}</span>
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={Number(item.quantity) || ''}
                  onChange={(e) => handleEquipmentChange(index, 'quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="equipment-total">
                Total: ₹{(Number(item.totalCost) || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="section">
          <h3>4. Additional Features</h3>

          {/* Drainage System */}
          <div className="feature-section">
            <h4>Drainage System</h4>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.additionalFeatures.drainage.required}
                  onChange={(e) => handleAdditionalFeatureChange('drainage', 'required', e.target.checked)}
                />
                Include Drainage System
              </label>
            </div>
          </div>

          {/* Fencing */}
          <div className="feature-section">
            <h4>Fencing</h4>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.additionalFeatures.fencing.required}
                  onChange={(e) => handleAdditionalFeatureChange('fencing', 'required', e.target.checked)}
                />
                Include Fencing
              </label>
            </div>
            {formData.additionalFeatures.fencing.required && (
              <>
                <div className="form-group">
                  <label>Fencing Type:</label>
                  <select
                    value={formData.additionalFeatures.fencing.type}
                    onChange={(e) => handleAdditionalFeatureChange('fencing', 'type', e.target.value)}
                    required
                  >
                    <option value="">Select Fencing Type</option>
                    {getFencingOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fencing Length (meters):</label>
                  <input
                    type="number"
                    value={formData.additionalFeatures.fencing.length}
                    onChange={(e) => handleAdditionalFeatureChange('fencing', 'length', e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Lighting */}
          <div className="feature-section">
            <h4>Lighting</h4>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.additionalFeatures.lighting.required}
                  onChange={(e) => handleAdditionalFeatureChange('lighting', 'required', e.target.checked)}
                />
                Include Lighting System
              </label>
            </div>
            {formData.additionalFeatures.lighting.required && (
              <>
                <div className="form-group">
                  <label>Lighting Type:</label>
                  <select
                    value={formData.additionalFeatures.lighting.type}
                    onChange={(e) => handleAdditionalFeatureChange('lighting', 'type', e.target.value)}
                    required
                  >
                    <option value="">Select Lighting Type</option>
                    {getLightingOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Lights:</label>
                  <input
                    type="number"
                    value={formData.additionalFeatures.lighting.quantity}
                    onChange={(e) => handleAdditionalFeatureChange('lighting', 'quantity', e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Shed */}
          <div className="feature-section">
            <h4>Shed/Cover</h4>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.additionalFeatures.shed.required}
                  onChange={(e) => handleAdditionalFeatureChange('shed', 'required', e.target.checked)}
                />
                Include Shed/Cover
              </label>
            </div>
            {formData.additionalFeatures.shed.required && (
              <>
                <div className="form-group">
                  <label>Shed Type:</label>
                  <select
                    value={formData.additionalFeatures.shed.type}
                    onChange={(e) => handleAdditionalFeatureChange('shed', 'type', e.target.value)}
                    required
                  >
                    <option value="">Select Shed Type</option>
                    {getShedOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Shed Area (sq. meters):</label>
                  <input
                    type="number"
                    value={formData.additionalFeatures.shed.area}
                    onChange={(e) => handleAdditionalFeatureChange('shed', 'area', e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Generate Quotation</button>
        </div>
      </form>
    </div>
  );
};

export default Requirements;