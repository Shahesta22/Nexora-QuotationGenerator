const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');

// Get pricing data
router.get('/', async (req, res) => {
  try {
    let pricing = await Pricing.findOne({ category: 'default' });
    
    if (!pricing) {
      // Create default pricing if not exists
      pricing = new Pricing({ category: 'default' });
      await pricing.save();
    }
    
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update pricing data
router.put('/', async (req, res) => {
  try {
    const pricing = await Pricing.findOneAndUpdate(
      { category: 'default' },
      req.body,
      { new: true, upsert: true }
    );
    res.json(pricing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;