import React, { useState } from 'react';
import './App.css';
import ConstructionType from './components/ConstructionType';
import SportSelection from './components/SportSelection';
import Requirements from './components/Requirements';
import QuotationSummary from './components/QuotationSummary';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clientInfo: {},
    projectInfo: {},
    requirements: {}
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const updateFormData = (field, data) => {
    setFormData(prev => ({
      ...prev,
      [field]: data
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConstructionType
            data={formData.projectInfo}
            updateData={(data) => updateFormData('projectInfo', data)}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <SportSelection
            data={formData.projectInfo}
            updateData={(data) => updateFormData('projectInfo', data)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Requirements
            data={formData.requirements}
            updateData={(data) => updateFormData('requirements', data)}
            nextStep={nextStep}
            prevStep={prevStep}
            projectInfo={formData.projectInfo}
          />
        );
      case 4:
        return (
          <QuotationSummary
            formData={formData}
            prevStep={prevStep}
            updateData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="company-header">
          <h1>NEXORA GROUP</h1>
          <p>Sports Infrastructure Solutions</p>
        </div>
        <h2>Sports Ground Construction Quotation</h2>
        <div className="progress-bar">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Construction Type</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Sport Selection</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Requirements</div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>Quotation</div>
        </div>
      </header>
      <main>
        {renderStep()}
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <h3>NEXORA GROUP</h3>
          <p>Jalahalli West, Bangalore 560015</p>
          <p>📞 +91 8431322728 | 📧 info.nexoragroup@gmail.com</p>
          <p>www.nexoragroup.com</p>
        </div>
      </footer>
    </div>
  );
}

export default App;