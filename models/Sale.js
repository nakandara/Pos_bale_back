const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Sale date is required'],
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
  sellingPricePerItem: {
    type: Number,
    required: [true, 'Selling price per item is required'],
    min: [0, 'Selling price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Calculate totalAmount before saving
saleSchema.pre('save', function(next) {
  if (this.quantity && this.sellingPricePerItem) {
    this.totalAmount = this.quantity * this.sellingPricePerItem;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);


