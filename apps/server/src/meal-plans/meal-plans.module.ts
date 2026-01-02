import { Global, Module } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service.js';

@Global()
@Module({
  providers: [MealPlansService],
  exports: [MealPlansService],
})
export class MealPlansModule {}
