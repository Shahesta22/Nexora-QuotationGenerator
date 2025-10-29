const mongoose = require('mongoose');
const Pricing = require('../models/Pricing');

const initializePricing = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sports-ground-quotation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingPricing = await Pricing.findOne({ category: 'default' });
    
    if (!existingPricing) {
      console.log('Creating default pricing data...');
      
      const defaultPricing = new Pricing({
        category: 'default',
        base: {
          'concrete-base': 1500,
          'asphalt-base': 1200,
          'compacted-soil': 800
        },
        flooring: {
          'synthetic-turf': 2500,
          'natural-grass': 1000,
          'clay-court': 1800,
          'acrylic-surface': 2200,
          'concrete-flooring': 1200,
          'wooden-flooring': 3500,
          'pvc-flooring': 2800,
          'rubber-flooring': 3200,
          'polyurethane-track': 4000,
          'epoxy-coating': 1800
        },
        equipment: {
          'basketball-hoop': 15000,
          'basketball-backboard': 8000,
          'basketball-poles': 12000,
          'badminton-posts': 8000,
          'badminton-net': 2000,
          'cricket-net': 25000,
          'cricket-matting': 15000,
          'cricket-stumps': 5000,
          'football-goalpost': 25000,
          'football-net': 5000,
          'tennis-net': 15000,
          'tennis-posts': 20000,
          'volleyball-posts': 12000,
          'volleyball-net': 3000,
          'pickleball-net': 6000,
          'pickleball-posts': 10000,
          'track-lane-marking': 5000,
          'starting-blocks': 8000
        },
        additionalFeatures: {
          'drainage-system': 800,
          'chain-link-fencing': 1200,
          'welded-mesh-fencing': 1500,
          'pvc-fencing': 2000,
          'led-floodlights': 5000,
          'metal-halide': 3000,
          'solar-lights': 8000,
          'steel-shed': 2000,
          'fabric-shed': 1500,
          'permanent-structure': 3500
        },
        courtSizes: {
          'basketball': { standard: 420, custom: 0, recreational: 0 },
          'badminton': { standard: 81.74, custom: 0, recreational: 0 },
          'boxcricket': { standard: 750, custom: 0, recreational: 0 },
          'football': { standard: 7140, custom: 0, recreational: 0 },
          'gymflooring': { standard: 200, custom: 0, recreational: 0 },
          'pickleball': { standard: 65, custom: 0, recreational: 0 },
          'running-track': { standard: 4000, custom: 0, recreational: 0 },
          'tennis': { standard: 260, custom: 0, recreational: 0 },
          'volleyball': { standard: 162, custom: 0, recreational: 0 }
        }
      });

      await defaultPricing.save();
      console.log('Default pricing data created successfully!');
    } else {
      console.log('Pricing data already exists.');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error initializing pricing data:', error);
    process.exit(1);
  }
};

initializePricing();