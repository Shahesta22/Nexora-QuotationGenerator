import React, { useState, useEffect } from 'react';
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

  // ✅ UNIFIED PRICING STRUCTURE - Matches PDF and Website
  const UNIFIED_PRICING = {
    baseConstruction: {
      rate: 110, // per sq ft - matches PDF
      description: 'Standard concrete base construction'
    },
    flooring: {
      rate: 65, // per sq ft - matches PDF
      description: 'Rubber floating flooring system'
    },
    equipment: {
      cost: 55000, // Fixed cost for tennis equipment
      description: 'Tennis net, posts, and equipment'
    },
    drainage: {
      rate: 45, // per sq ft
      description: 'Drainage system installation'
    },
    postNetSystem: {
      cost: 30000, // Fixed cost - matches PDF
      description: 'Post and net system'
    },
    gstRate: 0.18 // 18% GST
  };

  const handleClientInfoChange = (e) => {
    setClientInfo({
      ...clientInfo,
      [e.target.name]: e.target.value
    });
  };

  // ✅ UNIFIED PRICING CALCULATION - Used across all components
  const calculateUnifiedPricing = (area = 260) => {
    const baseCost = area * UNIFIED_PRICING.baseConstruction.rate;
    const flooringCost = area * UNIFIED_PRICING.flooring.rate;
    const equipmentCost = UNIFIED_PRICING.equipment.cost;
    const drainageCost = area * UNIFIED_PRICING.drainage.rate;
    const postNetSystemCost = UNIFIED_PRICING.postNetSystem.cost;
    
    const subtotal = baseCost + flooringCost + equipmentCost + drainageCost + postNetSystemCost;
    const gstAmount = Math.round(subtotal * UNIFIED_PRICING.gstRate);
    const grandTotal = subtotal + gstAmount;

    return {
      baseCost,
      flooringCost,
      equipmentCost,
      drainageCost,
      postNetSystemCost,
      subtotal,
      gstAmount,
      grandTotal,
      area
    };
  };

  const formatIndianRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
      // Calculate unified pricing
      const unifiedPricing = calculateUnifiedPricing();
      
      // Prepare data with unified pricing
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
            type: formData.requirements?.base?.type || '',
            area: 260
          },
          flooring: {
            type: formData.requirements?.flooring?.type || '',
            area: 260
          },
          equipment: formData.requirements?.equipment || [],
          lighting: formData.requirements?.lighting || { required: false },
          roof: formData.requirements?.roof || { required: false },
          additionalFeatures: formData.requirements?.additionalFeatures || []
        },
        // ✅ Include unified pricing in the request
        unifiedPricing: unifiedPricing
      };

      console.log('Sending quotation with unified pricing:', completeFormData);

      const response = await axios.post('http://localhost:5000/api/quotations', completeFormData);
      const newQuotation = response.data;
      
      // ✅ Ensure backend uses our unified pricing
      const finalQuotation = {
        ...newQuotation,
        pricing: unifiedPricing // Override with our unified pricing
      };
      
      setQuotation(finalQuotation);
      updateData('clientInfo', clientInfo);
      
      // Automatically download PDF
      setTimeout(() => {
        downloadPDF(finalQuotation);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating quotation:', error);
      const errorMessage = error.response?.data?.message || 'Error generating quotation. Please check your inputs and try again.';
      setError(errorMessage);
      alert(errorMessage);
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
      
      // Set margins and column positions
      const margin = 15;
      const pageWidth = 210;
      const col1 = margin + 8; // Description
      const col2 = margin + 115; // Qty
      const col3 = margin + 132; // Price
      const col4 = margin + 155; // Amount
      
      let yPosition = margin;
      
      const checkNewPage = (spaceNeeded = 10) => {
        if (yPosition + spaceNeeded > 270) {
          doc.addPage();
          yPosition = margin;
          addHeader();
          return true;
        }
        return false;
      };

      const addHeader = async () => {
        doc.setFillColor(244, 66, 55);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        try {
          const logoUrl = '/nexoralogo.jpg';
          const logoWidth = 25;
          const logoHeight = 25;
          const logoX = margin;
          const logoY = 5;
          
          doc.addImage(logoUrl, 'JPEG', logoX, logoY, logoWidth, logoHeight);
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('NEXORA GROUP', logoX + logoWidth + 8, logoY + 10);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text('Sports Infrastructure Solutions', logoX + logoWidth + 8, logoY + 15);
          
        } catch (logoError) {
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('NEXORA GROUP', pageWidth / 2, 12, { align: 'center' });
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text('Sports Infrastructure Solutions', pageWidth / 2, 18, { align: 'center' });
        }
        
        doc.setFontSize(7);
        doc.text('+91-8431322728', pageWidth - margin, 10, { align: 'right' });
        doc.text('info.nexoragroup@gmail.com', pageWidth - margin, 15, { align: 'right' });
        doc.text('www.nexoragroup.com', pageWidth - margin, 20, { align: 'right' });
        
        doc.setTextColor(0, 0, 0);
        yPosition = 45;
      };

      await addHeader();

      // Quotation title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION FOR SPORTS COURT CONSTRUCTION', pageWidth/2, yPosition, { align: 'center' });
      
      yPosition += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ref. No: ${quotationData.quotationNumber || 'NXR000001'}`, margin, yPosition);
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

      // Project Description
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

      // ✅ USE UNIFIED PRICING FOR PDF GENERATION
      const unifiedPricing = calculateUnifiedPricing();

      // Cost Breakdown Table Header
      checkNewPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      doc.setFillColor(255,200,150);
      doc.rect(margin, yPosition-4, pageWidth - (2*margin), 8, 'F');
      
      doc.text('Description', col1, yPosition);
      doc.text('Qty', col2, yPosition, { align: 'center' });
      doc.text('Price', col3, yPosition, { align: 'center' });
      doc.text('Amount', col4, yPosition, { align: 'right' });
      
      yPosition += 4;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Add items using unified pricing
      const addItem = (title, qty, price, descriptionLines) => {
        checkNewPage(20);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(title, col1, yPosition);
        doc.text(qty.toString(), col2, yPosition, { align: 'center' });
        doc.text(`${price}/-`, col3, yPosition, { align: 'center' });
        
        const amount = qty * price;
        doc.text(amount.toLocaleString('en-IN') + '.00', col4, yPosition, { align: 'right' });
        
        yPosition += 4;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        
        descriptionLines.forEach(line => {
          checkNewPage(3);
          const wrappedLines = doc.splitTextToSize(line, 85);
          wrappedLines.forEach(wrappedLine => {
            checkNewPage(3);
            doc.text(wrappedLine, col1, yPosition);
            yPosition += 3;
          });
        });
        
        yPosition += 5;
        doc.line(col1, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        
        return amount;
      };

      let totalAmount = 0;

      // Item 1: Base Construction
      const baseAmount = addItem(
        `BASE CONSTRUCTION - ${quotationData.requirements?.base?.type || 'Standard'}`,
        unifiedPricing.area,
        UNIFIED_PRICING.baseConstruction.rate,
        [
          'Excavation work in surface excavation not exceeding 30cm depth.',
          'Disposal of excavated earth up to 50m as directed.',
          'Sub Grade preparation with power road roller 8-12 tonne.',
          'WBM - Stone aggregate with 100mm thickness.',
          'PCC flooring M-10 to M15 with 75mm thickness.'
        ]
      );
      totalAmount += baseAmount;

      // Item 2: Flooring System
      const flooringAmount = addItem(
        `FLOORING - ${quotationData.requirements?.flooring?.type || 'Acrylic'}`,
        unifiedPricing.area,
        UNIFIED_PRICING.flooring.rate,
        [
          '8-Layer ITF approved acrylic system.',
          'Layers: Primer, Resurfacer, Unirubber.',
          'Precoat, Topcoat for protection.',
          'High performance gameplay surface.',
          'Make: UNICA/PRIOR/TOP FLOOR.'
        ]
      );
      totalAmount += flooringAmount;

      // Item 3: Equipment
      const equipmentAmount = addItem(
        'EQUIPMENT - Tennis Net & Posts',
        1,
        UNIFIED_PRICING.equipment.cost,
        [
          'High quality tennis equipment.',
          'Competition standard equipment.',
          'Durable and weather resistant.'
        ]
      );
      totalAmount += equipmentAmount;

      // Item 4: Drainage System
      const drainageAmount = addItem(
        'DRAINAGE SYSTEM',
        unifiedPricing.area,
        UNIFIED_PRICING.drainage.rate,
        [
          'PVC drainage pipes with slope design.',
          'Surface and sub-surface drainage.',
          'Prevents water logging.',
          'Durable construction.'
        ]
      );
      totalAmount += drainageAmount;

      // Item 5: Nets & Posts
      const netAmount = addItem(
        'POST & NET SYSTEM',
        1,
        UNIFIED_PRICING.postNetSystem.cost,
        [
          `${sport.toUpperCase()} Standard System.`,
          'Adjustable height mechanism.',
          'Galvanized steel posts.',
          'Competition standard net.'
        ]
      );
      totalAmount += netAmount;

      // Total Calculation - Should match website exactly
      checkNewPage(25);
      
      const subtotal = totalAmount;
      const gst = Math.round(subtotal * UNIFIED_PRICING.gstRate);
      const grandTotal = subtotal + gst;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      
      doc.line(col3, yPosition, col4 + 10, yPosition);
      yPosition += 6;
      
      doc.text('Total', col2, yPosition);
      doc.text(subtotal.toLocaleString('en-IN') + '.00', col4, yPosition, { align: 'right' });
      
      yPosition += 7;
      doc.text(`GST@${UNIFIED_PRICING.gstRate * 100}%`, col2, yPosition);
      doc.text(gst.toLocaleString('en-IN') + '.00', col4, yPosition, { align: 'right' });
      
      yPosition += 7;
      doc.line(col3, yPosition, col4 + 10, yPosition);
      yPosition += 7;
      
      doc.text('Grand Total', col2, yPosition);
      doc.text(grandTotal.toLocaleString('en-IN') + '.00', col4, yPosition, { align: 'right' });
      
      // Footer
      const addFooter = () => {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(244, 66, 55);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('NEXORA GROUP - Sports Infrastructure Solutions | Jalahalli West, Bangalore-560015', 
                 pageWidth/2, pageHeight - 10, { align: 'center' });
        doc.text('+91 8431322728 | info.nexoragroup@gmail.com | www.nexoragroup.com', 
                 pageWidth/2, pageHeight - 5, { align: 'center' });
      };

      // Add footer to all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter();
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth/2, doc.internal.pageSize.height - 20, { align: 'center' });
      }

      // Save PDF
      doc.save(`Nexora_Quotation_${quotationData.quotationNumber || 'NXR000001'}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (quotation) {
    // ✅ Use unified pricing for display
    const pricing = calculateUnifiedPricing();

    return (
      <div className="quotation-container">
        <div className="company-letterhead">
          <h1>NEXORA GROUP</h1>
          <p>Sports Infrastructure Solutions</p>
        </div>
        
        <div className="success-message">
          <h2>✅ Quotation Generated Successfully!</h2>
          <p>Your quotation has been generated with unified pricing across all platforms.</p>
        </div>
        
        <div className="quotation-details">
          <div className="quotation-header">
            <h3>QUOTATION #{quotation.quotationNumber}</h3>
            <p>Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Client Information */}
          <div className="section">
            <h4>Client Information</h4>
            <div className="info-grid">
              <div><strong>Name:</strong> {quotation.clientInfo?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {quotation.clientInfo?.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {quotation.clientInfo?.phone || 'N/A'}</div>
              <div><strong>Address:</strong> {quotation.clientInfo?.address || 'N/A'}</div>
            </div>
          </div>

          {/* ✅ UNIFIED PRICE BREAKDOWN */}
          <div className="section price-section">
            <h4>Price Breakdown (Unified Across All Platforms)</h4>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Base Construction ({quotation.requirements?.base?.type || 'Standard'})</span>
                <span>{formatIndianRupees(pricing.baseCost)}</span>
              </div>
              <div className="price-row">
                <span>Flooring ({quotation.requirements?.flooring?.type || 'Standard'})</span>
                <span>{formatIndianRupees(pricing.flooringCost)}</span>
              </div>
              <div className="price-row">
                <span>Equipment</span>
                <span>{formatIndianRupees(pricing.equipmentCost)}</span>
              </div>
              <div className="price-row">
                <span>Drainage System</span>
                <span>{formatIndianRupees(pricing.drainageCost)}</span>
              </div>
              <div className="price-row">
                <span>Post & Net System</span>
                <span>{formatIndianRupees(pricing.postNetSystemCost)}</span>
              </div>
              <div className="price-row subtotal">
                <span><strong>Subtotal</strong></span>
                <span><strong>{formatIndianRupees(pricing.subtotal)}</strong></span>
              </div>
              <div className="price-row">
                <span>GST (18%)</span>
                <span>{formatIndianRupees(pricing.gstAmount)}</span>
              </div>
              <div className="price-row grand-total">
                <span><strong>Grand Total</strong></span>
                <span><strong>{formatIndianRupees(pricing.grandTotal)}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button onClick={() => downloadPDF()} className="btn-primary">Download PDF</button>
            <button onClick={() => window.print()} className="btn-secondary">Print</button>
            <button onClick={() => window.location.reload()} className="btn-secondary">New Quotation</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Client Information & Quotation Summary</h2>
      
      {error && <div className="error-message">{error}</div>}
      
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