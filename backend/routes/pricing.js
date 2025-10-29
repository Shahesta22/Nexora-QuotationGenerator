const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');
const Quotation = require('../models/Quotation');

// ✅ UNIFIED PRICING CONSTANTS - Same as frontend
const UNIFIED_PRICING = {
  baseConstruction: { rate: 110 },
  flooring: { rate: 65 },
  equipment: { cost: 55000 },
  drainage: { rate: 45 },
  postNetSystem: { cost: 30000 },
  gstRate: 0.18
};

// Calculate unified pricing
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

// Get pricing data
router.get('/', async (req, res) => {
  try {
    // Always return unified pricing
    const unifiedPricing = calculateUnifiedPricing();
    
    res.json({
      ...unifiedPricing,
      rates: UNIFIED_PRICING,
      source: 'unified-pricing-system'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create quotation with unified pricing
router.post('/quotations', async (req, res) => {
  try {
    const { clientInfo, projectInfo, requirements, unifiedPricing } = req.body;
    
    // Use provided unified pricing or calculate new one
    const finalPricing = unifiedPricing || calculateUnifiedPricing(260);
    
    // Generate quotation number
    const quotationCount = await Quotation.countDocuments();
    const quotationNumber = `NXR${String(quotationCount + 1).padStart(6, '0')}`;
    
    const quotation = new Quotation({
      quotationNumber,
      clientInfo,
      projectInfo,
      requirements,
      pricing: finalPricing,
      status: 'generated'
    });
    
    await quotation.save();
    
    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get quotation with unified pricing
router.get('/quotation/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Ensure pricing matches unified structure
    const correctPricing = calculateUnifiedPricing(quotation.requirements?.base?.area || 260);
    
    res.json({
      quotation: {
        ...quotation.toObject(),
        pricing: correctPricing
      },
      correctPricing: correctPricing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fix all quotations to use unified pricing
router.post('/fix-all-prices', async (req, res) => {
  try {
    const quotations = await Quotation.find();
    let fixedCount = 0;
    
    for (let quotation of quotations) {
      const area = quotation.requirements?.base?.area || 260;
      const correctPricing = calculateUnifiedPricing(area);
      
      await Quotation.findByIdAndUpdate(
        quotation._id,
        { pricing: correctPricing },
        { new: true }
      );
      
      fixedCount++;
    }
    
    res.json({
      message: `Fixed pricing for ${fixedCount} quotations`,
      unifiedPricing: UNIFIED_PRICING
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint to verify pricing consistency
router.get('/debug-pricing', async (req, res) => {
  try {
    const area = 260;
    const unifiedPricing = calculateUnifiedPricing(area);
    
    res.json({
      unifiedPricing,
      expectedGrandTotal: 167796,
      matchesExpected: unifiedPricing.grandTotal === 167796,
      calculation: {
        base: `${area} × ${UNIFIED_PRICING.baseConstruction.rate} = ${area * UNIFIED_PRICING.baseConstruction.rate}`,
        flooring: `${area} × ${UNIFIED_PRICING.flooring.rate} = ${area * UNIFIED_PRICING.flooring.rate}`,
        equipment: UNIFIED_PRICING.equipment.cost,
        drainage: `${area} × ${UNIFIED_PRICING.drainage.rate} = ${area * UNIFIED_PRICING.drainage.rate}`,
        postNet: UNIFIED_PRICING.postNetSystem.cost,
        subtotal: unifiedPricing.subtotal,
        gst: `18% of ${unifiedPricing.subtotal} = ${unifiedPricing.gstAmount}`,
        grandTotal: unifiedPricing.grandTotal
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;