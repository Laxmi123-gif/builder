const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'oil', 'herb', 'condiment', 'other']
  },
  commonUnits: [{
    type: String,
    enum: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'bunch', 'can', 'package']
  }],
  substitutes: [{
    name: String,
    ratio: String, // e.g., "1:1", "2:1"
    notes: String
  }],
  nutritionPer100g: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  seasonality: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'year-round']
  }],
  storageInfo: {
    method: String, // e.g., "refrigerate", "room temperature"
    duration: String // e.g., "1 week", "3 months"
  },
  aliases: [String], // Alternative names
  isCommon: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Text search index
ingredientSchema.index({
  name: 'text',
  displayName: 'text',
  aliases: 'text'
});

module.exports = mongoose.model('Ingredient', ingredientSchema);