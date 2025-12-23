const Category = require('../models/Category');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');

// @desc    Get inventory summary
// @route   GET /api/inventory
// @access  Public
const getInventory = async (req, res) => {
  try {
    const categories = await Category.find();
    
    const inventoryData = await Promise.all(
      categories.map(async (category) => {
        // Get total purchased
        const purchaseStats = await Purchase.aggregate([
          { $match: { categoryId: category._id } },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$quantity' },
              totalCost: { $sum: '$totalCost' },
              avgSellingPrice: { $avg: '$sellingPricePerItem' }
            }
          }
        ]);

        // Get total sold
        const saleStats = await Sale.aggregate([
          { $match: { categoryId: category._id } },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$quantity' }
            }
          }
        ]);

        const totalBought = purchaseStats.length > 0 ? purchaseStats[0].totalQuantity : 0;
        const totalSold = saleStats.length > 0 ? saleStats[0].totalQuantity : 0;
        const remaining = totalBought - totalSold;
        
        const totalCost = purchaseStats.length > 0 ? purchaseStats[0].totalCost : 0;
        const avgCostPerItem = totalBought > 0 ? totalCost / totalBought : 0;
        const avgSellingPrice = purchaseStats.length > 0 ? purchaseStats[0].avgSellingPrice : 0;

        const costValue = remaining * avgCostPerItem;
        const sellingValue = remaining * avgSellingPrice;

        return {
          categoryId: category._id,
          category: category.name,
          totalBought,
          totalSold,
          remaining,
          avgCostPerItem: Math.round(avgCostPerItem * 100) / 100,
          avgSellingPrice: Math.round(avgSellingPrice * 100) / 100,
          costValue: Math.round(costValue * 100) / 100,
          sellingValue: Math.round(sellingValue * 100) / 100
        };
      })
    );

    // Calculate totals
    const totalStockValue = inventoryData.reduce((sum, item) => sum + item.costValue, 0);
    const totalPotentialValue = inventoryData.reduce((sum, item) => sum + item.sellingValue, 0);
    const totalRemainingItems = inventoryData.reduce((sum, item) => sum + item.remaining, 0);

    res.json({
      inventory: inventoryData,
      summary: {
        totalRemainingItems,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        totalPotentialValue: Math.round(totalPotentialValue * 100) / 100,
        totalCategories: categories.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get inventory for specific category
// @route   GET /api/inventory/:categoryId
// @access  Public
const getCategoryInventory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get all purchases for this category
    const purchases = await Purchase.find({ categoryId: category._id }).sort({ date: -1 });
    
    // Get all sales for this category
    const sales = await Sale.find({ categoryId: category._id }).sort({ date: -1 });

    // Calculate stats
    const totalBought = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    const remaining = totalBought - totalSold;

    const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const avgCostPerItem = totalBought > 0 ? totalCost / totalBought : 0;
    
    const avgSellingPrice = purchases.length > 0 
      ? purchases.reduce((sum, p) => sum + p.sellingPricePerItem, 0) / purchases.length 
      : 0;

    res.json({
      category: category.name,
      categoryId: category._id,
      totalBought,
      totalSold,
      remaining,
      avgCostPerItem: Math.round(avgCostPerItem * 100) / 100,
      avgSellingPrice: Math.round(avgSellingPrice * 100) / 100,
      purchases,
      sales
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getInventory,
  getCategoryInventory
};

