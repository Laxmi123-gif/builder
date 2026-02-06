import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchRecipes = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      });

      const response = await axios.get(`/api/admin/recipes?${params}`);
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
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleStatusToggle = async (recipeId, currentStatus) => {
    try {
      await axios.put(`/api/admin/recipes/${recipeId}`, {
        isPublished: !currentStatus
      });
      
      toast.success(`Recipe ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe status:', error);
      toast.error('Failed to update recipe status');
    }
  };

  const handleDelete = async (recipeId, recipeName) => {
    if (!window.confirm(`Are you sure you want to delete "${recipeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/recipes/${recipeId}`);
      toast.success('Recipe deleted successfully');
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Recipe Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage all recipes in your platform
            </p>
          </div>
          
          <button className="btn btn-primary flex items-center space-x-2">
            <FiPlus size={16} />
            <span>Add Recipe</span>
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">All Recipes</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </motion.div>

        {/* Recipes Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first recipe'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Recipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cuisine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {recipes.map((recipe) => (
                      <tr key={recipe._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={recipe.image || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=100'}
                              alt={recipe.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=100';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {recipe.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {recipe.totalTime}m • {recipe.servings} servings
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {recipe.cuisine}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getDifficultyColor(recipe.difficulty)}`}>
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {recipe.averageRating ? recipe.averageRating.toFixed(1) : '0.0'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {recipe.totalRatings || 0} ratings
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusToggle(recipe._id, recipe.isPublished)}
                            className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                              recipe.isPublished
                                ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'
                                : 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {recipe.isPublished ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                            <span>{recipe.isPublished ? 'Published' : 'Draft'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(recipe._id, recipe.title)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
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
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRecipes;