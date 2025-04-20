import { Request, Response, NextFunction } from 'express';
import Game from '../models/game.model';
import { AppError } from '../middleware/error.middleware';

// Get all games with filtering, sorting, and pagination
export const getAllGames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // Find games matching query
    let query = Game.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute query
    const games = await query;

    // Get total count for pagination
    const totalGames = await Game.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: games.length,
      totalGames,
      totalPages: Math.ceil(totalGames / limit),
      currentPage: page,
      data: {
        games,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single game by ID
export const getGame = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    // Increment view count
    game.viewCount += 1;
    await game.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        game,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new game (admin only)
export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newGame = await Game.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        game: newGame,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update game (admin only)
export const updateGame = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        game,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete game (admin only)
export const deleteGame = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Search games
export const searchGames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next(new AppError('Search query is required', 400));
    }

    // Use MongoDB text search
    const games = await Game.find(
      { $text: { $search: q as string } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.status(200).json({
      status: 'success',
      results: games.length,
      data: {
        games,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get featured games
export const getFeaturedGames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featuredGames = await Game.find({ featuredGame: true })
      .limit(6);

    res.status(200).json({
      status: 'success',
      results: featuredGames.length,
      data: {
        games: featuredGames,
      },
    });
  } catch (error) {
    next(error);
  }
};