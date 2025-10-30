const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Pricing = require('../models/Pricing');

// Get sports configuration
router.get('/sports-config', (req, res) => {
  const sportsConfig = {
    sports: [
      { id: 'basketball', name: 'Basketball Court', image: '🏀' },
      { id: 'badminton', name: 'Badminton Court', image: '🏸' },
      { id: 'boxcricket', name: 'Box Cricket', image: '🏏' },
      { id: 'football', name: 'Football Field', image: '⚽' },
      { id: 'gymflooring', name: 'Gym Flooring', image: '💪' },
      { id: 'pickleball', name: 'Pickleball Court', image: '🎾' },
      { id: 'running-track', name: 'Running Track', image: '🏃' },
      { id: 'tennis', name: 'Tennis Court', image: '🎾' },
      { id: 'volleyball', name: 'Volleyball Court', image: '🏐' }
    ]
  };
  res.json(sportsConfig);
});

// Get equipment for specific sport
router.get('/equipment/:sport', async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ category: 'default' });
    if (!pricing) {
      return res.status(500).json({ message: 'Pricing data not found' });
    }

    const sport = req.params.sport;
    
    const equipmentMap = {
      'basketball': [
        { id: 'basketball-hoop', name: 'Basketball Hoop System', quantity: 2 },
        { id: 'basketball-backboard', name: 'Backboard', quantity: 2 },
        { id: 'basketball-poles', name: 'Basketball Poles', quantity: 2 }
      ],
      'badminton': [
        { id: 'badminton-posts', name: 'Badminton Posts', quantity: 2 },
        { id: 'badminton-net', name: 'Badminton Net', quantity: 1 }
      ],
      'boxcricket': [
        { id: 'cricket-net', name: 'Cricket Net', quantity: 1 },
        { id: 'cricket-matting', name: 'Cricket Matting', quantity: 1 },
        { id: 'cricket-stumps', name: 'Cricket Stumps', quantity: 3 }
      ],
      'football': [
        { id: 'football-goalpost', name: 'Football Goalpost', quantity: 2 },
        { id: 'football-net', name: 'Goal Net', quantity: 2 }
      ],
      'gymflooring': [
        // Gym flooring typically doesn't have additional equipment
      ],
      'pickleball': [
        { id: 'pickleball-net', name: 'Pickleball Net', quantity: 1 },
        { id: 'pickleball-posts', name: 'Pickleball Posts', quantity: 2 }
      ],
      'running-track': [
        { id: 'track-lane-marking', name: 'Track Lane Marking', quantity: 1 },
        { id: 'starting-blocks', name: 'Starting Blocks', quantity: 8 }
      ],
      'tennis': [
        { id: 'tennis-net', name: 'Tennis Net', quantity: 1 },
        { id: 'tennis-posts', name: 'Tennis Posts', quantity: 2 }
      ],
      'volleyball': [
        { id: 'volleyball-posts', name: 'Volleyball Posts', quantity: 2 },
        { id: 'volleyball-net', name: 'Volleyball Net', quantity: 1 }
      ]
    };

    const equipment = equipmentMap[sport] || [];
    const equipmentWithPricing = equipment.map(item => ({
      ...item,
      unitCost: pricing.equipment[item.id] || 0,
      totalCost: ((pricing.equipment[item.id] || 0) * (item.quantity || 1))
    }));

    res.json(equipmentWithPricing);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new quotation with dynamic pricing from database
router.post('/', async (req, res) => {
  try {
    console.log('=== QUOTATION REQUEST START ===');
    console.log('Received quotation request body:', JSON.stringify(req.body, null, 2));
    
    // Get pricing data from database
    const pricing = await Pricing.findOne({ category: 'default' });
    if (!pricing) {
      console.log('Pricing data not found');
      return res.status(500).json({ message: 'Pricing data not found' });
    }

    const { clientInfo, projectInfo, requirements } = req.body;
    
    // Enhanced validation
    if (!clientInfo || !clientInfo.name || !clientInfo.email || !clientInfo.phone || !clientInfo.address) {
      return res.status(400).json({ message: 'Please complete all client information fields' });
    }

    if (!projectInfo?.sport) {
      return res.status(400).json({ message: 'Sport selection is required' });
    }

    if (!requirements?.base?.type || !requirements?.flooring?.type) {
      return res.status(400).json({ message: 'Please select base and flooring types' });
    }

    // Calculate court area based on construction type
    let courtArea;
    if (projectInfo.constructionType === 'standard') {
      courtArea = pricing.courtSizes[projectInfo.sport]?.standard || 260;
    } else {
      courtArea = projectInfo.customArea || 260;
    }

    console.log('Court area calculated:', courtArea, 'for sport:', projectInfo.sport, 'type:', projectInfo.constructionType);

    // DYNAMIC PRICING CALCULATION BASED ON SELECTED REQUIREMENTS
    const baseCost = Math.round((pricing.base[requirements.base.type] || 0) * courtArea);
    const flooringCost = Math.round((pricing.flooring[requirements.flooring.type] || 0) * courtArea);
    
    // Equipment cost
    const equipmentCost = (requirements.equipment || []).reduce((total, item) => {
      return total + (Number(item.totalCost) || 0);
    }, 0);
    
    // Additional features cost
    let drainageCost = 0;
    let fencingCost = 0;
    let lightingCost = 0;
    let shedCost = 0;

    // Drainage cost
    if (requirements.additionalFeatures?.drainage?.required) {
      drainageCost = Math.round((pricing.additionalFeatures['drainage-system'] || 0) * courtArea);
    }
    
    // Fencing cost
    if (requirements.additionalFeatures?.fencing?.required && requirements.additionalFeatures.fencing.type) {
      const fencingLength = Number(requirements.additionalFeatures.fencing.length) || 0;
      fencingCost = Math.round((pricing.additionalFeatures[requirements.additionalFeatures.fencing.type] || 0) * fencingLength);
    }
    
    // Lighting cost
    if (requirements.additionalFeatures?.lighting?.required && requirements.additionalFeatures.lighting.type) {
      const lightingQuantity = Number(requirements.additionalFeatures.lighting.quantity) || 1;
      lightingCost = Math.round((pricing.additionalFeatures[requirements.additionalFeatures.lighting.type] || 0) * lightingQuantity);
    }
    
    // Shed cost
    if (requirements.additionalFeatures?.shed?.required && requirements.additionalFeatures.shed.type) {
      const shedArea = Number(requirements.additionalFeatures.shed.area) || courtArea;
      shedCost = Math.round((pricing.additionalFeatures[requirements.additionalFeatures.shed.type] || 0) * shedArea);
    }

    const subtotal = baseCost + flooringCost + equipmentCost + drainageCost + fencingCost + lightingCost + shedCost;
    const gstAmount = Math.round(subtotal * 0.18); // 18% GST
    const grandTotal = subtotal + gstAmount;

    console.log('Final cost calculation:', {
      baseCost,
      flooringCost,
      equipmentCost,
      drainageCost,
      fencingCost,
      lightingCost,
      shedCost,
      subtotal,
      gstAmount,
      grandTotal
    });

    // Prepare quotation data with dynamic pricing
    const quotationData = {
      clientInfo,
      projectInfo: {
        constructionType: projectInfo.constructionType || 'standard',
        sport: projectInfo.sport,
        courtSize: projectInfo.courtSize || 'standard',
        customArea: projectInfo.customArea || 0
      },
      requirements: {
        base: { 
          type: requirements.base.type,
          area: courtArea
        },
        flooring: { 
          type: requirements.flooring.type,
          area: courtArea
        },
        equipment: requirements.equipment || [],
        additionalFeatures: requirements.additionalFeatures || {}
      },
      // STORE DYNAMIC PRICING IN DATABASE
      pricing: {
        baseCost,
        flooringCost,
        equipmentCost,
        drainageCost,
        fencingCost,
        lightingCost,
        shedCost,
        subtotal,
        gstAmount,
        grandTotal,
        area: courtArea
      }
    };

    console.log('Creating quotation with dynamic pricing:', quotationData);
    const quotation = new Quotation(quotationData);
    await quotation.save();
    
    console.log('=== QUOTATION SAVED SUCCESSFULLY ===');
    console.log('Quotation number:', quotation.quotationNumber);
    
    res.status(201).json(quotation);
  } catch (error) {
    console.error('=== ERROR CREATING QUOTATION ===');
    console.error('Error details:', error);
    res.status(400).json({ 
      message: 'Error creating quotation', 
      error: error.message,
      details: error.errors 
    });
  }
});

// Test endpoint to check pricing data
router.get('/debug/pricing', async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ category: 'default' });
    if (!pricing) {
      return res.status(404).json({ message: 'No pricing data found' });
    }
    
    res.json({
      base: pricing.base,
      flooring: pricing.flooring,
      courtSizes: pricing.courtSizes,
      equipment: pricing.equipment,
      additionalFeatures: pricing.additionalFeatures
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;