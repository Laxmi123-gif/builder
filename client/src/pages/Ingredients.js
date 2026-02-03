import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiX, 
  FiSearch, 
  FiUser, 
  FiArrowRight,
  FiFilter,
  FiRefreshCw,
  FiStar
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RecipeCard from '../components/recipes/RecipeCard';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchingRecipes, setSearchingRecipes] = useState(false);
  const [preferences, setPreferences] = useState({
    maxTime: '',
    difficulty: '',
    cuisine: '',
    dietary: ''
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Debounced ingredient suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length > 1) {
        fetchSuggestions(inputValue.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Load user preferences
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        difficulty: user.preferences.skillLevel || '',
        dietary: user.preferences.dietaryRestrictions?.[0] || '',
        cuisine: user.preferences.cuisinePreferences?.[0] || ''
      }));
    }
  }, [user]);

  const fetchSuggestions = async (query) => {
    try {
      // For demo purposes, we'll use a simple client-side suggestion system
      // In a real app, you'd call an API endpoint
      const commonIngredients = [
        'chicken breast', 'ground beef', 'salmon', 'eggs', 'tofu',
        'onion', 'garlic', 'tomato', 'bell pepper', 'carrot', 'broccoli', 'spinach',
        'rice', 'pasta', 'flour', 'bread',
        'milk', 'cheese', 'butter', 'yogurt',
        'salt', 'black pepper', 'cumin', 'paprika', 'oregano', 'basil',
        'olive oil', 'soy sauce', 'vinegar'
      ];

      const filtered = commonIngredients
        .filter(ingredient => 
          ingredient.toLowerCase().includes(query.toLowerCase()) &&
          !ingredients.some(ing => ing.toLowerCase() === ingredient.toLowerCase())
        )
        .slice(0, 8);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const addIngredient = (ingredient) => {
    const trimmedIngredient = ingredient.trim();
    if (trimmedIngredient && !ingredients.some(ing => ing.toLowerCase() === trimmedIngredient.toLowerCase())) {
      setIngredients(prev => [...prev, trimmedIngredient]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addIngredient(inputValue);
      }
    }
  };

  const findRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    setSearchingRecipes(true);
    try {
      const response = await axios.post('/api/recipes/match', {
        ingredients,
        preferences: {
          ...preferences,
          maxTime: preferences.maxTime ? parseInt(preferences.maxTime) : undefined,
          dietaryRestrictions: preferences.dietary ? [preferences.dietary] : [],
          cuisinePreferences: preferences.cuisine ? [preferences.cuisine] : []
        }
      });

      setMatchedRecipes(response.data.data);
      
      if (response.data.data.length === 0) {
        toast.info('No recipes found with your ingredients. Try adding more ingredients or adjusting your preferences.');
      } else {
        toast.success(`Found ${response.data.data.length} matching recipes!`);
      }
    } catch (error) {
      console.error('Error finding recipes:', error);
      toast.error('Failed to find recipes. Please try again.');
    } finally {
      setSearchingRecipes(false);
    }
  };

  const clearAll = () => {
    setIngredients([]);
    setMatchedRecipes([]);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const cuisineOptions = ['Indian', 'Italian', 'Mexican', 'Chinese', 'American', 'Mediterranean', 'Thai', 'Desserts'];
  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What's in Your Kitchen?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter the ingredients you have available, and we'll find the perfect recipes for you with our smart matching algorithm.
          </p>
        </motion.div>

        {/* Ingredient Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPress}
                placeholder="Type an ingredient (e.g., chicken, tomatoes, rice)..."
                className="input pl-10 text-lg"
              />
              
              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => addIngredient(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="text-gray-900 dark:text-gray-100 capitalize">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => addIngredient(inputValue)}
              disabled={!inputValue.trim()}
              className="btn btn-primary px-6 py-3 text-lg font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus size={20} />
              <span>Add</span>
            </button>
          </div>

          {/* Added Ingredients */}
          <AnimatePresence>
            {ingredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Ingredients ({ingredients.length})
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex items-center space-x-1"
                  >
                    <FiRefreshCw size={14} />
                    <span>Clear All</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-2 rounded-full text-sm font-medium"
                    >
                      <span className="capitalize">{ingredient}</span>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                      >
                        <FiX size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preferences Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <FiFilter size={16} />
              <span>Preferences & Filters</span>
            </button>
          </div>

          {/* Preferences Section */}
          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Cooking Time
                  </label>
                  <select
                    value={preferences.maxTime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, maxTime: e.target.value }))}
                    className="input text-sm"
                  >
                    <option value="">Any time</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={preferences.difficulty}
                    onChange={(e) => setPreferences(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="input text-sm"
                  >
                    <option value="">Any level</option>
                    {difficultyOptions.map(option => (
                      <option key={option} value={option} className="capitalize">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={preferences.cuisine}
                    onChange={(e) => setPreferences(prev => ({ ...prev, cuisine: e.target.value }))}
                    className="input text-sm"
                  >
                    <option value="">Any cuisine</option>
                    {cuisineOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dietary Preference
                  </label>
                  <select
                    value={preferences.dietary}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dietary: e.target.value }))}
                    className="input text-sm"
                  >
                    <option value="">No restrictions</option>
                    {dietaryOptions.map(option => (
                      <option key={option} value={option} className="capitalize">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Find Recipes Button */}
          <div className="flex justify-center">
            <button
              onClick={findRecipes}
              disabled={ingredients.length === 0 || searchingRecipes}
              className="btn btn-secondary px-8 py-3 text-lg font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {searchingRecipes ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <FiUser size={20} />
                  <span>Find Recipes</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Recipe Results */}
        <AnimatePresence>
          {matchedRecipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recipe Matches ({matchedRecipes.length})
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiStar size={16} />
                  <span>Sorted by match score</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <RecipeCard recipe={recipe} showMatchInfo={true} />
                  </motion.div>
                ))}
              </div>

              {/* View All Recipes Link */}
              <div className="text-center mt-8">
                <button
                  onClick={() => navigate('/recipes')}
                  className="btn btn-outline px-6 py-3 text-lg font-semibold flex items-center space-x-2 mx-auto hover:scale-105 transition-transform duration-200"
                >
                  <span>Browse All Recipes</span>
                  <FiArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {ingredients.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUser size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Start Adding Ingredients
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Add the ingredients you have in your kitchen, and we'll suggest delicious recipes you can make right now.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Ingredients;