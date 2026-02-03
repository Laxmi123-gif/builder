import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiUsers, 
  FiStar, 
  FiHeart,
  FiUser,
  FiArrowLeft,
  FiShare2,
  FiPrinter
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const { isAuthenticated, user, addToFavorites, removeFromFavorites } = useAuth();

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data.data);
      setIsFavorited(response.data.data.isFavorited || false);
      
      // Check if user has already rated this recipe
      if (user && response.data.data.ratings) {
        const existingRating = response.data.data.ratings.find(
          r => r.user._id === user.id
        );
        if (existingRating) {
          setUserRating(existingRating.rating);
          setReview(existingRating.review || '');
        }
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    try {
      if (isFavorited) {
        await removeFromFavorites(recipe._id);
        setIsFavorited(false);
      } else {
        await addToFavorites(recipe._id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRatingSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to rate recipes');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      await axios.post(`/api/recipes/${recipe._id}/rate`, {
        rating: userRating,
        review: review.trim()
      });

      toast.success('Rating submitted successfully!');
      fetchRecipe(); // Refresh recipe data
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => interactive && onStarClick && onStarClick(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
          disabled={!interactive}
        >
          <FiStar
            className={`w-5 h-5 ${
              i <= rating 
                ? 'fill-current text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe not found
          </h1>
          <button
            onClick={() => navigate('/recipes')}
            className="btn btn-primary"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=1200'}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <FiArrowLeft size={20} />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex space-x-3">
          <button
            onClick={handleFavoriteToggle}
            className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 transition-all duration-200"
          >
            <FiHeart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
          </button>
          <button className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200">
            <FiShare2 size={20} />
          </button>
          <button className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200">
            <FiPrinter size={20} />
          </button>
        </div>

        {/* Recipe Title */}
        <div className="absolute bottom-6 left-6 right-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {recipe.title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-white/90"
          >
            <div className="flex items-center space-x-1">
              <FiClock size={16} />
              <span>{recipe.totalTime}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers size={16} />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUser size={16} />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {renderStars(recipe.averageRating || 0)}
              <span className="ml-2">
                {recipe.averageRating ? recipe.averageRating.toFixed(1) : '0.0'} ({recipe.totalRatings || 0})
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Recipe
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {recipe.description}
              </p>
              
              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Ingredients */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Ingredients
              </h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded"></div>
                    <span className="text-gray-900 dark:text-gray-100">
                      <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>{' '}
                      <span className="capitalize">{ingredient.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Instructions
              </h2>
              <div className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                        {instruction.instruction}
                      </p>
                      {instruction.duration && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <FiClock className="inline w-4 h-4 mr-1" />
                          {instruction.duration} minutes
                        </p>
                      )}
                      {instruction.tips && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 italic">
                          💡 {instruction.tips}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition Info */}
            {recipe.nutrition && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Nutrition (per serving)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Calories</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {recipe.nutrition.calories}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Protein</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {recipe.nutrition.protein}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {recipe.nutrition.carbs}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fat</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {recipe.nutrition.fat}g
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rate Recipe */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rate This Recipe
                </h3>
                
                <div className="flex items-center space-x-1 mb-4">
                  {renderStars(userRating, true, setUserRating)}
                </div>
                
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Write a review (optional)..."
                  className="input mb-4 h-20 resize-none"
                />
                
                <button
                  onClick={handleRatingSubmit}
                  disabled={submittingRating || userRating === 0}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingRating ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    'Submit Rating'
                  )}
                </button>
              </motion.div>
            )}

            {/* Recipe Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recipe Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cuisine</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {recipe.cuisine}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Prep Time</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {recipe.prepTime}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cook Time</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {recipe.cookTime}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {recipe.views || 0}
                  </span>
                </div>
              </div>
              
              {/* Dietary Info */}
              {recipe.dietaryInfo && recipe.dietaryInfo.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Dietary Information
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.dietaryInfo.map((diet, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full text-xs font-medium capitalize"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;