const express = require('express');
const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  getFeaturedGames,
  getGamesOnSale,
  getGamesByCategory
} = require('../controllers/games');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getGames);
router.get('/featured', getFeaturedGames);
router.get('/sale', getGamesOnSale);
router.get('/category/:genreName', getGamesByCategory);
router.get('/:id', getGame);

// Protected admin routes
router.post('/', protect, authorize('admin'), createGame);
router.put('/:id', protect, authorize('admin'), updateGame);
router.delete('/:id', protect, authorize('admin'), deleteGame);

module.exports = router;