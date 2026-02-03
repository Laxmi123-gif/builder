import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiUsers, 
  FiStar, 
  FiHeart,
  FiUser,
  FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

const RecipeCard = ({ recipe, showMatchInfo = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, addToFavorites, removeFromFavorites } = useAuth();

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        await removeFromFavorites(recipe._id);
        setIsLiked(false);
      } else {
        await addToFavorites(recipe._id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="w-4 h-4 fill-current text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <FiStar className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <FiStar className="w-4 h-4 fill-current text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="recipe-card card overflow-hidden group"
    >
      <Link to={`/recipes/${recipe._id}`} className="block">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Favorite Button */}
          <button
            onClick={handleLikeToggle}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          >
            <FiHeart 
              className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`} 
            />
          </button>

          {/* Match Percentage (if showing match info) */}
          {showMatchInfo && recipe.matchPercentage && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold flex items-center space-x-1">
              <FiTrendingUp size={12} />
              <span>{recipe.matchPercentage}% match</span>
            </div>
          )}

          {/* Cuisine Badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-medium">
            {recipe.cuisine}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FiClock size={14} />
                <span>{recipe.totalTime || recipe.prepTime + recipe.cookTime}m</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiUsers size={14} />
                <span>{recipe.servings}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiUser size={14} />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(recipe.averageRating || 0)}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {recipe.averageRating ? recipe.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                ({recipe.totalRatings || 0})
              </span>
            </div>

            {/* Dietary Info */}
            {recipe.dietaryInfo && recipe.dietaryInfo.length > 0 && (
              <div className="flex items-center space-x-1">
                {recipe.dietaryInfo.slice(0, 2).map((diet) => (
                  <span
                    key={diet}
                    className="px-2 py-1 text-xs font-medium bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full"
                  >
                    {diet}
                  </span>
                ))}
                {recipe.dietaryInfo.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{recipe.dietaryInfo.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Match Details (if showing match info) */}
          {showMatchInfo && recipe.matchDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Matched: {recipe.matchedIngredients}/{recipe.totalIngredients} ingredients
              </div>
              <div className="flex flex-wrap gap-1">
                {recipe.matchDetails.slice(0, 3).map((match, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${
                      match.matchType === 'exact'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : match.matchType === 'partial'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {match.ingredient}
                  </span>
                ))}
                {recipe.matchDetails.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    +{recipe.matchDetails.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;