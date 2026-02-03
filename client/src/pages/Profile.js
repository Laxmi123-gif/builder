import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiSettings, FiHeart, FiClock, FiStar } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [cookingHistory, setCookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      preferences: {
        dietaryRestrictions: user?.preferences?.dietaryRestrictions || [],
        cuisinePreferences: user?.preferences?.cuisinePreferences || [],
        skillLevel: user?.preferences?.skillLevel || 'beginner'
      }
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        preferences: {
          dietaryRestrictions: user.preferences?.dietaryRestrictions || [],
          cuisinePreferences: user.preferences?.cuisinePreferences || [],
          skillLevel: user.preferences?.skillLevel || 'beginner'
        }
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchCookingHistory();
    }
  }, [activeTab]);

  const fetchCookingHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/cooking-history');
      setCookingHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching cooking history:', error);
      toast.error('Failed to load cooking history');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile updated successfully!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'preferences', label: 'Preferences', icon: FiSettings },
    { id: 'history', label: 'Cooking History', icon: FiClock },
  ];

  const cuisineOptions = ['Indian', 'Italian', 'Mexican', 'Chinese', 'American', 'Mediterranean', 'Thai', 'Desserts'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-4 h-4 ${
            i <= rating 
              ? 'fill-current text-yellow-400' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

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
          <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {user?.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {user?.email}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-0 mb-8 overflow-hidden"
        >
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        {...register('email')}
                        type="email"
                        disabled
                        className="input pl-10 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                        placeholder="Email cannot be changed"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Email address cannot be changed for security reasons
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="small" color="white" />
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skill Level
                  </label>
                  <select
                    {...register('preferences.skillLevel')}
                    className="input"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dietary Restrictions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={option}
                          {...register('preferences.dietaryRestrictions')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favorite Cuisines
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cuisineOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={option}
                          {...register('preferences.cuisinePreferences')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    'Save Preferences'
                  )}
                </button>
              </motion.div>
            )}

            {/* Cooking History Tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="medium" />
                  </div>
                ) : cookingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FiClock size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No cooking history yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start cooking recipes and rating them to build your cooking history!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cookingHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <img
                          src={entry.recipe.image || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=100'}
                          alt={entry.recipe.title}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=100';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {entry.recipe.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cooked on {new Date(entry.cookedAt).toLocaleDateString()}
                          </p>
                          {entry.rating && (
                            <div className="flex items-center space-x-1 mt-1">
                              {renderStars(entry.rating)}
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                {entry.rating}/5
                              </span>
                            </div>
                          )}
                          {entry.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="card p-6 text-center">
            <FiHeart className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user?.favorites?.length || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Favorite Recipes
            </div>
          </div>

          <div className="card p-6 text-center">
            <FiClock className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user?.cookingHistory?.length || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Recipes Cooked
            </div>
          </div>

          <div className="card p-6 text-center">
            <FiStar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user?.cookingHistory?.filter(h => h.rating).length || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Recipes Rated
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;