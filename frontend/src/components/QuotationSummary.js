import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const QuotationSummary = ({ formData, prevStep, updateData }) => {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClientInfoChange = (e) => {
    setClientInfo({
      ...clientInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!clientInfo.name?.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!clientInfo.email?.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!clientInfo.phone?.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!clientInfo.address?.trim()) {
      setError('Please enter your address');
      return false;
    }
    
    // Check if requirements are properly set
    if (!formData.requirements?.base?.type || !formData.requirements?.flooring?.type) {
      setError('Construction requirements are incomplete. Please go back and select base and flooring types.');
      return false;
    }

    setError('');
    return true;
  };

  const generateQuotation = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Prepare the data exactly as the backend expects
      const completeFormData = {
        clientInfo: {
          name: clientInfo.name.trim(),
          email: clientInfo.email.trim(),
          phone: clientInfo.phone.trim(),
          address: clientInfo.address.trim()
        },
        projectInfo: {
          sport: formData.projectInfo?.sport || '',
          gameType: formData.projectInfo?.courtType || formData.projectInfo?.gameType || '',
          courtSize: formData.projectInfo?.courtSize || ''
        },
        requirements: {
          base: {
            type: formData.requirements?.base?.type || ''
          },
          flooring: {
            type: formData.requirements?.flooring?.type || ''
          },
          equipment: formData.requirements?.equipment || [],
          lighting: formData.requirements?.lighting || { required: false },
          roof: formData.requirements?.roof || { required: false },
          additionalFeatures: formData.requirements?.additionalFeatures || []
        }
      };

      console.log('Sending quotation data:', completeFormData);

      const response = await axios.post('http://localhost:5000/api/quotations', completeFormData);
      const newQuotation = response.data;
      setQuotation(newQuotation);
      updateData('clientInfo', clientInfo);
      
      // Automatically download PDF after successful quotation generation
      setTimeout(() => {
        downloadPDF(newQuotation);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating quotation:', error);
      const errorMessage = error.response?.data?.message || 'Error generating quotation. Please check your inputs and try again.';
      const detailedError = error.response?.data?.details ? 
        `${errorMessage} Details: ${JSON.stringify(error.response.data.details)}` : errorMessage;
      
      setError(detailedError);
      alert(detailedError);
    }
    setLoading(false);
  };

const downloadPDF = async (quotationData = quotation) => {
  if (!quotationData) {
    alert('No quotation data available to download');
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Set margins and column positions with proper spacing
    const margin = 15;
    const pageWidth = 210;
    const col1 = margin; // S.No. (5px)
    const col2 = margin + 8; // Description (85px)
    const col3 = margin + 98; // Unit (12px)
    const col4 = margin + 115; // Qty (12px)
    const col5 = margin + 132; // Price (18px)
    const col6 = margin + 155; // Amount (25px)
    
    const descriptionWidth = 85;
    
    let yPosition = margin;
    
    // Function to check if new page needed
    const checkNewPage = (spaceNeeded = 10) => {
      if (yPosition + spaceNeeded > 270) {
        doc.addPage();
        yPosition = margin;
        addHeader();
        return true;
      }
      return false;
    };

    // Function to add header with logo
    const addHeader = async () => {
      // Blue header background
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      try {
        // Add logo from Google Drive - Replace with your actual Google Drive image URL
        // Make sure the image is publicly accessible
        const logoUrl = 'https://drive.google.com/file/d/1kLhj9AcNzMjvD5_Qd5_luQUoCQkIeguo/view?usp=drive_link';
        
        // Add logo (centered, 30x30 mm)
        const logoWidth = 30;
        const logoHeight = 30;
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = 5;
        
        // Add logo image
        doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
        // Company name below logo
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('NEXORA GROUP', pageWidth / 2, logoY + logoHeight + 5, { align: 'center' });
        
        // Tagline
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Sports Infrastructure Solutions', pageWidth / 2, logoY + logoHeight + 9, { align: 'center' });
        
      } catch (logoError) {
        console.warn('Logo could not be loaded, using text-only header:', logoError);
        
        // Fallback: Text-only header if logo fails to load
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('NEXORA GROUP', pageWidth / 2, 12, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Sports Infrastructure Solutions', pageWidth / 2, 17, { align: 'center' });
      }
      
      // Contact info on right side
      doc.setFontSize(7);
      doc.text('+91-8431322728', pageWidth - margin, 10, { align: 'right' });
      doc.text('info.nexoragroup@gmail.com', pageWidth - margin, 14, { align: 'right' });
      doc.text('www.nexoragroup.com', pageWidth - margin, 18, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      yPosition = 40; // Increased to accommodate larger header
    };

    // Add first page header
    await addHeader();

    // Quotation title and details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION FOR SPORTS COURT CONSTRUCTION', pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref. No: NXG/${new Date().getFullYear()}/${Math.random().toString(36).substr(2, 6).toUpperCase()}`, margin, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, yPosition, { align: 'right' });
    
    // Client information
    yPosition += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT DETAILS:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${quotationData.clientInfo?.name || 'N/A'}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Email: ${quotationData.clientInfo?.email || 'N/A'}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Phone: ${quotationData.clientInfo?.phone || 'N/A'}`, margin, yPosition);
    yPosition += 4;
    const addressLines = doc.splitTextToSize(`Address: ${quotationData.clientInfo?.address || 'N/A'}`, 150);
    doc.text(addressLines, margin, yPosition);
    yPosition += (addressLines.length * 4) + 8;

    // ... rest of your existing PDF content (project details, cost breakdown, etc.)
    // Project Description Header
    checkNewPage(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSAL DETAILS', margin, yPosition);
    yPosition += 6;
    
    const sport = quotationData.projectInfo?.sport || 'Multi-Sport';
    const courtType = quotationData.projectInfo?.courtType || quotationData.projectInfo?.gameType || 'Standard';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proposal for ${sport.replace(/-/g, ' ').toUpperCase()} ${courtType.toUpperCase()}`, margin, yPosition);
    yPosition += 10;

    // Cost Breakdown Table Header
    checkNewPage(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    // Draw table header with background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition-4, pageWidth - (2*margin), 8, 'F');
    
    // Header texts with proper alignment
    doc.text('S.No.', col1, yPosition);
    doc.text('Description', col2, yPosition);
    doc.text('Unit', col3, yPosition, { align: 'center' });
    doc.text('Qty', col4, yPosition, { align: 'center' });
    doc.text('Price', col5, yPosition, { align: 'center' });
    doc.text('Amount', col6, yPosition, { align: 'right' });
    
    yPosition += 4;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Calculate areas and quantities
    const baseArea = quotationData.requirements?.base?.area || 1000;
    const shedArea = Math.round(baseArea * 1.2);
    const flooringArea = baseArea;
    const lightCount = quotationData.requirements?.lighting?.count || 6;
    const netCount = sport.toLowerCase().includes('badminton') ? 1 : 2;

    // Function to add item with proper formatting
    const addItem = (itemNumber, title, unit, qty, price, descriptionLines) => {
      checkNewPage(20);
      
      // Item header row with proper alignment
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(itemNumber, col1, yPosition);
      doc.text(title, col2, yPosition);
      doc.text(unit, col3, yPosition, { align: 'center' });
      doc.text(qty.toString(), col4, yPosition, { align: 'center' });
      doc.text(price, col5, yPosition, { align: 'center' });
      
      // Calculate amount
      const amount = parseInt(qty) * parseInt(price.replace(/[^0-9]/g, ''));
      doc.text(amount.toLocaleString('en-IN') + '.00', col6, yPosition, { align: 'right' });
      
      yPosition += 4;
      
      // Description text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      descriptionLines.forEach(line => {
        checkNewPage(3);
        const wrappedLines = doc.splitTextToSize(line, descriptionWidth);
        wrappedLines.forEach(wrappedLine => {
          checkNewPage(3);
          doc.text(wrappedLine, col2, yPosition);
          yPosition += 3;
        });
      });
      
      yPosition += 5;
      doc.line(col2, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      return amount;
    };

    // Item 1: Base Construction
    const baseAmount = addItem(
      '1.', 
      'BASE CONSTRUCTION', 
      'Sft', 
      baseArea, 
      '110/-',
      [
        'Excavation work in surface excavation not exceeding 30cm depth.',
        'Disposal of excavated earth up to 50m as directed.',
        'Sub Grade preparation with power road roller 8-12 tonne.',
        'WBM - Stone aggregate with 100mm thickness.',
        'PCC flooring M-10 to M15 with 75mm thickness.'
      ]
    );

    // Item 2: Shed Structure (only if roof required)
    let shedAmount = 0;
    if (quotationData.requirements?.roof?.required) {
      shedAmount = addItem(
        '2.', 
        'INDOOR SHED STRUCTURE', 
        'Sft', 
        shedArea, 
        '350/-',
        [
          'Roof shed: centre 35ft, sides 30ft height.',
          'Steel: Truss 2"x2" 2mm, Pillar 8"x3" 3mm.',
          'Purlin: 2"x2" 2mm Square Pipe.',
          'Base: 10mm, J Bolt 16mm, Sheet 0.45mm.',
          'Painting: primer + enamel coat.'
        ]
      );
    }

    // Item 3: Flooring System
    const flooringAmount = addItem(
      quotationData.requirements?.roof?.required ? '3.' : '2.', 
      'ACRYLIC FLOORING', 
      'Sft', 
      flooringArea, 
      '65/-',
      [
        '8-Layer ITF approved acrylic system.',
        'Layers: Primer, Resurfacer, Unirubber.',
        'Precoat, Topcoat for protection.',
        'High performance gameplay surface.',
        'Make: UNICA/PRIOR/TOP FLOOR.'
      ]
    );

    // Item 4: Lighting System (only if required)
    let lightingAmount = 0;
    if (quotationData.requirements?.lighting?.required) {
      const lightItemNumber = quotationData.requirements?.roof?.required ? '4.' : '3.';
      lightingAmount = addItem(
        lightItemNumber, 
        'LED FLOOD LIGHTS', 
        'Nos', 
        lightCount, 
        '11,500/-',
        [
          '150-200W LED Sports Flood Lights.',
          'OSRAM make, 2 years warranty.',
          'High lumen output for sports.',
          'Weatherproof construction.'
        ]
      );
    }

    // Item 5: Nets & Posts
    let netItemNumber;
    if (quotationData.requirements?.roof?.required) {
      netItemNumber = quotationData.requirements?.lighting?.required ? '5.' : '4.';
    } else {
      netItemNumber = quotationData.requirements?.lighting?.required ? '4.' : '3.';
    }
    
    const netAmount = addItem(
      netItemNumber, 
      'POST & NET SYSTEM', 
      'Set', 
      netCount, 
      '15,000/-',
      [
        `${sport.toUpperCase()} Standard System.`,
        'Adjustable height mechanism.',
        'Galvanized steel posts.',
        'Competition standard net.'
      ]
    );

    // Total Calculation - FIXED ALIGNMENT
    checkNewPage(25);
    
    const subtotal = baseAmount + shedAmount + flooringAmount + lightingAmount + netAmount;
    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    // Draw total line
    doc.line(col5, yPosition, col6 + 10, yPosition);
    yPosition += 6;
    
    // Total row - PROPERLY ALIGNED
    doc.text('Total', col3, yPosition);
    doc.text(subtotal.toLocaleString('en-IN') + '.00', col6, yPosition, { align: 'right' });
    
    yPosition += 7;
    doc.text('GST@18%', col3, yPosition);
    doc.text(gst.toLocaleString('en-IN') + '.00', col6, yPosition, { align: 'right' });
    
    yPosition += 7;
    doc.line(col5, yPosition, col6 + 10, yPosition);
    yPosition += 7;
    
    doc.text('Grand Total', col3, yPosition);
    doc.text(grandTotal.toLocaleString('en-IN') + '.00', col6, yPosition, { align: 'right' });
    
    yPosition += 15;

    // Terms and Conditions
    checkNewPage(30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', margin, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = [
      '• Payment: 50% Advance, 30% after frame, 20% on completion',
      '• Validity: 10 days from date of issue',
      '• Completion: 35 days (excluding weather delays)',
      '• Transportation charges included',
      '• Materials: Manufacturer warranty',
      '• Workmanship: 1 year guarantee'
    ];
    
    terms.forEach(term => {
      checkNewPage(4);
      doc.text(term, margin, yPosition);
      yPosition += 4;
    });

    // Footer on each page
    const addFooter = () => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(41, 128, 185);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('NEXORA GROUP - Sports Infrastructure Solutions | Jalahalli West, Bangalore-560015', 
               pageWidth/2, pageHeight - 10, { align: 'center' });
      doc.text('+91 8431322728 | info.nexoragroup@gmail.com | www.nexoragroup.com', 
               pageWidth/2, pageHeight - 5, { align: 'center' });
    };

    // Add footer and page numbers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter();
      // Add page numbers
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth/2, doc.internal.pageSize.height - 20, { align: 'center' });
    }

    // Save the PDF
    doc.save(`Nexora_Quotation_${new Date().getTime()}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // For debugging - show current form data
  if (process.env.NODE_ENV === 'development') {
    console.log('Current formData:', formData);
    console.log('Current clientInfo:', clientInfo);
  }

  if (quotation) {
    return (
      <div className="quotation-container">
        <div className="company-letterhead">
          <h1>NEXORA GROUP</h1>
          <p>Sports Infrastructure Solutions</p>
        </div>
        
        <div className="success-message">
          <h2>✅ Quotation Generated Successfully!</h2>
          <p>Your quotation has been generated and downloaded as PDF.</p>
          <p>If the download didn't start automatically, click the button below.</p>
        </div>
        
        <div className="quotation-details">
          <div className="quotation-header">
            <h3>QUOTATION #{quotation.quotationNumber}</h3>
            <p>Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="section">
            <h4>Client Information</h4>
            <div className="info-grid">
              <div><strong>Name:</strong> {quotation.clientInfo?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {quotation.clientInfo?.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {quotation.clientInfo?.phone || 'N/A'}</div>
              <div><strong>Address:</strong> {quotation.clientInfo?.address || 'N/A'}</div>
            </div>
          </div>

          <div className="section">
            <h4>Project Details</h4>
            <div className="info-grid">
              <div><strong>Sport:</strong> {String(quotation.projectInfo?.sport || 'N/A').replace(/-/g, ' ').toUpperCase()}</div>
              <div><strong>Facility Type:</strong> {String(quotation.projectInfo?.courtType || quotation.projectInfo?.gameType || 'N/A').toUpperCase()}</div>
              <div><strong>Court Size:</strong> {String(quotation.projectInfo?.courtSize || 'N/A').toUpperCase()}</div>
              <div><strong>Court Area:</strong> {quotation.requirements?.base?.area || 'N/A'} sq. meters</div>
            </div>
          </div>

          <div className="button-group">
            <button onClick={() => downloadPDF()} className="btn-primary">Download PDF Again</button>
            <button onClick={() => window.print()} className="btn-secondary">Print</button>
            <button onClick={() => window.location.reload()} className="btn-secondary">Create New Quotation</button>
          </div>
        </div>

        <div className="company-footer">
          <h3>NEXORA GROUP</h3>
          <p>Jalahalli West, Bangalore-560015</p>
          <p>+91 8431322728 | info.nexoragroup@gmail.com | www.nexoragroup.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Client Information & Quotation Summary</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="section">
        <h3>Client Details</h3>
        <form>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={clientInfo.name}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={clientInfo.email}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your email address"
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={clientInfo.phone}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={clientInfo.address}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>
        </form>
      </div>

      <div className="section">
        <h3>Project Summary</h3>
        <div className="summary-details">
          <p><strong>Sport:</strong> {String(formData.projectInfo?.sport || 'Not selected').replace(/-/g, ' ').toUpperCase()}</p>
          <p><strong>Facility Type:</strong> {String(formData.projectInfo?.courtType || formData.projectInfo?.gameType || 'Not selected').toUpperCase()}</p>
          <p><strong>Court Size:</strong> {String(formData.projectInfo?.courtSize || 'Not selected').toUpperCase()}</p>
          <p><strong>Base Type:</strong> {formData.requirements?.base?.type || 'Not selected'}</p>
          <p><strong>Flooring Type:</strong> {formData.requirements?.flooring?.type || 'Not selected'}</p>
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
        <button 
          type="button" 
          onClick={generateQuotation} 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Generating Quotation...' : 'Generate & Download Quotation'}
        </button>
      </div>
    </div>
  );
};

export default QuotationSummary;