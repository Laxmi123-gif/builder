import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

import LoadingSpinner from '../components/ui/LoadingSpinner';
import RecipeCard from '../components/recipes/RecipeCard';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    difficulty: searchParams.get('difficulty') || '',
    maxTime: searchParams.get('maxTime') || '',
    dietary: searchParams.get('dietary') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchRecipes = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(`/api/recipes?${params}`);
      setRecipes(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
    
    // Reset to first page
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      cuisine: '',
      difficulty: '',
      maxTime: '',
      dietary: '',
      sortBy: 'newest'
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const cuisineOptions = ['Indian', 'Italian', 'Mexican', 'Chinese', 'American', 'Mediterranean', 'Thai', 'Desserts'];
  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Amazing Recipes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse our collection of delicious recipes from around the world
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search recipes..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <FiFilter size={16} />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="input text-sm"
              >
                <option value="">All Cuisines</option>
                {cuisineOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="input text-sm"
              >
                <option value="">All Levels</option>
                {difficultyOptions.map(option => (
                  <option key={option} value={option} className="capitalize">{option}</option>
                ))}
              </select>

              <select
                value={filters.maxTime}
                onChange={(e) => handleFilterChange('maxTime', e.target.value)}
                className="input text-sm"
              >
                <option value="">Any Time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>

              <select
                value={filters.dietary}
                onChange={(e) => handleFilterChange('dietary', e.target.value)}
                className="input text-sm"
              >
                <option value="">All Diets</option>
                {dietaryOptions.map(option => (
                  <option key={option} value={option} className="capitalize">{option}</option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input text-sm"
              >
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="time">Cooking Time</option>
              </select>
            </motion.div>
          )}

          {/* Active Filters */}
          {Object.values(filters).some(v => v && v !== 'newest') && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === 'newest') return null;
                  return (
                    <span
                      key={key}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                    >
                      {key}: {value}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            {/* Recipe Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}
            >
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center mt-12"
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipes;