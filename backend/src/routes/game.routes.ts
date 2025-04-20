import express from 'express';
import * as gameController from '../controllers/game.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', gameController.getAllGames);
router.get('/search', gameController.searchGames);
router.get('/featured', gameController.getFeaturedGames);
router.get('/:id', gameController.getGame);

// Protected admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', gameController.createGame);
router.patch('/:id', gameController.updateGame);
router.delete('/:id', gameController.deleteGame);

export default router;