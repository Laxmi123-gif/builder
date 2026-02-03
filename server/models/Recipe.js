const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number, // grams
  carbs: Number,   // grams
  fat: Number,     // grams
  fiber: Number,   // grams
  sugar: Number,   // grams
  sodium: Number   // mg
});

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'oil', 'other'],
    default: 'other'
  },
  substitutes: [String] // Alternative ingredients
});

const instructionSchema = new mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  instruction: {
    type: String,
    required: true
  },
  duration: Number, // minutes
  temperature: String, // e.g., "350°F", "medium heat"
  tips: String
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  cuisine: {
    type: String,
    required: true,
    enum: ['Indian', 'Italian', 'Mexican', 'Chinese', 'American', 'Mediterranean', 'Thai', 'Desserts', 'Other']
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'beverage'],
    default: 'dinner'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  prepTime: {
    type: Number, // minutes
    required: true
  },
  cookTime: {
    type: Number, // minutes
    required: true
  },
  totalTime: {
    type: Number // auto-calculated
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  ingredients: [ingredientSchema],
  instructions: [instructionSchema],
  nutrition: nutritionSchema,
  tags: [String], // e.g., ['quick', 'healthy', 'one-pot']
  dietaryInfo: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo']
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total time before saving
recipeSchema.pre('save', function(next) {
  this.totalTime = this.prepTime + this.cookTime;
  next();
});

// Update average rating when ratings change
recipeSchema.methods.updateRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
};

// Text search index
recipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text'
});

// Compound indexes for efficient queries
recipeSchema.index({ cuisine: 1, difficulty: 1 });
recipeSchema.index({ averageRating: -1, totalRatings: -1 });
recipeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);