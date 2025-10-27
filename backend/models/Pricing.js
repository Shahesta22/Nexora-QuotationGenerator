const mongoose = require('mongoose');

const courtSizes = {
  // Outdoor Courts
  'basketball': { standard: 420, custom: 0, premium: 500 },
  'football': { standard: 7140, custom: 0, premium: 8000 },
  'volleyball': { standard: 162, custom: 0, premium: 200 },
  'badminton': { standard: 81, custom: 0, premium: 100 },
  'pickleball': { standard: 65, custom: 0, premium: 80 },
  'tennis': { standard: 260, custom: 0, premium: 300 },
  'cricket': { standard: 15000, custom: 0, premium: 18000 },
  
  // Indoor Courts
  'table-tennis': { standard: 15, custom: 0, premium: 20 },
  'swimming': { standard: 50, custom: 0, premium: 75 },
  'basketball-indoor': { standard: 420, custom: 0, premium: 500 },
  'badminton-indoor': { standard: 81, custom: 0, premium: 100 }
};

const pricingSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  base: {
    'concrete-base': { type: Number, default: 1500 },
    'asphalt-base': { type: Number, default: 1200 },
    'compacted-soil': { type: Number, default: 800 }
  },
  flooring: {
    // Outdoor Flooring
    'synthetic-turf': { type: Number, default: 2500 },
    'natural-grass': { type: Number, default: 1000 },
    'clay-court': { type: Number, default: 1800 },
    'acrylic-surface': { type: Number, default: 2200 },
    'concrete-flooring': { type: Number, default: 1200 },
    
    // Indoor Flooring
    'wooden-flooring': { type: Number, default: 3500 },
    'pvc-flooring': { type: Number, default: 2800 },
    'rubber-flooring': { type: Number, default: 3200 }
  },
  equipment: {
    // Basketball
    'basketball-hoop': { type: Number, default: 15000 },
    'basketball-backboard': { type: Number, default: 8000 },
    
    // Football
    'football-goalpost': { type: Number, default: 25000 },
    'football-net': { type: Number, default: 5000 },
    
    // Volleyball
    'volleyball-posts': { type: Number, default: 12000 },
    'volleyball-net': { type: Number, default: 3000 },
    
    // Badminton
    'badminton-posts': { type: Number, default: 8000 },
    'badminton-net': { type: Number, default: 2000 },
    
    // Pickleball
    'pickleball-net': { type: Number, default: 6000 },
    'pickleball-posts': { type: Number, default: 10000 },
    
    // Tennis
    'tennis-net': { type: Number, default: 15000 },
    'tennis-posts': { type: Number, default: 20000 },
    
    // Cricket
    'cricket-pitch': { type: Number, default: 50000 },
    'cricket-sight-screen': { type: Number, default: 25000 },
    
    // Table Tennis
    'table-tennis-table': { type: Number, default: 8000 },
    'table-tennis-net': { type: Number, default: 1000 },
    
    // Swimming
    'swimming-pool-liner': { type: Number, default: 80000 },
    'filtration-system': { type: Number, default: 120000 },
    'pool-ladder': { type: Number, default: 15000 }
  },
  lighting: {
    'led-floodlights': { type: Number, default: 5000 },
    'metal-halide': { type: Number, default: 3000 },
    'solar-lights': { type: Number, default: 8000 },
    'indoor-led': { type: Number, default: 4000 }
  },
  roof: {
    'steel-shed': { type: Number, default: 2000 },
    'fabric-shed': { type: Number, default: 1500 },
    'permanent-structure': { type: Number, default: 3500 },
    'swimming-pool-cover': { type: Number, default: 5000 }
  },
  courtSizes: { type: Object, default: courtSizes }
});

module.exports = mongoose.model('Pricing', pricingSchema);