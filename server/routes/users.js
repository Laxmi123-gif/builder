const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'title image cuisine difficulty prepTime cookTime averageRating')
      .populate('cookingHistory.recipe', 'title image cuisine averageRating');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('preferences.dietaryRestrictions').optional().isArray(),
  body('preferences.cuisinePreferences').optional().isArray(),
  body('preferences.skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
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

    const { name, preferences, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('favorites', 'title image cuisine difficulty prepTime cookTime averageRating');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/favorites/:recipeId
// @desc    Add recipe to favorites
// @access  Private
router.post('/favorites/:recipeId', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.favorites.includes(req.params.recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Recipe already in favorites'
      });
    }

    user.favorites.push(req.params.recipeId);
    await user.save();

    res.json({
      success: true,
      message: 'Recipe added to favorites'
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/favorites/:recipeId
// @desc    Remove recipe from favorites
// @access  Private
router.delete('/favorites/:recipeId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.favorites.includes(req.params.recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Recipe not in favorites'
      });
    }

    user.favorites = user.favorites.filter(
      fav => fav.toString() !== req.params.recipeId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Recipe removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        options: {
          skip,
          limit,
          sort: { createdAt: -1 }
        },
        populate: {
          path: 'createdBy',
          select: 'name'
        }
      });

    const totalFavorites = await User.findById(req.user.id).select('favorites');
    const total = totalFavorites.favorites.length;

    res.json({
      success: true,
      data: user.favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/cooking-history
// @desc    Get user's cooking history
// @access  Private
router.get('/cooking-history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'cookingHistory.recipe',
        populate: {
          path: 'createdBy',
          select: 'name'
        }
      });

    // Sort cooking history by date (newest first) and paginate
    const sortedHistory = user.cookingHistory
      .sort((a, b) => new Date(b.cookedAt) - new Date(a.cookedAt))
      .slice(skip, skip + limit);

    const total = user.cookingHistory.length;

    res.json({
      success: true,
      data: sortedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get cooking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/cooking-history
// @desc    Add recipe to cooking history
// @access  Private
router.post('/cooking-history', protect, [
  body('recipeId').isMongoId().withMessage('Valid recipe ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('notes').optional().isString().trim()
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

    const { recipeId, rating, notes } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if recipe is already in cooking history
    const existingEntry = user.cookingHistory.find(
      entry => entry.recipe.toString() === recipeId
    );

    if (existingEntry) {
      // Update existing entry
      existingEntry.cookedAt = new Date();
      if (rating) existingEntry.rating = rating;
      if (notes) existingEntry.notes = notes;
    } else {
      // Add new entry
      user.cookingHistory.push({
        recipe: recipeId,
        rating,
        notes
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Cooking history updated successfully'
    });
  } catch (error) {
    console.error('Add cooking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/recommendations
// @desc    Get personalized recipe recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', '_id')
      .populate('cookingHistory.recipe', '_id cuisine');

    // Build recommendation criteria based on user data
    const criteria = {};
    
    // Exclude already favorited recipes
    if (user.favorites.length > 0) {
      criteria._id = { $nin: user.favorites.map(fav => fav._id) };
    }

    // Include dietary preferences
    if (user.preferences.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0) {
      criteria.dietaryInfo = { $in: user.preferences.dietaryRestrictions };
    }

    // Include cuisine preferences or popular cuisines from cooking history
    let preferredCuisines = user.preferences.cuisinePreferences || [];
    
    if (preferredCuisines.length === 0 && user.cookingHistory.length > 0) {
      // Extract cuisines from cooking history
      const historyCuisines = user.cookingHistory
        .map(entry => entry.recipe.cuisine)
        .filter(cuisine => cuisine);
      
      // Get most common cuisines
      const cuisineCount = {};
      historyCuisines.forEach(cuisine => {
        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
      });
      
      preferredCuisines = Object.keys(cuisineCount)
        .sort((a, b) => cuisineCount[b] - cuisineCount[a])
        .slice(0, 3);
    }

    if (preferredCuisines.length > 0) {
      criteria.cuisine = { $in: preferredCuisines };
    }

    // Match skill level
    if (user.preferences.skillLevel) {
      criteria.difficulty = user.preferences.skillLevel;
    }

    const recommendations = await Recipe.find({
      ...criteria,
      isPublished: true
    })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(12)
      .populate('createdBy', 'name')
      .select('-ratings -instructions');

    res.json({
      success: true,
      data: recommendations,
      message: `Found ${recommendations.length} personalized recommendations`
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;