const Game = require('../models/Game');

// @desc    Get all games
// @route   GET /api/games
// @access  Public
exports.getGames = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Special handling for genre filter
    if (reqQuery.genre) {
      // Convert single value to array for consistent handling
      const genreFilter = Array.isArray(reqQuery.genre) ? reqQuery.genre : [reqQuery.genre];
      
      // Create a case-insensitive regex array for each genre
      const regexFilters = genreFilter.map(genre => 
        new RegExp('^' + genre + '$', 'i')
      );
      
      // Use MongoDB $in operator with regex for case-insensitive matching
      reqQuery.genre = { $in: regexFilters };
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Game.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Game.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const games = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: games.length,
      pagination,
      data: games
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Game not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new game
// @route   POST /api/games
// @access  Private/Admin
exports.createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);

    res.status(201).json({
      success: true,
      data: game
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private/Admin
exports.updateGame = async (req, res) => {
  try {
    let game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Game not found with id of ${req.params.id}`
      });
    }

    game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private/Admin
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Game not found with id of ${req.params.id}`
      });
    }

    await game.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get featured games
// @route   GET /api/games/featured
// @access  Public
exports.getFeaturedGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const games = await Game.find({ featured: true }).limit(limit);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get games on sale
// @route   GET /api/games/sale
// @access  Public
exports.getGamesOnSale = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const games = await Game.find({ onSale: true }).limit(limit);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get games by category (genre)
// @route   GET /api/games/category/:genreName
// @access  Public
exports.getGamesByCategory = async (req, res) => {
  try {
    const genre = req.params.genreName;
    // Use case-insensitive regex matching for consistency
    const games = await Game.find({ 
      genre: { $in: [new RegExp('^' + genre + '$', 'i')] } 
    });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Search games by title prefix for auto-suggestion
// @route   GET /api/games/search/suggestions
// @access  Public
exports.getGameSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Create case-insensitive regex for starting with the query string
    const regex = new RegExp(`^${query}`, 'i');
    
    // Find games with titles that match the regex
    // Return more results (up to 20) to support the expanded scrollable dropdown
    // Only return the necessary fields for the suggestions dropdown
    const games = await Game.find({ title: regex })
      .select('_id title thumbnail price discountPrice')
      .limit(20);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};