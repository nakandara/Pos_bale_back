const Sale = require('../models/Sale');
const Category = require('../models/Category');
const Purchase = require('../models/Purchase');
const ShopClosure = require('../models/ShopClosure');

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

    // Get shop closures within the date range
    const closures = await ShopClosure.find({
      date: {
        $gte: start,
        $lte: end
      }
    });

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
          transactionCount: 0,
          closedDays: 0
        };
      }
      
      weeklyData[weekKey].totalRevenue += sale.totalAmount || 0;
      weeklyData[weekKey].totalQuantity += sale.quantity || 0;
      weeklyData[weekKey].transactionCount += 1;
      weeklyData[weekKey].totalSales = weeklyData[weekKey].totalRevenue;
    });
    
    // Add closure information to weekly data
    closures.forEach(closure => {
      const closureDate = new Date(closure.date);
      
      // Get the Monday of the week for this closure
      const dayOfWeek = closureDate.getDay();
      const diff = closureDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(closureDate);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: weekKey,
          totalSales: 0,
          totalRevenue: 0,
          totalQuantity: 0,
          transactionCount: 0,
          closedDays: 0
        };
      }
      
      weeklyData[weekKey].closedDays += closure.isFullDay ? 1 : 0.5;
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
      
      const openDays = 7 - week.closedDays;
      const adjustedAvgRevenue = openDays > 0 ? (week.totalRevenue / openDays).toFixed(2) : 0;
      
      return {
        ...week,
        weekLabel: `${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        averagePerTransaction: week.transactionCount > 0 ? (week.totalRevenue / week.transactionCount).toFixed(2) : 0,
        openDays,
        averageRevenuePerOpenDay: adjustedAvgRevenue,
        hasClosure: week.closedDays > 0
      };
    });
    
    // Calculate summary statistics
    const totalClosedDays = formattedData.reduce((sum, w) => sum + w.closedDays, 0);
    const totalOpenDays = formattedData.reduce((sum, w) => sum + w.openDays, 0);
    const weeksWithClosures = formattedData.filter(w => w.closedDays > 0).length;
    
    res.json({
      success: true,
      data: formattedData,
      summary: {
        totalWeeks: formattedData.length,
        totalRevenue: formattedData.reduce((sum, w) => sum + w.totalRevenue, 0),
        totalTransactions: formattedData.reduce((sum, w) => sum + w.transactionCount, 0),
        averageWeeklyRevenue: formattedData.length > 0 
          ? (formattedData.reduce((sum, w) => sum + w.totalRevenue, 0) / formattedData.length).toFixed(2)
          : 0,
        totalClosedDays,
        totalOpenDays,
        weeksWithClosures,
        averageRevenuePerOpenDay: totalOpenDays > 0 
          ? (formattedData.reduce((sum, w) => sum + w.totalRevenue, 0) / totalOpenDays).toFixed(2)
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

    // Get shop closures within the date range
    const closures = await ShopClosure.find({
      date: {
        $gte: start,
        $lte: end
      }
    });

    // Initialize day-of-week data
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = {};
    
    dayNames.forEach(day => {
      dayData[day] = {
        dayName: day,
        totalRevenue: 0,
        totalQuantity: 0,
        transactionCount: 0,
        averagePerTransaction: 0,
        closedCount: 0,
        openCount: 0
      };
    });
    
    // Count total occurrences of each day in the date range
    const dayOccurrences = {};
    dayNames.forEach(day => { dayOccurrences[day] = 0; });
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dayName = dayNames[currentDate.getDay()];
      dayOccurrences[dayName]++;
      dayData[dayName].openCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group sales by day of week
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const dayOfWeek = saleDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = dayNames[dayOfWeek];
      
      dayData[dayName].totalRevenue += sale.totalAmount || 0;
      dayData[dayName].totalQuantity += sale.quantity || 0;
      dayData[dayName].transactionCount += 1;
    });
    
    // Group closures by day of week
    closures.forEach(closure => {
      const closureDate = new Date(closure.date);
      const dayOfWeek = closureDate.getDay();
      const dayName = dayNames[dayOfWeek];
      
      if (closure.isFullDay) {
        dayData[dayName].closedCount += 1;
        dayData[dayName].openCount -= 1;
      }
    });
    
    // Calculate averages and convert to array
    const dayArray = dayNames.map(day => {
      const data = dayData[day];
      data.averagePerTransaction = data.transactionCount > 0 
        ? (data.totalRevenue / data.transactionCount).toFixed(2)
        : 0;
      data.totalOccurrences = dayOccurrences[day];
      data.averageRevenuePerOpenDay = data.openCount > 0 
        ? (data.totalRevenue / data.openCount).toFixed(2)
        : 0;
      data.hasClosure = data.closedCount > 0;
      return data;
    });
    
    // Find best and worst performing days (excluding closed days)
    const sortedByRevenue = [...dayArray].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const bestDay = sortedByRevenue[0];
    const worstDay = sortedByRevenue.find(d => d.totalRevenue > 0) || sortedByRevenue[sortedByRevenue.length - 1];
    
    // Find best performing day by average revenue per open day
    const sortedByAvgRevenue = [...dayArray].sort((a, b) => 
      parseFloat(b.averageRevenuePerOpenDay) - parseFloat(a.averageRevenuePerOpenDay)
    );
    const bestDayByAvg = sortedByAvgRevenue[0];
    
    const totalClosedDays = dayArray.reduce((sum, d) => sum + d.closedCount, 0);
    
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
        totalClosedDays,
        bestDay: {
          name: bestDay.dayName,
          revenue: bestDay.totalRevenue
        },
        worstDay: {
          name: worstDay.dayName,
          revenue: worstDay.totalRevenue
        },
        bestDayByAverage: {
          name: bestDayByAvg.dayName,
          averageRevenue: bestDayByAvg.averageRevenuePerOpenDay
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get daily sales analytics with closures
// @route   GET /api/sales/analytics/daily
// @access  Public
const getDailySales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - (30 * 24 * 60 * 60 * 1000));
    start.setHours(0, 0, 0, 0);
    
    // Get all sales within the date range
    const sales = await Sale.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    // Get shop closures within the date range
    const closures = await ShopClosure.find({
      date: {
        $gte: start,
        $lte: end
      }
    });

    // Create a map of closures by date
    const closureMap = {};
    closures.forEach(closure => {
      const dateKey = new Date(closure.date).toISOString().split('T')[0];
      closureMap[dateKey] = {
        reason: closure.reason,
        description: closure.description,
        isFullDay: closure.isFullDay,
        closedHours: closure.closedHours
      };
    });

    // Group sales by date
    const dailyData = {};
    
    // Initialize all dates in range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        totalRevenue: 0,
        totalQuantity: 0,
        transactionCount: 0,
        isClosed: !!closureMap[dateKey],
        closureInfo: closureMap[dateKey] || null,
        dayOfWeek: currentDate.getDay(),
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add sales data
    sales.forEach(sale => {
      const dateKey = new Date(sale.date).toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].totalRevenue += sale.totalAmount || 0;
        dailyData[dateKey].totalQuantity += sale.quantity || 0;
        dailyData[dateKey].transactionCount += 1;
      }
    });
    
    // Convert to array and calculate additional metrics
    const dailyArray = Object.values(dailyData).map(day => {
      return {
        ...day,
        averagePerTransaction: day.transactionCount > 0 
          ? (day.totalRevenue / day.transactionCount).toFixed(2)
          : 0,
        formattedDate: new Date(day.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          weekday: 'short'
        })
      };
    });
    
    // Calculate statistics
    const openDays = dailyArray.filter(d => !d.isClosed);
    const closedDays = dailyArray.filter(d => d.isClosed);
    const totalRevenue = dailyArray.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalTransactions = dailyArray.reduce((sum, d) => sum + d.transactionCount, 0);
    
    // Find best and worst performing open days
    const openDaysWithRevenue = openDays.filter(d => d.totalRevenue > 0);
    const bestDay = openDaysWithRevenue.length > 0 
      ? openDaysWithRevenue.reduce((best, day) => day.totalRevenue > best.totalRevenue ? day : best)
      : null;
    const worstDay = openDaysWithRevenue.length > 0
      ? openDaysWithRevenue.reduce((worst, day) => day.totalRevenue < worst.totalRevenue ? day : worst)
      : null;
    
    // Calculate closure reasons breakdown
    const closureReasons = {};
    closedDays.forEach(day => {
      if (day.closureInfo) {
        const reason = day.closureInfo.reason;
        closureReasons[reason] = (closureReasons[reason] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      data: dailyArray,
      summary: {
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        totalDays: dailyArray.length,
        openDays: openDays.length,
        closedDays: closedDays.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTransactions,
        averageRevenuePerDay: dailyArray.length > 0 
          ? (totalRevenue / dailyArray.length).toFixed(2)
          : 0,
        averageRevenuePerOpenDay: openDays.length > 0 
          ? (totalRevenue / openDays.length).toFixed(2)
          : 0,
        bestDay: bestDay ? {
          date: bestDay.formattedDate,
          revenue: bestDay.totalRevenue,
          transactions: bestDay.transactionCount
        } : null,
        worstDay: worstDay ? {
          date: worstDay.formattedDate,
          revenue: worstDay.totalRevenue,
          transactions: worstDay.transactionCount
        } : null,
        closureReasons
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
  getDayOfWeekSales,
  getDailySales
};


