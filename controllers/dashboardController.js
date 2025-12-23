const Category = require('../models/Category');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Public
const getDashboardAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalCategories = await Category.countDocuments();
    const totalPurchases = await Purchase.countDocuments();
    const totalSales = await Sale.countDocuments();

    // Calculate total purchase cost and sales revenue
    const purchaseStats = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$totalCost' },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const saleStats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const totalPurchaseCost = purchaseStats.length > 0 ? purchaseStats[0].totalCost : 0;
    const totalPurchasedItems = purchaseStats.length > 0 ? purchaseStats[0].totalQuantity : 0;
    const totalRevenue = saleStats.length > 0 ? saleStats[0].totalRevenue : 0;
    const totalSoldItems = saleStats.length > 0 ? saleStats[0].totalQuantity : 0;
    
    const profit = totalRevenue - totalPurchaseCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Get recent transactions
    const recentPurchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('date categoryName quantity totalCost createdAt');

    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('date categoryName quantity totalAmount createdAt');

    // Sales by category
    const salesByCategory = await Sale.aggregate([
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: '$categoryName' },
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Top selling categories
    const topCategories = salesByCategory.map(cat => ({
      category: cat.categoryName,
      revenue: Math.round(cat.totalRevenue * 100) / 100,
      quantity: cat.totalQuantity,
      transactions: cat.count
    }));

    // Monthly sales trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Sale.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyPurchases = await Purchase.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalCost: { $sum: '$totalCost' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Low stock alerts
    const categories = await Category.find();
    const lowStockItems = [];

    for (const category of categories) {
      const purchased = await Purchase.aggregate([
        { $match: { categoryId: category._id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      const sold = await Sale.aggregate([
        { $match: { categoryId: category._id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      const totalPurchased = purchased.length > 0 ? purchased[0].total : 0;
      const totalSold = sold.length > 0 ? sold[0].total : 0;
      const remaining = totalPurchased - totalSold;

      if (remaining <= 10 && remaining > 0) {
        lowStockItems.push({
          category: category.name,
          remaining
        });
      }
    }

    res.json({
      summary: {
        totalCategories,
        totalPurchases,
        totalSales,
        totalPurchaseCost: Math.round(totalPurchaseCost * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalPurchasedItems,
        totalSoldItems,
        remainingStock: totalPurchasedItems - totalSoldItems
      },
      topCategories,
      recentPurchases,
      recentSales,
      monthlySales: monthlySales.map(m => ({
        year: m._id.year,
        month: m._id.month,
        revenue: Math.round(m.totalRevenue * 100) / 100,
        quantity: m.totalQuantity,
        transactions: m.count
      })),
      monthlyPurchases: monthlyPurchases.map(m => ({
        year: m._id.year,
        month: m._id.month,
        cost: Math.round(m.totalCost * 100) / 100,
        quantity: m.totalQuantity,
        transactions: m.count
      })),
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDashboardAnalytics
};

