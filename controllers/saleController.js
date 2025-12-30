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

// @desc    Get weekly sales analytics
// @route   GET /api/sales/analytics/weekly
// @access  Public
const getWeeklySales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 8 weeks if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - (8 * 7 * 24 * 60 * 60 * 1000));
    
    // Get all sales within the date range
    const sales = await Sale.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    // Group sales by week
    const weeklyData = {};
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      
      // Get the Monday of the week for this sale
      const dayOfWeek = saleDate.getDay();
      const diff = saleDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(saleDate.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      
      // Format week key as "YYYY-MM-DD" (Monday's date)
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: weekKey,
          totalSales: 0,
          totalRevenue: 0,
          totalQuantity: 0,
          transactionCount: 0
        };
      }
      
      weeklyData[weekKey].totalRevenue += sale.totalAmount || 0;
      weeklyData[weekKey].totalQuantity += sale.quantity || 0;
      weeklyData[weekKey].transactionCount += 1;
      weeklyData[weekKey].totalSales = weeklyData[weekKey].totalRevenue;
    });
    
    // Convert to array and sort by date
    const weeklyArray = Object.values(weeklyData).sort((a, b) => 
      new Date(a.weekStart) - new Date(b.weekStart)
    );
    
    // Format the response with readable week labels
    const formattedData = weeklyArray.map(week => {
      const weekDate = new Date(week.weekStart);
      const endOfWeek = new Date(weekDate);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      return {
        ...week,
        weekLabel: `${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        averagePerTransaction: week.transactionCount > 0 ? (week.totalRevenue / week.transactionCount).toFixed(2) : 0
      };
    });
    
    res.json({
      success: true,
      data: formattedData,
      summary: {
        totalWeeks: formattedData.length,
        totalRevenue: formattedData.reduce((sum, w) => sum + w.totalRevenue, 0),
        totalTransactions: formattedData.reduce((sum, w) => sum + w.transactionCount, 0),
        averageWeeklyRevenue: formattedData.length > 0 
          ? (formattedData.reduce((sum, w) => sum + w.totalRevenue, 0) / formattedData.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get day-of-week sales analytics
// @route   GET /api/sales/analytics/day-of-week
// @access  Public
const getDayOfWeekSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 2 weeks if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - (2 * 7 * 24 * 60 * 60 * 1000));
    
    // Get all sales within the date range
    const sales = await Sale.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    // Initialize day-of-week data
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = {};
    
    dayNames.forEach(day => {
      dayData[day] = {
        dayName: day,
        totalRevenue: 0,
        totalQuantity: 0,
        transactionCount: 0,
        averagePerTransaction: 0
      };
    });
    
    // Group sales by day of week
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const dayOfWeek = saleDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = dayNames[dayOfWeek];
      
      dayData[dayName].totalRevenue += sale.totalAmount || 0;
      dayData[dayName].totalQuantity += sale.quantity || 0;
      dayData[dayName].transactionCount += 1;
    });
    
    // Calculate averages and convert to array
    const dayArray = dayNames.map(day => {
      const data = dayData[day];
      data.averagePerTransaction = data.transactionCount > 0 
        ? (data.totalRevenue / data.transactionCount).toFixed(2)
        : 0;
      return data;
    });
    
    // Find best and worst performing days
    const sortedByRevenue = [...dayArray].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const bestDay = sortedByRevenue[0];
    const worstDay = sortedByRevenue.find(d => d.totalRevenue > 0) || sortedByRevenue[sortedByRevenue.length - 1];
    
    res.json({
      success: true,
      data: dayArray,
      summary: {
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        totalRevenue: dayArray.reduce((sum, d) => sum + d.totalRevenue, 0),
        totalTransactions: dayArray.reduce((sum, d) => sum + d.transactionCount, 0),
        bestDay: {
          name: bestDay.dayName,
          revenue: bestDay.totalRevenue
        },
        worstDay: {
          name: worstDay.dayName,
          revenue: worstDay.totalRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getWeeklySales,
  getDayOfWeekSales
};


