const Sale = require('../models/Sale');
const Category = require('../models/Category');
const Purchase = require('../models/Purchase');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Public
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('categoryId', 'name')
      .sort({ date: -1, createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Public
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('categoryId', 'name');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Public
const createSale = async (req, res) => {
  try {
    const { date, categoryId, categoryName, quantity, sellingPricePerItem } = req.body;

    // Validation
    if (!categoryId || !categoryName || !quantity || !sellingPricePerItem) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: categoryId, categoryName, quantity, sellingPricePerItem' 
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check available stock
    const totalPurchased = await Purchase.aggregate([
      { $match: { categoryId: category._id } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalSold = await Sale.aggregate([
      { $match: { categoryId: category._id } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const purchased = totalPurchased.length > 0 ? totalPurchased[0].total : 0;
    const sold = totalSold.length > 0 ? totalSold[0].total : 0;
    const availableStock = purchased - sold;

    if (Number(quantity) > availableStock) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${availableStock} items available`,
        availableStock 
      });
    }

    const sale = await Sale.create({
      date: date || new Date(),
      categoryId,
      categoryName,
      quantity: Number(quantity),
      sellingPricePerItem: Number(sellingPricePerItem)
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Public
const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const { date, categoryId, categoryName, quantity, sellingPricePerItem } = req.body;

    // Update fields if provided
    if (date) sale.date = date;
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      sale.categoryId = categoryId;
    }
    if (categoryName) sale.categoryName = categoryName;
    if (quantity) sale.quantity = Number(quantity);
    if (sellingPricePerItem) sale.sellingPricePerItem = Number(sellingPricePerItem);

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Public
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await Sale.deleteOne({ _id: req.params.id });
    res.json({ message: 'Sale deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale
};

