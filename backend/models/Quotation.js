const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  clientInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  projectInfo: {
    // New fields
    constructionType: { type: String, required: true },
    sport: { type: String, required: true },
    customArea: { type: Number, default: 0 },
    // Old fields for backward compatibility
    gameType: { type: String },
    courtType: { type: String },
    courtSize: { type: String }
  },
  requirements: {
    base: {
      type: { type: String, required: true },
      area: { type: Number, required: true }
    },
    flooring: {
      type: { type: String, required: true },
      area: { type: Number, required: true }
    },
    equipment: [{
      name: String,
      quantity: Number,
      unitCost: Number,
      totalCost: Number
    }],
    // New additional features structure
    additionalFeatures: {
      drainage: {
        required: { type: Boolean, default: false },
        type: { type: String },
        area: { type: Number }
      },
      fencing: {
        required: { type: Boolean, default: false },
        type: { type: String },
        length: { type: Number }
      },
      lighting: {
        required: { type: Boolean, default: false },
        type: { type: String },
        quantity: { type: Number }
      },
      shed: {
        required: { type: Boolean, default: false },
        type: { type: String },
        area: { type: Number }
      }
    },
    // Old structure for backward compatibility
    lighting: {
      required: { type: Boolean, default: false },
      type: { type: String },
      quantity: { type: Number }
    },
    roof: {
      required: { type: Boolean, default: false },
      type: { type: String },
      area: { type: Number }
    }
  },
  pricing: {
    baseCost: { type: Number, required: true },
    flooringCost: { type: Number, required: true },
    equipmentCost: { type: Number, default: 0 },
    // New costs
    drainageCost: { type: Number, default: 0 },
    fencingCost: { type: Number, default: 0 },
    shedCost: { type: Number, default: 0 },
    // Old costs for backward compatibility
    lightingCost: { type: Number, default: 0 },
    roofCost: { type: Number, default: 0 },
    additionalCost: { type: Number, default: 0 },
    totalCost: { type: Number, required: true }
  },
  quotationNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

quotationSchema.pre('save', async function(next) {
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    this.quotationNumber = `NXR${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);