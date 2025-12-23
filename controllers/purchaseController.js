const Purchase = require('../models/Purchase');
const Category = require('../models/Category');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Public
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('categoryId', 'name')
      .sort({ date: -1, createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single purchase
// @route   GET /api/purchases/:id
// @access  Public
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('categoryId', 'name');
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new purchase
// @route   POST /api/purchases
// @access  Public
const createPurchase = async (req, res) => {
  try {
    const { date, categoryId, categoryName, quantity, totalCost, sellingPricePerItem, supplier } = req.body;

    // Validation
    if (!categoryId || !categoryName || !quantity || !totalCost || !sellingPricePerItem) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: categoryId, categoryName, quantity, totalCost, sellingPricePerItem' 
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const purchase = await Purchase.create({
      date: date || new Date(),
      categoryId,
      categoryName,
      quantity: Number(quantity),
      totalCost: Number(totalCost),
      sellingPricePerItem: Number(sellingPricePerItem),
      supplier: supplier || ''
    });

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update purchase
// @route   PUT /api/purchases/:id
// @access  Public
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    const { date, categoryId, categoryName, quantity, totalCost, sellingPricePerItem, supplier } = req.body;

    // Update fields if provided
    if (date) purchase.date = date;
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      purchase.categoryId = categoryId;
    }
    if (categoryName) purchase.categoryName = categoryName;
    if (quantity) purchase.quantity = Number(quantity);
    if (totalCost) purchase.totalCost = Number(totalCost);
    if (sellingPricePerItem) purchase.sellingPricePerItem = Number(sellingPricePerItem);
    if (supplier !== undefined) purchase.supplier = supplier;

    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete purchase
// @route   DELETE /api/purchases/:id
// @access  Public
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    await Purchase.deleteOne({ _id: req.params.id });
    res.json({ message: 'Purchase deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
};


