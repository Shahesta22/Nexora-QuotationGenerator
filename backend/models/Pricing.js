const mongoose = require('mongoose');

const courtSizes = {
  // Standard dimensions in square meters
  'basketball': { standard: 420, custom: 0, recreational: 0 },
  'badminton': { standard: 81.74, custom: 0, recreational: 0 }, // 13.4m x 6.1m
  'boxcricket': { standard: 750, custom: 0, recreational: 0 }, // 30m x 25m
  'football': { standard: 7140, custom: 0, recreational: 0 },
  'gymflooring': { standard: 200, custom: 0, recreational: 0 },
  'pickleball': { standard: 65, custom: 0, recreational: 0 },
  'running-track': { standard: 4000, custom: 0, recreational: 0 },
  'tennis': { standard: 260, custom: 0, recreational: 0 },
  'volleyball': { standard: 162, custom: 0, recreational: 0 }
};

const pricingSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  base: {
    'concrete-base': { type: Number, default: 1500 },
    'asphalt-base': { type: Number, default: 1200 },
    'compacted-soil': { type: Number, default: 800 }
  },
  flooring: {
    // Sports Specific Flooring
    'synthetic-turf': { type: Number, default: 2500 },
    'natural-grass': { type: Number, default: 1000 },
    'clay-court': { type: Number, default: 1800 },
    'acrylic-surface': { type: Number, default: 2200 },
    'concrete-flooring': { type: Number, default: 1200 },
    'wooden-flooring': { type: Number, default: 3500 },
    'pvc-flooring': { type: Number, default: 2800 },
    'rubber-flooring': { type: Number, default: 3200 },
    'polyurethane-track': { type: Number, default: 4000 },
    'epoxy-coating': { type: Number, default: 1800 }
  },
  equipment: {
    // Basketball
    'basketball-hoop': { type: Number, default: 15000 },
    'basketball-backboard': { type: Number, default: 8000 },
    'basketball-poles': { type: Number, default: 12000 },
    
    // Badminton
    'badminton-posts': { type: Number, default: 8000 },
    'badminton-net': { type: Number, default: 2000 },
    
    // Box Cricket
    'cricket-net': { type: Number, default: 25000 },
    'cricket-matting': { type: Number, default: 15000 },
    'cricket-stumps': { type: Number, default: 5000 },
    
    // Football
    'football-goalpost': { type: Number, default: 25000 },
    'football-net': { type: Number, default: 5000 },
    
    // Tennis
    'tennis-net': { type: Number, default: 15000 },
    'tennis-posts': { type: Number, default: 20000 },
    
    // Volleyball
    'volleyball-posts': { type: Number, default: 12000 },
    'volleyball-net': { type: Number, default: 3000 },
    
    // Pickleball
    'pickleball-net': { type: Number, default: 6000 },
    'pickleball-posts': { type: Number, default: 10000 },
    
    // Running Track
    'track-lane-marking': { type: Number, default: 5000 },
    'starting-blocks': { type: Number, default: 8000 }
  },
  additionalFeatures: {
    'drainage-system': { type: Number, default: 800 },
    'chain-link-fencing': { type: Number, default: 1200 },
    'welded-mesh-fencing': { type: Number, default: 1500 },
    'pvc-fencing': { type: Number, default: 2000 },
    'led-floodlights': { type: Number, default: 5000 },
    'metal-halide': { type: Number, default: 3000 },
    'solar-lights': { type: Number, default: 8000 },
    'steel-shed': { type: Number, default: 2000 },
    'fabric-shed': { type: Number, default: 1500 },
    'permanent-structure': { type: Number, default: 3500 }
  },
  courtSizes: { type: Object, default: courtSizes }
});

module.exports = mongoose.model('Pricing', pricingSchema);