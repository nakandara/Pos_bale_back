const mongoose = require('mongoose');

const shopClosureSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Closure date is required'],
    unique: true
  },
  reason: {
    type: String,
    required: [true, 'Closure reason is required'],
    enum: ['Leave', 'Holiday', 'Sick Leave', 'Emergency', 'Maintenance', 'Other']
  },
  description: {
    type: String,
    maxlength: 200
  },
  isFullDay: {
    type: Boolean,
    default: true
  },
  // For partial closures
  closedHours: {
    type: Number,
    min: 0,
    max: 24,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster date queries
shopClosureSchema.index({ date: 1 });

module.exports = mongoose.model('ShopClosure', shopClosureSchema);

