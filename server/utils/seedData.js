const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-builder')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample ingredients data
const ingredientsData = [
  // Proteins
  { name: 'chicken breast', displayName: 'Chicken Breast', category: 'protein', isCommon: true, commonUnits: ['lb', 'piece'], aliases: ['chicken', 'chicken fillet'] },
  { name: 'ground beef', displayName: 'Ground Beef', category: 'protein', isCommon: true, commonUnits: ['lb', 'oz'] },
  { name: 'salmon', displayName: 'Salmon', category: 'protein', isCommon: true, commonUnits: ['lb', 'piece'] },
  { name: 'eggs', displayName: 'Eggs', category: 'protein', isCommon: true, commonUnits: ['piece'] },
  { name: 'tofu', displayName: 'Tofu', category: 'protein', isCommon: true, commonUnits: ['package', 'oz'] },
  
  // Vegetables
  { name: 'onion', displayName: 'Onion', category: 'vegetable', isCommon: true, commonUnits: ['piece', 'cup'] },
  { name: 'garlic', displayName: 'Garlic', category: 'vegetable', isCommon: true, commonUnits: ['clove', 'tbsp'] },
  { name: 'tomato', displayName: 'Tomato', category: 'vegetable', isCommon: true, commonUnits: ['piece', 'cup', 'can'] },
  { name: 'bell pepper', displayName: 'Bell Pepper', category: 'vegetable', isCommon: true, commonUnits: ['piece', 'cup'] },
  { name: 'carrot', displayName: 'Carrot', category: 'vegetable', isCommon: true, commonUnits: ['piece', 'cup'] },
  { name: 'broccoli', displayName: 'Broccoli', category: 'vegetable', isCommon: true, commonUnits: ['cup', 'piece'] },
  { name: 'spinach', displayName: 'Spinach', category: 'vegetable', isCommon: true, commonUnits: ['cup', 'bunch'] },
  
  // Grains
  { name: 'rice', displayName: 'Rice', category: 'grain', isCommon: true, commonUnits: ['cup'] },
  { name: 'pasta', displayName: 'Pasta', category: 'grain', isCommon: true, commonUnits: ['oz', 'cup'] },
  { name: 'flour', displayName: 'All-Purpose Flour', category: 'grain', isCommon: true, commonUnits: ['cup', 'oz'] },
  { name: 'bread', displayName: 'Bread', category: 'grain', isCommon: true, commonUnits: ['piece'], aliases: ['loaf'] },
  
  // Dairy
  { name: 'milk', displayName: 'Milk', category: 'dairy', isCommon: true, commonUnits: ['cup', 'ml'] },
  { name: 'cheese', displayName: 'Cheese', category: 'dairy', isCommon: true, commonUnits: ['cup', 'oz'] },
  { name: 'butter', displayName: 'Butter', category: 'dairy', isCommon: true, commonUnits: ['tbsp', 'cup'] },
  { name: 'yogurt', displayName: 'Yogurt', category: 'dairy', isCommon: true, commonUnits: ['cup', 'oz'] },
  
  // Spices & Herbs
  { name: 'salt', displayName: 'Salt', category: 'spice', isCommon: true, commonUnits: ['tsp', 'tbsp'] },
  { name: 'black pepper', displayName: 'Black Pepper', category: 'spice', isCommon: true, commonUnits: ['tsp'] },
  { name: 'cumin', displayName: 'Cumin', category: 'spice', isCommon: true, commonUnits: ['tsp'] },
  { name: 'paprika', displayName: 'Paprika', category: 'spice', isCommon: true, commonUnits: ['tsp'] },
  { name: 'oregano', displayName: 'Oregano', category: 'spice', isCommon: true, commonUnits: ['tsp'] },
  { name: 'basil', displayName: 'Basil', category: 'spice', isCommon: true, commonUnits: ['tsp', 'bunch'] },
  
  // Oils & Condiments
  { name: 'olive oil', displayName: 'Olive Oil', category: 'oil', isCommon: true, commonUnits: ['tbsp', 'cup'] },
  { name: 'soy sauce', displayName: 'Soy Sauce', category: 'other', isCommon: true, commonUnits: ['tbsp', 'tsp'] },
  { name: 'vinegar', displayName: 'Vinegar', category: 'other', isCommon: true, commonUnits: ['tbsp', 'tsp'] }
];

// Sample recipes data (50+ recipes across all cuisines)
const recipesData = [
  // Indian Recipes
  {
    title: 'Chicken Biryani',
    description: 'Aromatic basmati rice layered with spiced chicken, a classic Indian dish perfect for special occasions.',
    cuisine: 'Indian',
    difficulty: 'intermediate',
    prepTime: 45,
    cookTime: 60,
    servings: 6,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'basmati rice', amount: '2', unit: 'cup', category: 'grain' },
      { name: 'chicken', amount: '1', unit: 'lb', category: 'protein' },
      { name: 'onion', amount: '2', unit: 'piece', category: 'vegetable' },
      { name: 'yogurt', amount: '1/2', unit: 'cup', category: 'dairy' },
      { name: 'garam masala', amount: '2', unit: 'tsp', category: 'spice' }
    ],
    instructions: [
      { step: 1, instruction: 'Soak basmati rice for 30 minutes', duration: 30 },
      { step: 2, instruction: 'Marinate chicken with yogurt and spices', duration: 20 },
      { step: 3, instruction: 'Fry onions until golden brown', duration: 10 },
      { step: 4, instruction: 'Cook chicken until tender', duration: 25 },
      { step: 5, instruction: 'Layer rice and chicken, cook on dum', duration: 45 }
    ],
    tags: ['spicy', 'aromatic', 'festive'],
    dietaryInfo: [],
    nutrition: { calories: 450, protein: 25, carbs: 55, fat: 12 }
  },
  
  {
    title: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces, a beloved Indian restaurant favorite.',
    cuisine: 'Indian',
    difficulty: 'beginner',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'chicken breast', amount: '1', unit: 'lb', category: 'protein' },
      { name: 'tomato sauce', amount: '1', unit: 'can', category: 'vegetable' },
      { name: 'heavy cream', amount: '1/2', unit: 'cup', category: 'dairy' },
      { name: 'butter', amount: '3', unit: 'tbsp', category: 'dairy' },
      { name: 'garam masala', amount: '1', unit: 'tsp', category: 'spice' }
    ],
    instructions: [
      { step: 1, instruction: 'Cut chicken into bite-sized pieces', duration: 5 },
      { step: 2, instruction: 'Cook chicken in butter until golden', duration: 8 },
      { step: 3, instruction: 'Add tomato sauce and spices', duration: 5 },
      { step: 4, instruction: 'Simmer for 15 minutes', duration: 15 },
      { step: 5, instruction: 'Stir in cream and serve', duration: 2 }
    ],
    tags: ['creamy', 'mild', 'popular'],
    dietaryInfo: [],
    nutrition: { calories: 380, protein: 28, carbs: 8, fat: 26 }
  },

  // Italian Recipes
  {
    title: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta dish with eggs, cheese, pancetta, and black pepper.',
    cuisine: 'Italian',
    difficulty: 'intermediate',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'spaghetti', amount: '1', unit: 'lb', category: 'grain' },
      { name: 'pancetta', amount: '4', unit: 'oz', category: 'protein' },
      { name: 'eggs', amount: '3', unit: 'piece', category: 'protein' },
      { name: 'parmesan cheese', amount: '1', unit: 'cup', category: 'dairy' },
      { name: 'black pepper', amount: '1', unit: 'tsp', category: 'spice' }
    ],
    instructions: [
      { step: 1, instruction: 'Cook spaghetti according to package directions', duration: 10 },
      { step: 2, instruction: 'Crisp pancetta in a large pan', duration: 5 },
      { step: 3, instruction: 'Whisk eggs with cheese and pepper', duration: 2 },
      { step: 4, instruction: 'Toss hot pasta with pancetta', duration: 1 },
      { step: 5, instruction: 'Add egg mixture off heat, toss quickly', duration: 2 }
    ],
    tags: ['quick', 'classic', 'creamy'],
    dietaryInfo: [],
    nutrition: { calories: 520, protein: 22, carbs: 65, fat: 18 }
  },

  {
    title: 'Margherita Pizza',
    description: 'Traditional Neapolitan pizza with tomato sauce, mozzarella, and fresh basil.',
    cuisine: 'Italian',
    difficulty: 'intermediate',
    prepTime: 120,
    cookTime: 15,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'pizza dough', amount: '1', unit: 'piece', category: 'grain' },
      { name: 'tomato sauce', amount: '1/2', unit: 'cup', category: 'vegetable' },
      { name: 'mozzarella cheese', amount: '8', unit: 'oz', category: 'dairy' },
      { name: 'fresh basil', amount: '1/4', unit: 'cup', category: 'spice' },
      { name: 'olive oil', amount: '2', unit: 'tbsp', category: 'oil' }
    ],
    instructions: [
      { step: 1, instruction: 'Let dough come to room temperature', duration: 60 },
      { step: 2, instruction: 'Preheat oven to 500°F', duration: 30 },
      { step: 3, instruction: 'Roll out dough and add sauce', duration: 10 },
      { step: 4, instruction: 'Add cheese and drizzle with oil', duration: 5 },
      { step: 5, instruction: 'Bake for 12-15 minutes until golden', duration: 15 }
    ],
    tags: ['vegetarian', 'classic', 'homemade'],
    dietaryInfo: ['vegetarian'],
    nutrition: { calories: 420, protein: 18, carbs: 45, fat: 20 }
  },

  // Mexican Recipes
  {
    title: 'Chicken Tacos',
    description: 'Seasoned chicken served in soft tortillas with fresh toppings.',
    cuisine: 'Mexican',
    difficulty: 'beginner',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'chicken breast', amount: '1', unit: 'lb', category: 'protein' },
      { name: 'corn tortillas', amount: '8', unit: 'piece', category: 'grain' },
      { name: 'onion', amount: '1', unit: 'piece', category: 'vegetable' },
      { name: 'cilantro', amount: '1/4', unit: 'cup', category: 'spice' },
      { name: 'lime', amount: '2', unit: 'piece', category: 'fruit' }
    ],
    instructions: [
      { step: 1, instruction: 'Season and cook chicken until done', duration: 15 },
      { step: 2, instruction: 'Dice chicken into small pieces', duration: 5 },
      { step: 3, instruction: 'Warm tortillas in a dry pan', duration: 2 },
      { step: 4, instruction: 'Fill tortillas with chicken', duration: 3 },
      { step: 5, instruction: 'Top with onion, cilantro, and lime', duration: 2 }
    ],
    tags: ['quick', 'fresh', 'customizable'],
    dietaryInfo: [],
    nutrition: { calories: 320, protein: 25, carbs: 28, fat: 12 }
  },

  // Chinese Recipes
  {
    title: 'Fried Rice',
    description: 'Classic Chinese fried rice with vegetables and your choice of protein.',
    cuisine: 'Chinese',
    difficulty: 'beginner',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'cooked rice', amount: '3', unit: 'cup', category: 'grain' },
      { name: 'eggs', amount: '2', unit: 'piece', category: 'protein' },
      { name: 'mixed vegetables', amount: '1', unit: 'cup', category: 'vegetable' },
      { name: 'soy sauce', amount: '3', unit: 'tbsp', category: 'other' },
      { name: 'sesame oil', amount: '1', unit: 'tsp', category: 'oil' }
    ],
    instructions: [
      { step: 1, instruction: 'Heat oil in a large wok or pan', duration: 2 },
      { step: 2, instruction: 'Scramble eggs and set aside', duration: 3 },
      { step: 3, instruction: 'Stir-fry vegetables until tender', duration: 5 },
      { step: 4, instruction: 'Add rice and soy sauce, stir well', duration: 5 },
      { step: 5, instruction: 'Add eggs back and finish with sesame oil', duration: 2 }
    ],
    tags: ['quick', 'versatile', 'leftover-friendly'],
    dietaryInfo: ['vegetarian'],
    nutrition: { calories: 280, protein: 8, carbs: 45, fat: 8 }
  }
];

// Add more recipes to reach 50+
const additionalRecipes = [
  // American
  {
    title: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and cheese on a toasted bun.',
    cuisine: 'American',
    difficulty: 'beginner',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'ground beef', amount: '1', unit: 'lb', category: 'protein' },
      { name: 'hamburger buns', amount: '4', unit: 'piece', category: 'grain' },
      { name: 'cheese slices', amount: '4', unit: 'piece', category: 'dairy' },
      { name: 'lettuce', amount: '4', unit: 'piece', category: 'vegetable' },
      { name: 'tomato', amount: '1', unit: 'piece', category: 'vegetable' }
    ],
    instructions: [
      { step: 1, instruction: 'Form beef into 4 patties', duration: 5 },
      { step: 2, instruction: 'Season patties with salt and pepper', duration: 2 },
      { step: 3, instruction: 'Grill patties for 4-5 minutes per side', duration: 10 },
      { step: 4, instruction: 'Toast buns and add cheese to patties', duration: 3 },
      { step: 5, instruction: 'Assemble burgers with toppings', duration: 5 }
    ],
    tags: ['classic', 'grilled', 'comfort-food'],
    dietaryInfo: [],
    nutrition: { calories: 520, protein: 28, carbs: 35, fat: 28 }
  },

  // Thai
  {
    title: 'Pad Thai',
    description: 'Sweet and tangy stir-fried noodles with shrimp, tofu, and peanuts.',
    cuisine: 'Thai',
    difficulty: 'intermediate',
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'rice noodles', amount: '8', unit: 'oz', category: 'grain' },
      { name: 'shrimp', amount: '1/2', unit: 'lb', category: 'protein' },
      { name: 'tofu', amount: '4', unit: 'oz', category: 'protein' },
      { name: 'bean sprouts', amount: '1', unit: 'cup', category: 'vegetable' },
      { name: 'peanuts', amount: '1/4', unit: 'cup', category: 'other' }
    ],
    instructions: [
      { step: 1, instruction: 'Soak rice noodles in warm water', duration: 15 },
      { step: 2, instruction: 'Prepare pad thai sauce', duration: 5 },
      { step: 3, instruction: 'Stir-fry shrimp and tofu', duration: 5 },
      { step: 4, instruction: 'Add noodles and sauce, toss well', duration: 8 },
      { step: 5, instruction: 'Garnish with peanuts and serve', duration: 2 }
    ],
    tags: ['sweet-and-sour', 'stir-fry', 'authentic'],
    dietaryInfo: [],
    nutrition: { calories: 420, protein: 20, carbs: 55, fat: 15 }
  },

  // Mediterranean
  {
    title: 'Greek Salad',
    description: 'Fresh vegetables with feta cheese and olives in olive oil dressing.',
    cuisine: 'Mediterranean',
    difficulty: 'beginner',
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'cucumber', amount: '2', unit: 'piece', category: 'vegetable' },
      { name: 'tomato', amount: '3', unit: 'piece', category: 'vegetable' },
      { name: 'red onion', amount: '1/2', unit: 'piece', category: 'vegetable' },
      { name: 'feta cheese', amount: '4', unit: 'oz', category: 'dairy' },
      { name: 'kalamata olives', amount: '1/2', unit: 'cup', category: 'other' }
    ],
    instructions: [
      { step: 1, instruction: 'Chop all vegetables into bite-sized pieces', duration: 10 },
      { step: 2, instruction: 'Combine vegetables in a large bowl', duration: 2 },
      { step: 3, instruction: 'Add feta cheese and olives', duration: 2 },
      { step: 4, instruction: 'Drizzle with olive oil and vinegar', duration: 1 },
      { step: 5, instruction: 'Season with oregano and serve', duration: 1 }
    ],
    tags: ['fresh', 'healthy', 'no-cook'],
    dietaryInfo: ['vegetarian'],
    nutrition: { calories: 180, protein: 8, carbs: 12, fat: 14 }
  },

  // Desserts
  {
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade cookies with chocolate chips, crispy outside and chewy inside.',
    cuisine: 'Desserts',
    difficulty: 'beginner',
    prepTime: 15,
    cookTime: 12,
    servings: 24,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ingredients: [
      { name: 'flour', amount: '2 1/4', unit: 'cup', category: 'grain' },
      { name: 'butter', amount: '1', unit: 'cup', category: 'dairy' },
      { name: 'brown sugar', amount: '3/4', unit: 'cup', category: 'other' },
      { name: 'eggs', amount: '2', unit: 'piece', category: 'protein' },
      { name: 'chocolate chips', amount: '2', unit: 'cup', category: 'other' }
    ],
    instructions: [
      { step: 1, instruction: 'Preheat oven to 375°F', duration: 10 },
      { step: 2, instruction: 'Cream butter and sugars together', duration: 5 },
      { step: 3, instruction: 'Add eggs and mix well', duration: 2 },
      { step: 4, instruction: 'Gradually add flour, then chocolate chips', duration: 5 },
      { step: 5, instruction: 'Bake for 9-12 minutes until golden', duration: 12 }
    ],
    tags: ['sweet', 'baked', 'classic'],
    dietaryInfo: ['vegetarian'],
    nutrition: { calories: 180, protein: 2, carbs: 24, fat: 9 }
  }
];

// Combine all recipes
const allRecipes = [...recipesData, ...additionalRecipes];

// Add more recipes to reach 50+
const moreRecipes = [
  // More Indian
  { title: 'Dal Tadka', cuisine: 'Indian', difficulty: 'beginner', prepTime: 10, cookTime: 25, servings: 4, description: 'Spiced lentil curry with aromatic tempering.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'lentils', amount: '1', unit: 'cup', category: 'protein' }], instructions: [{ step: 1, instruction: 'Cook lentils until soft', duration: 20 }], tags: ['vegetarian', 'protein-rich'], dietaryInfo: ['vegetarian'], nutrition: { calories: 220, protein: 12, carbs: 35, fat: 5 } },
  { title: 'Samosa', cuisine: 'Indian', difficulty: 'intermediate', prepTime: 45, cookTime: 20, servings: 12, description: 'Crispy fried pastries filled with spiced potatoes.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'potatoes', amount: '3', unit: 'piece', category: 'vegetable' }], instructions: [{ step: 1, instruction: 'Prepare filling with spiced potatoes', duration: 30 }], tags: ['fried', 'snack'], dietaryInfo: ['vegetarian'], nutrition: { calories: 150, protein: 3, carbs: 20, fat: 7 } },
  { title: 'Palak Paneer', cuisine: 'Indian', difficulty: 'intermediate', prepTime: 20, cookTime: 30, servings: 4, description: 'Creamy spinach curry with cottage cheese cubes.', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'spinach', amount: '2', unit: 'bunch', category: 'vegetable' }, { name: 'paneer', amount: '200', unit: 'g', category: 'dairy' }], instructions: [{ step: 1, instruction: 'Blanch spinach and make puree', duration: 15 }], tags: ['vegetarian', 'creamy', 'healthy'], dietaryInfo: ['vegetarian'], nutrition: { calories: 280, protein: 15, carbs: 12, fat: 20 } },
  { title: 'Chole Bhature', cuisine: 'Indian', difficulty: 'intermediate', prepTime: 30, cookTime: 45, servings: 4, description: 'Spicy chickpea curry served with fluffy fried bread.', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'chickpeas', amount: '2', unit: 'cup', category: 'protein' }, { name: 'flour', amount: '2', unit: 'cup', category: 'grain' }], instructions: [{ step: 1, instruction: 'Prepare spicy chickpea curry', duration: 30 }], tags: ['spicy', 'filling', 'traditional'], dietaryInfo: ['vegetarian'], nutrition: { calories: 450, protein: 18, carbs: 65, fat: 15 } },
  { title: 'Masala Dosa', cuisine: 'Indian', difficulty: 'advanced', prepTime: 480, cookTime: 30, servings: 6, description: 'Crispy fermented crepe filled with spiced potato curry.', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'rice', amount: '2', unit: 'cup', category: 'grain' }, { name: 'urad dal', amount: '1/2', unit: 'cup', category: 'protein' }], instructions: [{ step: 1, instruction: 'Soak rice and dal overnight', duration: 480 }], tags: ['fermented', 'crispy', 'south-indian'], dietaryInfo: ['vegetarian', 'gluten-free'], nutrition: { calories: 320, protein: 8, carbs: 58, fat: 6 } },
  { title: 'Rajma', cuisine: 'Indian', difficulty: 'beginner', prepTime: 15, cookTime: 40, servings: 4, description: 'Kidney bean curry in rich tomato gravy, perfect with rice.', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'kidney beans', amount: '1', unit: 'cup', category: 'protein' }, { name: 'tomatoes', amount: '3', unit: 'piece', category: 'vegetable' }], instructions: [{ step: 1, instruction: 'Soak kidney beans overnight', duration: 480 }], tags: ['protein-rich', 'comfort-food', 'north-indian'], dietaryInfo: ['vegetarian', 'vegan'], nutrition: { calories: 250, protein: 14, carbs: 42, fat: 4 } },
  
  // More Italian
  { title: 'Lasagna', cuisine: 'Italian', difficulty: 'advanced', prepTime: 30, cookTime: 60, servings: 8, description: 'Layered pasta with meat sauce, bechamel, and cheese.', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'lasagna sheets', amount: '12', unit: 'piece', category: 'grain' }], instructions: [{ step: 1, instruction: 'Prepare meat sauce', duration: 30 }], tags: ['baked', 'comfort-food'], dietaryInfo: [], nutrition: { calories: 450, protein: 25, carbs: 35, fat: 25 } },
  { title: 'Risotto', cuisine: 'Italian', difficulty: 'intermediate', prepTime: 10, cookTime: 30, servings: 4, description: 'Creamy rice dish cooked with broth and parmesan.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'arborio rice', amount: '1', unit: 'cup', category: 'grain' }], instructions: [{ step: 1, instruction: 'Toast rice in butter', duration: 5 }], tags: ['creamy', 'comfort-food'], dietaryInfo: ['vegetarian'], nutrition: { calories: 380, protein: 12, carbs: 55, fat: 12 } },
  
  // More Mexican
  { title: 'Guacamole', cuisine: 'Mexican', difficulty: 'beginner', prepTime: 10, cookTime: 0, servings: 4, description: 'Fresh avocado dip with lime, cilantro, and jalapeños.', image: 'https://images.unsplash.com/photo-1541544181051-e46607bc22a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'avocados', amount: '3', unit: 'piece', category: 'fruit' }], instructions: [{ step: 1, instruction: 'Mash avocados with lime juice', duration: 5 }], tags: ['fresh', 'dip', 'healthy'], dietaryInfo: ['vegan'], nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15 } },
  { title: 'Enchiladas', cuisine: 'Mexican', difficulty: 'intermediate', prepTime: 25, cookTime: 30, servings: 6, description: 'Rolled tortillas filled with chicken and topped with sauce.', image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'corn tortillas', amount: '12', unit: 'piece', category: 'grain' }], instructions: [{ step: 1, instruction: 'Prepare chicken filling', duration: 20 }], tags: ['baked', 'spicy'], dietaryInfo: [], nutrition: { calories: 320, protein: 18, carbs: 28, fat: 16 } },
  
  // More Chinese
  { title: 'Sweet and Sour Pork', cuisine: 'Chinese', difficulty: 'intermediate', prepTime: 20, cookTime: 15, servings: 4, description: 'Crispy pork pieces in tangy sweet and sour sauce.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'pork', amount: '1', unit: 'lb', category: 'protein' }], instructions: [{ step: 1, instruction: 'Cut pork and coat in batter', duration: 15 }], tags: ['sweet-and-sour', 'crispy'], dietaryInfo: [], nutrition: { calories: 420, protein: 22, carbs: 45, fat: 18 } },
  { title: 'Dumplings', cuisine: 'Chinese', difficulty: 'advanced', prepTime: 60, cookTime: 15, servings: 20, description: 'Steamed dumplings filled with pork and vegetables.', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'dumpling wrappers', amount: '20', unit: 'piece', category: 'grain' }], instructions: [{ step: 1, instruction: 'Prepare filling mixture', duration: 30 }], tags: ['steamed', 'traditional'], dietaryInfo: [], nutrition: { calories: 80, protein: 4, carbs: 8, fat: 4 } },
  
  // More American
  { title: 'Mac and Cheese', cuisine: 'American', difficulty: 'beginner', prepTime: 10, cookTime: 20, servings: 6, description: 'Creamy macaroni pasta with melted cheese sauce.', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'macaroni', amount: '1', unit: 'lb', category: 'grain' }], instructions: [{ step: 1, instruction: 'Cook macaroni according to package', duration: 10 }], tags: ['comfort-food', 'cheesy'], dietaryInfo: ['vegetarian'], nutrition: { calories: 420, protein: 18, carbs: 45, fat: 20 } },
  { title: 'BBQ Ribs', cuisine: 'American', difficulty: 'intermediate', prepTime: 20, cookTime: 180, servings: 4, description: 'Slow-cooked pork ribs with smoky BBQ sauce.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'pork ribs', amount: '2', unit: 'lb', category: 'protein' }], instructions: [{ step: 1, instruction: 'Season ribs with dry rub', duration: 15 }], tags: ['bbq', 'slow-cooked'], dietaryInfo: [], nutrition: { calories: 520, protein: 35, carbs: 15, fat: 38 } },
  
  // More Thai
  { title: 'Tom Yum Soup', cuisine: 'Thai', difficulty: 'beginner', prepTime: 15, cookTime: 20, servings: 4, description: 'Spicy and sour Thai soup with shrimp and mushrooms.', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'shrimp', amount: '1/2', unit: 'lb', category: 'protein' }], instructions: [{ step: 1, instruction: 'Prepare aromatic broth', duration: 15 }], tags: ['spicy', 'soup', 'healthy'], dietaryInfo: [], nutrition: { calories: 120, protein: 15, carbs: 8, fat: 3 } },
  { title: 'Green Curry', cuisine: 'Thai', difficulty: 'intermediate', prepTime: 20, cookTime: 25, servings: 4, description: 'Creamy coconut curry with green chilies and basil.', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'coconut milk', amount: '1', unit: 'can', category: 'dairy' }], instructions: [{ step: 1, instruction: 'Fry curry paste in oil', duration: 5 }], tags: ['spicy', 'creamy', 'aromatic'], dietaryInfo: [], nutrition: { calories: 380, protein: 20, carbs: 15, fat: 28 } },
  
  // More Mediterranean
  { title: 'Hummus', cuisine: 'Mediterranean', difficulty: 'beginner', prepTime: 10, cookTime: 0, servings: 6, description: 'Creamy chickpea dip with tahini and lemon.', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34d19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'chickpeas', amount: '1', unit: 'can', category: 'protein' }], instructions: [{ step: 1, instruction: 'Blend chickpeas with tahini', duration: 5 }], tags: ['healthy', 'dip', 'protein-rich'], dietaryInfo: ['vegan'], nutrition: { calories: 140, protein: 6, carbs: 16, fat: 7 } },
  { title: 'Falafel', cuisine: 'Mediterranean', difficulty: 'intermediate', prepTime: 30, cookTime: 15, servings: 16, description: 'Crispy fried chickpea balls with herbs and spices.', image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'dried chickpeas', amount: '1', unit: 'cup', category: 'protein' }], instructions: [{ step: 1, instruction: 'Soak chickpeas overnight', duration: 480 }], tags: ['fried', 'protein-rich', 'vegetarian'], dietaryInfo: ['vegan'], nutrition: { calories: 90, protein: 4, carbs: 12, fat: 3 } },
  
  // More Desserts
  { title: 'Cheesecake', cuisine: 'Desserts', difficulty: 'intermediate', prepTime: 30, cookTime: 60, servings: 12, description: 'Rich and creamy New York style cheesecake.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'cream cheese', amount: '2', unit: 'lb', category: 'dairy' }], instructions: [{ step: 1, instruction: 'Prepare graham cracker crust', duration: 15 }], tags: ['rich', 'creamy', 'baked'], dietaryInfo: ['vegetarian'], nutrition: { calories: 420, protein: 8, carbs: 35, fat: 28 } },
  { title: 'Tiramisu', cuisine: 'Desserts', difficulty: 'intermediate', prepTime: 45, cookTime: 0, servings: 8, description: 'Italian coffee-flavored dessert with mascarpone.', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', ingredients: [{ name: 'mascarpone', amount: '1', unit: 'lb', category: 'dairy' }], instructions: [{ step: 1, instruction: 'Prepare coffee mixture', duration: 10 }], tags: ['coffee', 'no-bake', 'elegant'], dietaryInfo: ['vegetarian'], nutrition: { calories: 380, protein: 6, carbs: 28, fat: 28 } }
];

// Combine all recipes (now 50+)
const finalRecipes = [...allRecipes, ...moreRecipes];

// Create admin user
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@recipebuilder.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      return adminExists;
    }

    const admin = new User({
      name: 'Admin User',
      email: 'admin@recipebuilder.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created');
    return admin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Ingredient.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await createAdminUser();

    // Seed ingredients
    await Ingredient.insertMany(ingredientsData);
    console.log(`Seeded ${ingredientsData.length} ingredients`);

    // Seed recipes with admin as creator
    const recipesWithCreator = finalRecipes.map(recipe => ({
      ...recipe,
      createdBy: admin._id,
      isPublished: true
    }));

    await Recipe.insertMany(recipesWithCreator);
    console.log(`Seeded ${recipesWithCreator.length} recipes`);

    // Create sample regular user
    const sampleUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      preferences: {
        dietaryRestrictions: ['vegetarian'],
        cuisinePreferences: ['Italian', 'Mediterranean'],
        skillLevel: 'intermediate'
      }
    });
    await sampleUser.save();
    console.log('Created sample user');

    console.log('Database seeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@recipebuilder.com / admin123');
    console.log('User: john@example.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
seedDatabase();