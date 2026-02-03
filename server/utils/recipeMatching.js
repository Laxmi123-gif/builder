const Recipe = require('../models/Recipe');

/**
 * Advanced recipe matching algorithm
 * Matches recipes based on available ingredients with scoring system
 * 
 * Scoring criteria:
 * - Exact ingredient matches: +10 points
 * - Partial matches (substring): +5 points
 * - Substitute matches: +3 points
 * - Recipe complexity bonus: beginner +2, intermediate +1, advanced +0
 * - Dietary preference match: +5 points
 * - Cuisine preference match: +3 points
 * - Cooking time bonus: <30min +3, <60min +1
 */

const matchRecipesByIngredients = async (userIngredients, preferences = {}) => {
  try {
    // Normalize user ingredients (lowercase, trim)
    const normalizedUserIngredients = userIngredients.map(ing => 
      ing.toLowerCase().trim()
    );

    // Get all published recipes
    const allRecipes = await Recipe.find({ isPublished: true })
      .populate('createdBy', 'name')
      .lean();

    const scoredRecipes = [];

    for (const recipe of allRecipes) {
      let score = 0;
      let matchedIngredients = 0;
      let totalIngredients = recipe.ingredients.length;
      let missingIngredients = [];
      let matchDetails = [];

      // Score based on ingredient matching
      for (const recipeIngredient of recipe.ingredients) {
        const recipeIngName = recipeIngredient.name.toLowerCase();
        let ingredientMatched = false;

        // Check for exact matches
        for (const userIng of normalizedUserIngredients) {
          if (recipeIngName === userIng) {
            score += 10;
            matchedIngredients++;
            ingredientMatched = true;
            matchDetails.push({
              ingredient: recipeIngredient.name,
              matchType: 'exact',
              userIngredient: userIng
            });
            break;
          }
        }

        // Check for partial matches if no exact match
        if (!ingredientMatched) {
          for (const userIng of normalizedUserIngredients) {
            if (recipeIngName.includes(userIng) || userIng.includes(recipeIngName)) {
              score += 5;
              matchedIngredients++;
              ingredientMatched = true;
              matchDetails.push({
                ingredient: recipeIngredient.name,
                matchType: 'partial',
                userIngredient: userIng
              });
              break;
            }
          }
        }

        // Check for substitute matches
        if (!ingredientMatched && recipeIngredient.substitutes) {
          for (const substitute of recipeIngredient.substitutes) {
            const substituteName = substitute.toLowerCase();
            for (const userIng of normalizedUserIngredients) {
              if (substituteName === userIng || substituteName.includes(userIng)) {
                score += 3;
                matchedIngredients++;
                ingredientMatched = true;
                matchDetails.push({
                  ingredient: recipeIngredient.name,
                  matchType: 'substitute',
                  userIngredient: userIng,
                  substitute: substitute
                });
                break;
              }
            }
            if (ingredientMatched) break;
          }
        }

        // Track missing ingredients
        if (!ingredientMatched) {
          missingIngredients.push(recipeIngredient.name);
        }
      }

      // Calculate match percentage
      const matchPercentage = totalIngredients > 0 ? 
        Math.round((matchedIngredients / totalIngredients) * 100) : 0;

      // Only include recipes with at least 30% ingredient match
      if (matchPercentage < 30) {
        continue;
      }

      // Bonus points for recipe characteristics
      
      // Difficulty bonus (easier recipes get more points)
      if (recipe.difficulty === 'beginner') score += 2;
      else if (recipe.difficulty === 'intermediate') score += 1;

      // Cooking time bonus
      if (recipe.totalTime <= 30) score += 3;
      else if (recipe.totalTime <= 60) score += 1;

      // Dietary preferences bonus
      if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
        const matchingDietary = recipe.dietaryInfo.filter(diet => 
          preferences.dietaryRestrictions.includes(diet)
        );
        score += matchingDietary.length * 5;
      }

      // Cuisine preferences bonus
      if (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 0) {
        if (preferences.cuisinePreferences.includes(recipe.cuisine)) {
          score += 3;
        }
      }

      // Skill level matching
      if (preferences.skillLevel) {
        if (recipe.difficulty === preferences.skillLevel) {
          score += 2;
        }
      }

      // Rating bonus
      if (recipe.averageRating > 0) {
        score += Math.round(recipe.averageRating);
      }

      // Add to scored recipes
      scoredRecipes.push({
        ...recipe,
        matchScore: score,
        matchPercentage,
        matchedIngredients,
        totalIngredients,
        missingIngredients,
        matchDetails,
        canMakeWithSubstitutes: missingIngredients.length <= 2 // Can make if missing 2 or fewer ingredients
      });
    }

    // Sort by match score (highest first) and then by rating
    scoredRecipes.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.averageRating - a.averageRating;
    });

    // Return top 20 matches
    return scoredRecipes.slice(0, 20).map(recipe => ({
      _id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      averageRating: recipe.averageRating,
      totalRatings: recipe.totalRatings,
      dietaryInfo: recipe.dietaryInfo,
      tags: recipe.tags,
      createdBy: recipe.createdBy,
      
      // Matching information
      matchScore: recipe.matchScore,
      matchPercentage: recipe.matchPercentage,
      matchedIngredients: recipe.matchedIngredients,
      totalIngredients: recipe.totalIngredients,
      missingIngredients: recipe.missingIngredients,
      canMakeWithSubstitutes: recipe.canMakeWithSubstitutes,
      matchDetails: recipe.matchDetails
    }));

  } catch (error) {
    console.error('Recipe matching error:', error);
    throw new Error('Failed to match recipes');
  }
};

/**
 * Get ingredient suggestions based on partial input
 */
const getIngredientSuggestions = async (partialIngredient, limit = 10) => {
  try {
    const Ingredient = require('../models/Ingredient');
    
    const suggestions = await Ingredient.find({
      $or: [
        { name: { $regex: partialIngredient, $options: 'i' } },
        { displayName: { $regex: partialIngredient, $options: 'i' } },
        { aliases: { $regex: partialIngredient, $options: 'i' } }
      ]
    })
    .sort({ isCommon: -1, name: 1 })
    .limit(limit)
    .select('name displayName category');

    return suggestions;
  } catch (error) {
    console.error('Ingredient suggestions error:', error);
    return [];
  }
};

/**
 * Find substitute ingredients for a given ingredient
 */
const findSubstitutes = async (ingredientName) => {
  try {
    const Ingredient = require('../models/Ingredient');
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: ingredientName.toLowerCase() },
        { displayName: new RegExp(ingredientName, 'i') },
        { aliases: new RegExp(ingredientName, 'i') }
      ]
    });

    if (ingredient && ingredient.substitutes) {
      return ingredient.substitutes;
    }

    return [];
  } catch (error) {
    console.error('Find substitutes error:', error);
    return [];
  }
};

module.exports = {
  matchRecipesByIngredients,
  getIngredientSuggestions,
  findSubstitutes
};