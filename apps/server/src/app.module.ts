import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { McpModule } from './mcp/mcp.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { MealPlansModule } from './meal-plans/meal-plans.module.js';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    SupabaseModule,
    McpModule,
    RecipesModule,
    MealPlansModule,
    ShoppingListsModule,
    UsersModule,
  ],
})
export class AppModule {}
