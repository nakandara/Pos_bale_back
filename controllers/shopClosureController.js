const ShopClosure = require('../models/ShopClosure');

// @desc    Get all shop closures
// @route   GET /api/shop-closures
// @access  Public
const getShopClosures = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const closures = await ShopClosure.find(query).sort({ date: -1 });
    res.json(closures);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single shop closure
// @route   GET /api/shop-closures/:id
// @access  Public
const getShopClosureById = async (req, res) => {
  try {
    const closure = await ShopClosure.findById(req.params.id);
    
    if (!closure) {
      return res.status(404).json({ message: 'Shop closure not found' });
    }
    
    res.json(closure);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new shop closure
// @route   POST /api/shop-closures
// @access  Public
const createShopClosure = async (req, res) => {
  try {
    const { date, reason, description, isFullDay, closedHours } = req.body;

    // Validation
    if (!date || !reason) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: date, reason' 
      });
    }

    // Check if closure already exists for this date
    const existingClosure = await ShopClosure.findOne({ 
      date: new Date(date) 
    });
    
    if (existingClosure) {
      return res.status(400).json({ 
        message: 'Shop closure already exists for this date' 
      });
    }

    const closure = await ShopClosure.create({
      date: new Date(date),
      reason,
      description: description || '',
      isFullDay: isFullDay !== undefined ? isFullDay : true,
      closedHours: closedHours || 0
    });

    res.status(201).json(closure);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update shop closure
// @route   PUT /api/shop-closures/:id
// @access  Public
const updateShopClosure = async (req, res) => {
  try {
    const closure = await ShopClosure.findById(req.params.id);
    
    if (!closure) {
      return res.status(404).json({ message: 'Shop closure not found' });
    }

    const { date, reason, description, isFullDay, closedHours } = req.body;

    // Update fields if provided
    if (date) {
      // Check if another closure exists for the new date
      const existingClosure = await ShopClosure.findOne({ 
        date: new Date(date),
        _id: { $ne: req.params.id }
      });
      
      if (existingClosure) {
        return res.status(400).json({ 
          message: 'Shop closure already exists for this date' 
        });
      }
      
      closure.date = new Date(date);
    }
    if (reason) closure.reason = reason;
    if (description !== undefined) closure.description = description;
    if (isFullDay !== undefined) closure.isFullDay = isFullDay;
    if (closedHours !== undefined) closure.closedHours = closedHours;

    const updatedClosure = await closure.save();
    res.json(updatedClosure);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete shop closure
// @route   DELETE /api/shop-closures/:id
// @access  Public
const deleteShopClosure = async (req, res) => {
  try {
    const closure = await ShopClosure.findById(req.params.id);
    
    if (!closure) {
      return res.status(404).json({ message: 'Shop closure not found' });
    }

    await ShopClosure.deleteOne({ _id: req.params.id });
    res.json({ message: 'Shop closure deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get shop closure statistics
// @route   GET /api/shop-closures/stats
// @access  Public
const getShopClosureStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 3 months if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    const closures = await ShopClosure.find({
      date: {
        $gte: start,
        $lte: end
      }
    });
    
    // Group by reason
    const byReason = {};
    closures.forEach(closure => {
      if (!byReason[closure.reason]) {
        byReason[closure.reason] = 0;
      }
      byReason[closure.reason]++;
    });
    
    // Calculate total closed days
    const totalFullDays = closures.filter(c => c.isFullDay).length;
    const totalPartialDays = closures.filter(c => !c.isFullDay).length;
    
    res.json({
      success: true,
      data: {
        totalClosures: closures.length,
        totalFullDays,
        totalPartialDays,
        byReason,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getShopClosures,
  getShopClosureById,
  createShopClosure,
  updateShopClosure,
  deleteShopClosure,
  getShopClosureStats
};

