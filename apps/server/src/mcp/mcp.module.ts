import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller.js';
import { McpService } from './mcp.service.js';
import { ToolsService } from './tools.service.js';
import { WidgetsService } from './widgets.service.js';
import { RecipesModule } from '../recipes/recipes.module.js';
import { MealPlansModule } from '../meal-plans/meal-plans.module.js';
import { ShoppingListsModule } from '../shopping-lists/shopping-lists.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [RecipesModule, MealPlansModule, ShoppingListsModule, UsersModule],
  controllers: [McpController],
  providers: [McpService, ToolsService, WidgetsService],
  exports: [McpService],
})
export class McpModule {}
