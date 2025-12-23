const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Purchase date is required'],
    default: Date.now
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  categoryName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0, 'Total cost cannot be negative']
  },
  costPerItem: {
    type: Number,
    required: false
  },
  sellingPricePerItem: {
    type: Number,
    required: [true, 'Selling price per item is required'],
    min: [0, 'Selling price cannot be negative']
  },
  supplier: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate costPerItem before saving
purchaseSchema.pre('save', function(next) {
  if (this.totalCost && this.quantity) {
    this.costPerItem = this.totalCost / this.quantity;
  }
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);


