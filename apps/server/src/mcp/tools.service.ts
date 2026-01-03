import { Injectable } from '@nestjs/common';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { RecipesService } from '../recipes/recipes.service.js';
import { MealPlansService } from '../meal-plans/meal-plans.service.js';
import { ShoppingListsService } from '../shopping-lists/shopping-lists.service.js';
import { UsersService } from '../users/users.service.js';
import { WidgetsService } from './widgets.service.js';

// Tool input schemas
const SaveRecipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
    notes: z.string().optional(),
  })),
  instructions: z.array(z.string()),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
  }),
  servings: z.number(),
  prep_time_minutes: z.number(),
  cook_time_minutes: z.number(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
});

const GetRecipesSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  favorites_only: z.boolean().optional(),
  limit: z.number().optional(),
});

const CreateMealPlanSchema = z.object({
  name: z.string(),
  start_date: z.string(),
  days: z.number().min(1).max(14),
  goals: z.object({
    daily_calories: z.number().optional(),
    protein_grams: z.number().optional(),
    carbs_grams: z.number().optional(),
    fat_grams: z.number().optional(),
  }).optional(),
  family_member_ids: z.array(z.string()).optional(),
  meals: z.array(z.object({
    date: z.string(),
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    recipe_id: z.string().optional(),
    recipe_title: z.string().optional(),
    notes: z.string().optional(),
  })),
});

const GenerateShoppingListSchema = z.object({
  meal_plan_id: z.string(),
  name: z.string().optional(),
});

const ShowRecipesSchema = z.object({
  category: z.string().optional(),
});
const ShowRecipeDetailSchema = z.object({
  recipe_id: z.string(),
});
const ShowMealPlanSchema = z.object({
  meal_plan_id: z.string().optional(),
});
const ShowShoppingListSchema = z.object({
  shopping_list_id: z.string().optional(),
});

const ToggleShoppingItemSchema = z.object({
  shopping_list_id: z.string(),
  item_index: z.number(),
  checked: z.boolean(),
});

const UpdateUserGoalsSchema = z.object({
  daily_calories: z.number().optional(),
  protein_grams: z.number().optional(),
  carbs_grams: z.number().optional(),
  fat_grams: z.number().optional(),
  dietary_restrictions: z.array(z.string()).optional(),
});

const DeleteRecipeSchema = z.object({
  recipe_id: z.string(),
});

// Define return type for tool calls
interface ToolResult {
  content: Array<{ type: string; text: string }>;
  structuredContent: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}

@Injectable()
export class ToolsService {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly mealPlansService: MealPlansService,
    private readonly shoppingListsService: ShoppingListsService,
    private readonly usersService: UsersService,
    private readonly widgetsService: WidgetsService,
  ) {}

  getTools(): Tool[] {
    return [
      // Data tools
      {
        name: 'save_recipe',
        title: 'Save Recipe',
        description: 'Save a recipe to the user\'s collection. Use this after generating a recipe.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Recipe title' },
            description: { type: 'string', description: 'Brief description' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  amount: { type: 'number' },
                  unit: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['name', 'amount', 'unit'],
              },
            },
            instructions: { type: 'array', items: { type: 'string' } },
            nutrition: {
              type: 'object',
              properties: {
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' },
                fiber: { type: 'number' },
                sugar: { type: 'number' },
                sodium: { type: 'number' },
              },
              required: ['calories', 'protein', 'carbs', 'fat'],
            },
            servings: { type: 'number' },
            prep_time_minutes: { type: 'number' },
            cook_time_minutes: { type: 'number' },
            category: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'] },
            tags: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'ingredients', 'instructions', 'nutrition', 'servings', 'prep_time_minutes', 'cook_time_minutes', 'category'],
        },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: false,
        },
      },
      {
        name: 'get_recipes',
        title: 'Get Recipes',
        description: 'Retrieve saved recipes. Can filter by category, search term, or favorites.',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by category' },
            search: { type: 'string', description: 'Search term' },
            favorites_only: { type: 'boolean', description: 'Only return favorites' },
            limit: { type: 'number', description: 'Max number of recipes' },
          },
        },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
      {
        name: 'create_meal_plan',
        title: 'Create Meal Plan',
        description: 'Create a meal plan for specified days. Can include dietary goals and family members.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Meal plan name' },
            start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            days: { type: 'number', description: 'Number of days (1-14)' },
            goals: {
              type: 'object',
              properties: {
                daily_calories: { type: 'number' },
                protein_grams: { type: 'number' },
                carbs_grams: { type: 'number' },
                fat_grams: { type: 'number' },
              },
            },
            family_member_ids: { type: 'array', items: { type: 'string' } },
            meals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                  recipe_id: { type: 'string' },
                  recipe_title: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['date', 'type'],
              },
            },
          },
          required: ['name', 'start_date', 'days', 'meals'],
        },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: false,
        },
      },
      {
        name: 'generate_shopping_list',
        title: 'Generate Shopping List',
        description: 'Generate a shopping list from a meal plan by aggregating all ingredients.',
        inputSchema: {
          type: 'object',
          properties: {
            meal_plan_id: { type: 'string', description: 'ID of the meal plan' },
            name: { type: 'string', description: 'Optional name for the list' },
          },
          required: ['meal_plan_id'],
        },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: false,
        },
      },
      {
        name: 'toggle_shopping_item',
        title: 'Toggle Shopping Item',
        description: 'Check or uncheck a shopping list item.',
        inputSchema: {
          type: 'object',
          properties: {
            shopping_list_id: { type: 'string', description: 'ID of the shopping list' },
            item_index: { type: 'number', description: 'Index of item to toggle' },
            checked: { type: 'boolean', description: 'New checked state' },
          },
          required: ['shopping_list_id', 'item_index', 'checked'],
        },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: false,
        },
      },
      {
        name: 'delete_recipe',
        title: 'Delete Recipe',
        description: 'Delete a recipe from the user\'s collection.',
        inputSchema: {
          type: 'object',
          properties: {
            recipe_id: { type: 'string', description: 'ID of recipe to delete' },
          },
          required: ['recipe_id'],
        },
        annotations: {
          destructiveHint: true,
          openWorldHint: false,
          readOnlyHint: false,
        },
      },
      {
        name: 'get_user_profile',
        title: 'Get User Profile',
        description: 'Get the user\'s profile including dietary goals and restrictions.',
        inputSchema: { type: 'object', properties: {} },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
      {
        name: 'update_user_goals',
        title: 'Update User Goals',
        description: 'Update the user\'s dietary goals and restrictions.',
        inputSchema: {
          type: 'object',
          properties: {
            daily_calories: { type: 'number', description: 'Target daily calories' },
            protein_grams: { type: 'number', description: 'Target protein in grams' },
            carbs_grams: { type: 'number', description: 'Target carbs in grams' },
            fat_grams: { type: 'number', description: 'Target fat in grams' },
            dietary_restrictions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of dietary restrictions (vegetarian, gluten-free, etc.)',
            },
          },
        },
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: false,
        },
      },
      // UI tools
      {
        name: 'show_dashboard',
        title: 'Show Dashboard',
        description: 'Display the MealMate dashboard with overview of recipes, meal plans, and quick actions.',
        inputSchema: { type: 'object', properties: {} },
        _meta: this.widgetsService.getWidgetMeta(this.widgetsService.getWidgetById('mealmate-dashboard')!),
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
      {
        name: 'show_recipes',
        title: 'Show Recipes',
        description: 'Display the user\'s saved recipes in a list view.',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by category' },
          },
        },
        _meta: this.widgetsService.getWidgetMeta(this.widgetsService.getWidgetById('mealmate-recipes')!),
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
      {
        name: 'show_recipe_detail',
        title: 'Show Recipe Details',
        description: 'Display detailed view of a specific recipe.',
        inputSchema: {
          type: 'object',
          properties: {
            recipe_id: { type: 'string', description: 'ID of the recipe to show' },
          },
          required: ['recipe_id'],
        },
        _meta: this.widgetsService.getWidgetMeta(this.widgetsService.getWidgetById('mealmate-recipe-detail')!),
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
      {
        name: 'show_meal_plan',
        title: 'Show Meal Plan',
        description: 'Display the current or specified meal plan.',
        inputSchema: {
          type: 'object',
          properties: {
            meal_plan_id: { type: 'string', description: 'ID of meal plan (optional, shows current if omitted)' },
          },
        },
        _meta: this.widgetsService.getWidgetMeta(this.widgetsService.getWidgetById('mealmate-meal-plan')!),
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
      {
        name: 'show_shopping_list',
        title: 'Show Shopping List',
        description: 'Display a shopping list.',
        inputSchema: {
          type: 'object',
          properties: {
            shopping_list_id: { type: 'string', description: 'ID of shopping list (optional)' },
          },
        },
        _meta: this.widgetsService.getWidgetMeta(this.widgetsService.getWidgetById('mealmate-shopping-list')!),
        annotations: {
          destructiveHint: false,
          openWorldHint: false,
          readOnlyHint: true,
        },
      },
    ];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const widget = this.widgetsService.getWidgetById(
      name.replace('show_', 'mealmate-').replace(/_/g, '-')
    );

    // Include full widget meta with outputTemplate for ChatGPT to render the widget
    const invocationMeta: Record<string, unknown> | undefined = widget
      ? this.widgetsService.getWidgetMeta(widget)
      : undefined;

    switch (name) {
      case 'save_recipe': {
        const parsed = SaveRecipeSchema.parse(args);
        const input = {
          title: parsed.title,
          description: parsed.description,
          ingredients: parsed.ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            notes: ing.notes,
          })),
          instructions: parsed.instructions,
          nutrition: {
            calories: parsed.nutrition.calories,
            protein: parsed.nutrition.protein,
            carbs: parsed.nutrition.carbs,
            fat: parsed.nutrition.fat,
            fiber: parsed.nutrition.fiber,
            sugar: parsed.nutrition.sugar,
            sodium: parsed.nutrition.sodium,
          },
          servings: parsed.servings,
          prep_time_minutes: parsed.prep_time_minutes,
          cook_time_minutes: parsed.cook_time_minutes,
          category: parsed.category,
          tags: parsed.tags,
        };
        const recipe = await this.recipesService.create(input);
        return {
          content: [{ type: 'text', text: `Recipe "${recipe.title}" saved successfully!` }],
          structuredContent: { recipe_id: recipe.id, ...input },
        };
      }

      case 'get_recipes': {
        const input = GetRecipesSchema.parse(args);
        const recipes = await this.recipesService.findAll(input);
        return {
          content: [{ type: 'text', text: `Found ${recipes.length} recipes.` }],
          structuredContent: { recipes },
        };
      }

      case 'create_meal_plan': {
        const parsed = CreateMealPlanSchema.parse(args);
        const input = {
          name: parsed.name,
          start_date: parsed.start_date,
          days: parsed.days,
          goals: parsed.goals,
          family_member_ids: parsed.family_member_ids,
          meals: parsed.meals.map((m) => ({
            date: m.date,
            type: m.type,
            recipe_id: m.recipe_id,
            recipe_title: m.recipe_title,
            notes: m.notes,
          })),
        };
        const mealPlan = await this.mealPlansService.create(input);
        return {
          content: [{ type: 'text', text: `Meal plan "${mealPlan.name}" created successfully!` }],
          structuredContent: { meal_plan_id: mealPlan.id, ...input },
        };
      }

      case 'generate_shopping_list': {
        const input = GenerateShoppingListSchema.parse(args);
        const list = await this.shoppingListsService.generateFromMealPlan(input.meal_plan_id, input.name);
        return {
          content: [{ type: 'text', text: `Shopping list generated with ${list.items.length} items.` }],
          structuredContent: { shopping_list_id: list.id, items: list.items },
        };
      }

      case 'toggle_shopping_item': {
        const input = ToggleShoppingItemSchema.parse(args);
        await this.shoppingListsService.toggleItem(
          input.shopping_list_id,
          input.item_index,
          input.checked
        );
        return {
          content: [{ type: 'text', text: `Item ${input.checked ? 'checked' : 'unchecked'}.` }],
          structuredContent: { success: true },
        };
      }

      case 'delete_recipe': {
        const input = DeleteRecipeSchema.parse(args);
        await this.recipesService.delete(input.recipe_id);
        return {
          content: [{ type: 'text', text: 'Recipe deleted successfully.' }],
          structuredContent: { success: true },
        };
      }

      case 'get_user_profile': {
        const profile = await this.usersService.getProfile();
        return {
          content: [{ type: 'text', text: 'User profile retrieved.' }],
          structuredContent: { profile },
        };
      }

      case 'update_user_goals': {
        const input = UpdateUserGoalsSchema.parse(args);
        const updated = await this.usersService.updateGoals(input);
        return {
          content: [{ type: 'text', text: 'Goals updated successfully.' }],
          structuredContent: { goals: updated },
        };
      }

      // UI tools
      case 'show_dashboard':
        return {
          content: [{ type: 'text', text: 'Displaying your MealMate dashboard.' }],
          structuredContent: {},
          _meta: invocationMeta,
        };

      case 'show_recipes': {
        const input = ShowRecipesSchema.parse(args);
        return {
          content: [{ type: 'text', text: 'Displaying your recipes.' }],
          structuredContent: { category: input.category },
          _meta: invocationMeta,
        };
      }

      case 'show_recipe_detail': {
        const input = ShowRecipeDetailSchema.parse(args);
        return {
          content: [{ type: 'text', text: 'Displaying recipe details.' }],
          structuredContent: { recipe_id: input.recipe_id },
          _meta: invocationMeta,
        };
      }

      case 'show_meal_plan': {
        const input = ShowMealPlanSchema.parse(args);
        return {
          content: [{ type: 'text', text: 'Displaying your meal plan.' }],
          structuredContent: { meal_plan_id: input.meal_plan_id },
          _meta: invocationMeta,
        };
      }

      case 'show_shopping_list': {
        const input = ShowShoppingListSchema.parse(args);
        return {
          content: [{ type: 'text', text: 'Displaying your shopping list.' }],
          structuredContent: { shopping_list_id: input.shopping_list_id },
          _meta: invocationMeta,
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
