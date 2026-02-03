const express = require('express');
const { body, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalRecipes,
      totalIngredients,
      publishedRecipes,
      activeUsers,
      recentUsers,
      topRatedRecipes,
      popularCuisines
    ] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Ingredient.countDocuments(),
      Recipe.countDocuments({ isPublished: true }),
      User.countDocuments({ isActive: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Recipe.find({ isPublished: true }).sort({ averageRating: -1, totalRatings: -1 }).limit(5).select('title averageRating totalRatings cuisine'),
      Recipe.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$cuisine', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const stats = {
      totalUsers,
      totalRecipes,
      totalIngredients,
      publishedRecipes,
      activeUsers,
      unpublishedRecipes: totalRecipes - publishedRecipes,
      inactiveUsers: totalUsers - activeUsers
    };

    res.json({
      success: true,
      data: {
        stats,
        recentUsers,
        topRatedRecipes,
        popularCuisines
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (activate/deactivate, change role)
// @access  Private/Admin
router.put('/users/:id', [
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['user', 'admin'])
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

    const { isActive, role } = req.body;
    const updateData = {};

    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/recipes
// @desc    Get all recipes for admin management
// @access  Private/Admin
router.get('/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status; // 'published', 'unpublished', or undefined for all

    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'unpublished') {
      filter.isPublished = false;
    }

    const recipes = await Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .select('-ratings');

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
    console.error('Get admin recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/recipes
// @desc    Create new recipe
// @access  Private/Admin
router.post('/recipes', [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('cuisine').isIn(['Indian', 'Italian', 'Mexican', 'Chinese', 'American', 'Mediterranean', 'Thai', 'Desserts', 'Other']),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  body('prepTime').isInt({ min: 1 }).withMessage('Prep time must be positive'),
  body('cookTime').isInt({ min: 1 }).withMessage('Cook time must be positive'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be positive'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required')
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

    const recipeData = {
      ...req.body,
      createdBy: req.user.id
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: populatedRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/recipes/:id
// @desc    Update recipe
// @access  Private/Admin
router.put('/recipes/:id', [
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('cuisine').optional().isIn(['Indian', 'Italian', 'Mexican', 'Chinese', 'American', 'Mediterranean', 'Thai', 'Desserts', 'Other']),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('prepTime').optional().isInt({ min: 1 }),
  body('cookTime').optional().isInt({ min: 1 }),
  body('servings').optional().isInt({ min: 1 }),
  body('isPublished').optional().isBoolean()
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

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/recipes/:id
// @desc    Delete recipe
// @access  Private/Admin
router.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Remove recipe from all users' favorites and cooking history
    await User.updateMany(
      { favorites: recipe._id },
      { $pull: { favorites: recipe._id } }
    );

    await User.updateMany(
      { 'cookingHistory.recipe': recipe._id },
      { $pull: { cookingHistory: { recipe: recipe._id } } }
    );

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/ingredients
// @desc    Get all ingredients
// @access  Private/Admin
router.get('/ingredients', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }

    const ingredients = await Ingredient.find(filter)
      .sort({ isCommon: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Ingredient.countDocuments(filter);

    res.json({
      success: true,
      data: ingredients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/ingredients
// @desc    Create new ingredient
// @access  Private/Admin
router.post('/ingredients', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('displayName').trim().isLength({ min: 1 }).withMessage('Display name is required'),
  body('category').isIn(['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'oil', 'herb', 'condiment', 'other'])
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

    const ingredient = new Ingredient(req.body);
    await ingredient.save();

    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      data: ingredient
    });
  } catch (error) {
    console.error('Create ingredient error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/recipes/bulk-import
// @desc    Bulk import recipes
// @access  Private/Admin
router.post('/recipes/bulk-import', [
  body('recipes').isArray({ min: 1 }).withMessage('Recipes array is required')
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

    const { recipes } = req.body;
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const recipeData of recipes) {
      try {
        const recipe = new Recipe({
          ...recipeData,
          createdBy: req.user.id
        });
        await recipe.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          recipe: recipeData.title || 'Unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed. ${results.success} recipes imported, ${results.failed} failed.`,
      data: results
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk import'
    });
  }
});

module.exports = router;