const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { matchRecipesByIngredients } = require('../utils/recipeMatching');

const router = express.Router();

// @route   GET /api/recipes
// @desc    Get all recipes with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('cuisine').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('maxTime').optional().isInt({ min: 1 }).withMessage('Max time must be positive'),
  query('dietary').optional().isString(),
  query('search').optional().isString()
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isPublished: true };

    if (req.query.cuisine) {
      filter.cuisine = req.query.cuisine;
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    if (req.query.maxTime) {
      filter.totalTime = { $lte: parseInt(req.query.maxTime) };
    }

    if (req.query.dietary) {
      filter.dietaryInfo = { $in: [req.query.dietary] };
    }

    // Text search
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = {};
    if (req.query.search) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    if (req.query.sortBy === 'rating') {
      sort = { averageRating: -1, totalRatings: -1 };
    } else if (req.query.sortBy === 'time') {
      sort = { totalTime: 1 };
    }

    const recipes = await Recipe.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .select('-ratings'); // Exclude individual ratings for performance

    const total = await Recipe.countDocuments(filter);

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/recipes/featured
// @desc    Get featured recipes (highest rated, most popular)
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredRecipes = await Recipe.find({ isPublished: true })
      .sort({ averageRating: -1, totalRatings: -1, views: -1 })
      .limit(6)
      .populate('createdBy', 'name')
      .select('-ratings -instructions');

    res.json({
      success: true,
      data: featuredRecipes
    });
  } catch (error) {
    console.error('Get featured recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/recipes/match
// @desc    Find recipes based on available ingredients
// @access  Public
router.post('/match', [
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('ingredients.*').isString().trim().isLength({ min: 1 }).withMessage('Each ingredient must be a non-empty string')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { ingredients, preferences = {} } = req.body;
    
    // Get user preferences if authenticated
    let userPreferences = {};
    if (req.user) {
      userPreferences = req.user.preferences || {};
    }

    // Merge user preferences with request preferences
    const finalPreferences = { ...userPreferences, ...preferences };

    const matchedRecipes = await matchRecipesByIngredients(ingredients, finalPreferences);

    res.json({
      success: true,
      data: matchedRecipes,
      message: `Found ${matchedRecipes.length} recipes matching your ingredients`
    });
  } catch (error) {
    console.error('Recipe matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during recipe matching'
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('ratings.user', 'name avatar');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    if (!recipe.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Increment view count
    recipe.views += 1;
    await recipe.save();

    // Check if user has favorited this recipe
    let isFavorited = false;
    if (req.user) {
      isFavorited = req.user.favorites.includes(recipe._id);
    }

    res.json({
      success: true,
      data: {
        ...recipe.toObject(),
        isFavorited
      }
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/recipes/:id/rate
// @desc    Rate a recipe
// @access  Private
router.post('/:id/rate', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, review } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check if user already rated this recipe
    const existingRatingIndex = recipe.ratings.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      recipe.ratings[existingRatingIndex].rating = rating;
      recipe.ratings[existingRatingIndex].review = review || '';
    } else {
      // Add new rating
      recipe.ratings.push({
        user: req.user.id,
        rating,
        review: review || ''
      });
    }

    // Update average rating
    recipe.updateRating();
    await recipe.save();

    // Add to user's cooking history if not already there
    const user = await User.findById(req.user.id);
    const existingHistory = user.cookingHistory.find(
      h => h.recipe.toString() === recipe._id.toString()
    );

    if (!existingHistory) {
      user.cookingHistory.push({
        recipe: recipe._id,
        rating,
        notes: review || ''
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        averageRating: recipe.averageRating,
        totalRatings: recipe.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/recipes/cuisine/:cuisine
// @desc    Get recipes by cuisine
// @access  Public
router.get('/cuisine/:cuisine', async (req, res) => {
  try {
    const { cuisine } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ 
      cuisine: new RegExp(cuisine, 'i'), 
      isPublished: true 
    })
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .select('-ratings');

    const total = await Recipe.countDocuments({ 
      cuisine: new RegExp(cuisine, 'i'), 
      isPublished: true 
    });

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get recipes by cuisine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;